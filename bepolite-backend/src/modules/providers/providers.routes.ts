import { FastifyInstance } from 'fastify';
import { authGuard, optionalAuthGuard } from '../../middlewares/authGuard.js';
import { ProvidersController } from './providers.controller.js';
import { ProvidersService } from './providers.service.js';

export async function providersRoutes(fastify: FastifyInstance) {
  const providersService = new ProvidersService();
  const providersController = new ProvidersController(providersService);

  // Get nearby providers
  fastify.get(
    '/providers/nearby',
    { onRequest: [optionalAuthGuard] },
    async (request, reply) => {
      await providersController.getNearbyProviders(request, reply);
    }
  );

  // Get best provider
  fastify.get(
    '/providers/best',
    { onRequest: [optionalAuthGuard] },
    async (request, reply) => {
      await providersController.getBestProvider(request, reply);
    }
  );

  // Set availability
  fastify.post(
    '/providers/setAvailability',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await providersController.setAvailability(request, reply);
    }
  );

  // Stop sharing
  fastify.post(
    '/providers/stopSharing',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await providersController.stopSharing(request, reply);
    }
  );

  // Get provider status
  fastify.get(
    '/providers/status',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await providersController.getProviderStatus(request, reply);
    }
  );

  // Get provider history
  fastify.get(
    '/providers/history',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await providersController.getProviderHistory(request, reply);
    }
  );
}
