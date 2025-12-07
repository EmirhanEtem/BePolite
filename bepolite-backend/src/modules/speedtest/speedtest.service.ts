import { getPrismaClient } from '../../database/prisma.js';
import { env } from '../../config/env.js';
import logger from '../../config/logger.js';

export class SpeedTestService {
  private prisma = getPrismaClient();

  async reportSpeedTest(
    deviceId: string,
    uploadMbps: number,
    downloadMbps: number,
    latencyMs: number
  ) {
    // Validate inputs
    if (uploadMbps < 0 || downloadMbps < 0 || latencyMs < 0) {
      throw new Error('Invalid speed test values');
    }

    const speedTest = await this.prisma.speedTest.create({
      data: {
        deviceId,
        uploadMbps,
        downloadMbps,
        latencyMs,
        timestamp: new Date(),
      },
    });

    // Update device bandwidth estimate (moving average)
    await this.updateDeviceBandwidthEstimate(deviceId, downloadMbps);

    logger.info(
      { deviceId, uploadMbps, downloadMbps, latencyMs },
      'Speed test recorded'
    );

    return speedTest;
  }

  private async updateDeviceBandwidthEstimate(deviceId: string, downloadMbps: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    // Calculate moving average with new value
    const recentTests = await this.prisma.speedTest.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const allValues = [downloadMbps, ...recentTests.map((t: any) => t.downloadMbps)];
    const average = allValues.reduce((a: number, b: number) => a + b, 0) / allValues.length;

    await this.prisma.device.update({
      where: { id: deviceId },
      data: { bandwidthEstimate: average },
    });
  }

  async getDeviceSpeedTests(deviceId: string, limit: number = 50) {
    const tests = await this.prisma.speedTest.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return tests;
  }

  async getDeviceSpeedStats(deviceId: string) {
    const tests = await this.prisma.speedTest.findMany({
      where: { deviceId },
    });

    if (tests.length === 0) {
      return {
        count: 0,
        avgUpload: 0,
        avgDownload: 0,
        avgLatency: 0,
        maxDownload: 0,
        minLatency: 0,
      };
    }

    const uploadSpeeds = tests.map((t: any) => t.uploadMbps);
    const downloadSpeeds = tests.map((t: any) => t.downloadMbps);
    const latencies = tests.map((t: any) => t.latencyMs);

    return {
      count: tests.length,
      avgUpload: uploadSpeeds.reduce((a: number, b: number) => a + b, 0) / uploadSpeeds.length,
      avgDownload:
        downloadSpeeds.reduce((a: number, b: number) => a + b, 0) / downloadSpeeds.length,
      avgLatency: latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length,
      maxDownload: Math.max(...downloadSpeeds),
      minLatency: Math.min(...latencies),
      lastTest: tests[0].timestamp,
    };
  }

  async getGlobalStats() {
    const tests = await this.prisma.speedTest.findMany({
      orderBy: { timestamp: 'desc' },
      take: env.MAX_SPEEDTEST_SAMPLES,
    });

    if (tests.length === 0) {
      return {
        count: 0,
        avgUpload: 0,
        avgDownload: 0,
        avgLatency: 0,
      };
    }

    const uploadSpeeds = tests.map((t: any) => t.uploadMbps);
    const downloadSpeeds = tests.map((t: any) => t.downloadMbps);
    const latencies = tests.map((t: any) => t.latencyMs);

    return {
      count: tests.length,
      avgUpload: uploadSpeeds.reduce((a: number, b: number) => a + b, 0) / uploadSpeeds.length,
      avgDownload:
        downloadSpeeds.reduce((a: number, b: number) => a + b, 0) / downloadSpeeds.length,
      avgLatency: latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length,
      maxDownload: Math.max(...downloadSpeeds),
      minLatency: Math.min(...latencies),
    };
  }
}
