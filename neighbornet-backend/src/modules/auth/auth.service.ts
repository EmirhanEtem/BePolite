import { getPrismaClient } from '../../database/prisma.js';
import { 
  hashPassword, 
  comparePassword, 
  generateDeviceFingerprint 
} from '../../utils/crypto.js';
import { 
  signAccessToken, 
  signRefreshToken,
  verifyRefreshToken 
} from '../../utils/tokens.js';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from './auth.schema.js';
import logger from '../../config/logger.js';

export class AuthService {
  private prisma = getPrismaClient();

  async register(req: RegisterRequest) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: req.phone },
    });

    if (existingUser) {
      throw new Error('User with this phone already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(req.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        phone: req.phone,
        email: req.email,
        passwordHash,
      },
    });

    // Create device
    const device = await this.prisma.device.create({
      data: {
        userId: user.id,
        deviceFingerprint: req.deviceFingerprint,
        batteryLevel: req.batteryLevel || 100,
        connectionType: req.connectionType || '4G',
      },
    });

    // Generate tokens
    const accessToken = signAccessToken(user.id, device.id);
    const refreshToken = signRefreshToken(user.id, 1);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenVersion: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    logger.info({ userId: user.id, deviceId: device.id }, 'User registered');

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        trustScore: user.trustScore,
      },
      device: {
        id: device.id,
        deviceFingerprint: device.deviceFingerprint,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(req: LoginRequest) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phone: req.phone },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(req.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Find or create device
    let device = await this.prisma.device.findUnique({
      where: { deviceFingerprint: req.deviceFingerprint },
    });

    if (!device) {
      device = await this.prisma.device.create({
        data: {
          userId: user.id,
          deviceFingerprint: req.deviceFingerprint,
        },
      });
    } else if (device.userId !== user.id) {
      // Device exists but belongs to another user
      throw new Error('Device already registered to another account');
    }

    // Update last seen
    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() },
    });

    // Generate tokens
    const accessToken = signAccessToken(user.id, device.id);
    const refreshToken = signRefreshToken(user.id, 1);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenVersion: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info({ userId: user.id, deviceId: device.id }, 'User logged in');

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        trustScore: user.trustScore,
      },
      device: {
        id: device.id,
        deviceFingerprint: device.deviceFingerprint,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(req: RefreshTokenRequest) {
    // Verify refresh token
    const payload = verifyRefreshToken(req.refreshToken);

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check token version
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        tokenVersion: payload.tokenVersion,
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = signAccessToken(user.id, ''); // We'll get device from request context
    const newRefreshToken = signRefreshToken(user.id, payload.tokenVersion + 1);

    logger.info({ userId: user.id }, 'Token refreshed');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    // Invalidate all refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info({ userId }, 'User logged out');

    return { success: true };
  }
}
