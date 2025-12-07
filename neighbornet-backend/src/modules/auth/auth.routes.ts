import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middlewares/authGuard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const authController = new AuthController(authService);

  // Register endpoint
  fastify.post('/auth/register', async (request, reply) => {
    await authController.register(request, reply);
  });

  // Login endpoint
  fastify.post('/auth/login', async (request, reply) => {
    await authController.login(request, reply);
  });

  // Refresh token endpoint
  fastify.post('/auth/refresh', async (request, reply) => {
    await authController.refreshToken(request, reply);
  });

  // Logout endpoint
  fastify.post<{ Body: { deviceId: string } }>(
    '/auth/logout',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await authController.logout(request, reply);
    }
  );
}
