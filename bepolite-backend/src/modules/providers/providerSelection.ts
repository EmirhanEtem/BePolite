import { getPrismaClient } from '../../database/prisma.js';
import { env } from '../../config/env.js';

export interface ProviderRankingResult {
  deviceId: string;
  userId: string;
  distance: number;
  estimatedSpeed: number;
  batteryLevel: number;
  trustScore: number;
  score: number;
}

export class ProviderSelectionService {
  private prisma = getPrismaClient();

  // Calculate distance using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate provider score based on multiple factors
  private calculateScore(ranking: Omit<ProviderRankingResult, 'score'>): number {
    // Weights for each factor (total = 1.0)
    const weights = {
      speed: 0.4,
      battery: 0.3,
      trust: 0.2,
      proximity: 0.1,
    };

    // Normalize factors (0-1)
    const speedScore = Math.min(ranking.estimatedSpeed / 100, 1); // Assume max 100 Mbps
    const batteryScore = ranking.batteryLevel / 100;
    const trustScore = ranking.trustScore / 100;
    const proximityScore = Math.max(0, 1 - ranking.distance / env.NEARBY_RADIUS_KM);

    // Calculate weighted score
    const totalScore =
      speedScore * weights.speed +
      batteryScore * weights.battery +
      trustScore * weights.trust +
      proximityScore * weights.proximity;

    return totalScore;
  }

  async rankProviders(
    latitude: number,
    longitude: number,
    radius: number = env.NEARBY_RADIUS_KM
  ): Promise<ProviderRankingResult[]> {
    // Get all available providers
    const providers = await this.prisma.providerAvailability.findMany({
      where: { isAvailable: true },
      include: {
        device: {
          include: {
            user: true,
          },
        },
      },
    });

    // Calculate rankings
    const rankings: ProviderRankingResult[] = [];

    for (const provider of providers) {
      if (!provider.device.latitude || !provider.device.longitude) {
        continue;
      }

      const distance = this.calculateDistance(
        latitude,
        longitude,
        provider.device.latitude,
        provider.device.longitude
      );

      if (distance > radius) {
        continue;
      }

      const baseRanking = {
        deviceId: provider.device.id,
        userId: provider.device.userId,
        distance,
        estimatedSpeed: provider.estimatedSpeed,
        batteryLevel: provider.device.batteryLevel,
        trustScore: provider.device.user.trustScore,
      };

      const score = this.calculateScore(baseRanking);

      rankings.push({
        ...baseRanking,
        score,
      });
    }

    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);

    return rankings;
  }

  async getBestProvider(
    latitude: number,
    longitude: number,
    radius: number = env.NEARBY_RADIUS_KM
  ): Promise<ProviderRankingResult | null> {
    const rankings = await this.rankProviders(latitude, longitude, radius);
    return rankings.length > 0 ? rankings[0] : null;
  }
}
