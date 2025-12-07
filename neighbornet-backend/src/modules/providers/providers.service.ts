import { getPrismaClient } from '../../database/prisma.js';
import { ProviderSelectionService } from './providerSelection.js';
import logger from '../../config/logger.js';

export class ProvidersService {
  private prisma = getPrismaClient();
  private selectionService = new ProviderSelectionService();

  async setAvailability(
    deviceId: string,
    data: {
      isAvailable: boolean;
      hotspotEnabled?: boolean;
      estimatedSpeed?: number;
      maxShareMbps?: number;
    }
  ) {
    let availability = await this.prisma.providerAvailability.findUnique({
      where: { deviceId },
    });

    if (!availability) {
      // Get device user ID
      const device = await this.prisma.device.findUnique({
        where: { id: deviceId },
      });

      if (!device) {
        throw new Error('Device not found');
      }

      availability = await this.prisma.providerAvailability.create({
        data: {
          deviceId,
          userId: device.userId,
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      availability = await this.prisma.providerAvailability.update({
        where: { deviceId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    }

    logger.info({ deviceId, isAvailable: data.isAvailable }, 'Provider availability updated');
    return availability;
  }

  async stopSharing(deviceId: string) {
    const availability = await this.prisma.providerAvailability.update({
      where: { deviceId },
      data: {
        isAvailable: false,
        hotspotEnabled: false,
        updatedAt: new Date(),
      },
    });

    logger.info({ deviceId }, 'Provider stopped sharing');
    return availability;
  }

  async getNearbyProviders(latitude: number, longitude: number, radius: number = 5) {
    const rankings = await this.selectionService.rankProviders(latitude, longitude, radius);
    return rankings;
  }

  async getBestProvider(latitude: number, longitude: number, radius: number = 5) {
    const provider = await this.selectionService.getBestProvider(latitude, longitude, radius);
    return provider;
  }

  async getProviderStatus(deviceId: string) {
    const availability = await this.prisma.providerAvailability.findUnique({
      where: { deviceId },
      include: {
        device: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                trustScore: true,
              },
            },
          },
        },
      },
    });

    if (!availability) {
      throw new Error('Provider not found');
    }

    return {
      ...availability,
      user: availability.device.user,
    };
  }

  async getProviderHistory(deviceId: string, limit: number = 50) {
    const sessions = await this.prisma.providerSession.findMany({
      where: { providerDeviceId: deviceId },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        requesterDevice: {
          include: {
            user: {
              select: {
                phone: true,
                trustScore: true,
              },
            },
          },
        },
      },
    });

    return sessions;
  }
}
