import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app.js';
import { getPrismaClient, disconnectPrisma } from '../src/database/prisma.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;
let accessToken: string;
let deviceId: string;

beforeAll(async () => {
  app = await createApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await disconnectPrisma();
});

describe('Speedtest Endpoints', () => {
  it('should register and login first', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        phone: '9999999999',
        password: 'testpass123',
        deviceFingerprint: 'speedtest-device-fingerprint',
      },
    });

    expect(response.statusCode).toBe(201);
    const data = response.json();
    accessToken = data.data.accessToken;
    deviceId = data.data.device.id;
  });

  it('should report speed test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/speedtest/report',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        uploadMbps: 25.5,
        downloadMbps: 85.3,
        latencyMs: 45,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('success', true);
  });

  it('should get speed tests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/speedtest/tests',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
    expect(Array.isArray(response.json().data)).toBe(true);
  });

  it('should get speed stats', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/speedtest/stats',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
    expect(response.json().data).toHaveProperty('count');
    expect(response.json().data).toHaveProperty('avgDownload');
  });

  it('should get global stats without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/speedtest/global-stats',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
  });
});

describe('Provider Endpoints', () => {
  it('should set provider availability', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/providers/setAvailability',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        isAvailable: true,
        hotspotEnabled: true,
        estimatedSpeed: 50,
        maxShareMbps: 30,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
  });

  it('should get nearby providers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/providers/nearby?lat=40.7128&lng=-74.0060&radius=5',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
  });

  it('should get provider status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/providers/status',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
  });

  it('should stop sharing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/providers/stopSharing',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
  });
});
