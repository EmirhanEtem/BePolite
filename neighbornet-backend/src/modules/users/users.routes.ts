import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middlewares/authGuard.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

export async function usersRoutes(fastify: FastifyInstance) {
  const usersService = new UsersService();
  const usersController = new UsersController(usersService);

  // Get user profile
  fastify.get(
    '/users/profile',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await usersController.getProfile(request, reply);
    }
  );

  // Update user profile
  fastify.put(
    '/users/profile',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await usersController.updateProfile(request, reply);
    }
  );

  // Get user devices
  fastify.get(
    '/users/devices',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await usersController.getDevices(request, reply);
    }
  );

  // Update device info
  fastify.put(
    '/users/devices/:deviceId',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await usersController.updateDeviceInfo(request, reply);
    }
  );

  // Get trust score
  fastify.get(
    '/users/trust-score',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await usersController.getTrustScore(request, reply);
    }
  );
}
