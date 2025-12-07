import { getPrismaClient } from '../../database/prisma.js';
import logger from '../../config/logger.js';

export class UsersService {
  private prisma = getPrismaClient();

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
        devices: {
          select: {
            id: true,
            deviceFingerprint: true,
            lastSeen: true,
            batteryLevel: true,
            connectionType: true,
            bandwidthEstimate: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, data: { email?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        email: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId }, 'User profile updated');
    return user;
  }

  async getDevices(userId: string) {
    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        deviceFingerprint: true,
        lastSeen: true,
        batteryLevel: true,
        connectionType: true,
        bandwidthEstimate: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    return devices;
  }

  async updateDeviceInfo(deviceId: string, data: {
    batteryLevel?: number;
    connectionType?: string;
    bandwidthEstimate?: number;
    latitude?: number;
    longitude?: number;
  }) {
    const device = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        ...data,
        lastSeen: new Date(),
      },
    });

    return device;
  }

  async getTrustScore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return { trustScore: user.trustScore };
  }

  async updateTrustScore(userId: string, delta: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newScore = Math.max(0, Math.min(100, user.trustScore + delta));

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { trustScore: newScore },
      select: { trustScore: true },
    });

    logger.info({ userId, delta, newScore }, 'Trust score updated');
    return updated;
  }
}
