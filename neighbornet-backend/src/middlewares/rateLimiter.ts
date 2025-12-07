import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export const setupRateLimiter = async (fastify: FastifyInstance): Promise<void> => {
  // Rate limiting is handled via plugin registration in app.ts
  // This is a placeholder for rate limiter configuration
  // @fastify/rate-limit can be registered directly in app.ts if needed
};

