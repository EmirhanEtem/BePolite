import { getPrismaClient } from '../../database/prisma.js';
import logger from '../../config/logger.js';

export class SessionsService {
  private prisma = getPrismaClient();

  async startSession(
    providerDeviceId: string,
    requesterDeviceId: string,
    providerUserId: string,
    requesterUserId: string
  ) {
    const session = await this.prisma.providerSession.create({
      data: {
        providerDeviceId,
        requesterDeviceId,
        providerUserId,
        requesterUserId,
        startTime: new Date(),
      },
    });

    logger.info(
      { sessionId: session.id, providerDeviceId, requesterDeviceId },
      'Session started'
    );

    return session;
  }

  async endSession(sessionId: string, totalBytesShared: number = 0) {
    const session = await this.prisma.providerSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        totalBytesShared: BigInt(totalBytesShared),
      },
    });

    logger.info({ sessionId, totalBytesShared }, 'Session ended');
    return session;
  }

  async getSessionById(sessionId: string) {
    const session = await this.prisma.providerSession.findUnique({
      where: { id: sessionId },
      include: {
        providerDevice: true,
        requesterDevice: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  async getUserSessions(userId: string, limit: number = 50) {
    const sessions = await this.prisma.providerSession.findMany({
      where: {
        OR: [
          { providerUserId: userId },
          { requesterUserId: userId },
        ],
      },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        providerDevice: {
          include: {
            user: {
              select: { phone: true, trustScore: true },
            },
          },
        },
        requesterDevice: {
          include: {
            user: {
              select: { phone: true, trustScore: true },
            },
          },
        },
      },
    });

    return sessions;
  }

  async getDeviceSessions(deviceId: string, limit: number = 50) {
    const sessions = await this.prisma.providerSession.findMany({
      where: {
        OR: [
          { providerDeviceId: deviceId },
          { requesterDeviceId: deviceId },
        ],
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    return sessions;
  }

  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.providerSession.findMany({
      where: {
        OR: [
          { providerUserId: userId },
          { requesterUserId: userId },
        ],
        endTime: null,
      },
      include: {
        providerDevice: true,
        requesterDevice: true,
      },
    });

    return sessions;
  }

  async getTotalBytesShared(userId: string) {
    const result = await this.prisma.providerSession.aggregate({
      where: {
        OR: [
          { providerUserId: userId },
          { requesterUserId: userId },
        ],
      },
      _sum: {
        totalBytesShared: true,
      },
    });

    return {
      totalBytes: result._sum.totalBytesShared || BigInt(0),
    };
  }
}
