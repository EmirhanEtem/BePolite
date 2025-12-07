import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app.js';
import { getPrismaClient, disconnectPrisma } from '../src/database/prisma.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await createApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await disconnectPrisma();
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status', 'ok');
  });
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        phone: '1234567890',
        password: 'testpassword123',
        deviceFingerprint: 'test-device-fingerprint-1234567890',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('success', true);
    expect(response.json()).toHaveProperty('data.accessToken');
  });

  it('should not register with duplicate phone', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        phone: '1234567891',
        password: 'testpassword123',
        deviceFingerprint: 'test-device-fingerprint-1234567891',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        phone: '1234567891',
        password: 'testpassword123',
        deviceFingerprint: 'test-device-fingerprint-1234567892',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('success', false);
  });

  it('should login user', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        phone: '1234567892',
        password: 'testpassword123',
        deviceFingerprint: 'test-device-fingerprint-1234567893',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        phone: '1234567892',
        password: 'testpassword123',
        deviceFingerprint: 'test-device-fingerprint-1234567893',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success', true);
    expect(response.json()).toHaveProperty('data.accessToken');
  });
});
