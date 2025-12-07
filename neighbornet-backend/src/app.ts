import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import { env, isDevelopment } from './config/env.js';
import logger from './config/logger.js';
import { setupRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setupWebSocketGateway } from './modules/realtime/ws.gateway.js';
import { setupSSEGateway } from './modules/realtime/sse.gateway.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { providersRoutes } from './modules/providers/providers.routes.js';
import { speedTestRoutes } from './modules/speedtest/index.js';
import { sessionsRoutes } from './modules/sessions/index.js';

export async function createApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: isDevelopment ? logger : false,
    trustProxy: true,
  });

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await fastify.register(websocket);

  // Setup rate limiting
  await setupRateLimiter(fastify as any);

  // Health check route
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(authRoutes);
  await fastify.register(usersRoutes);
  await fastify.register(providersRoutes);
  await fastify.register(speedTestRoutes);
  await fastify.register(sessionsRoutes);

  // Realtime gateways
  await setupWebSocketGateway(fastify as any);
  await setupSSEGateway(fastify as any);

  // Error handler
  fastify.setErrorHandler(errorHandler);

  return fastify as unknown as FastifyInstance;
}

export default createApp;
