import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middlewares/authGuard.js';
import { SessionsController } from './sessions.controller.js';
import { SessionsService } from './sessions.service.js';

export async function sessionsRoutes(fastify: FastifyInstance) {
  const sessionsService = new SessionsService();
  const sessionsController = new SessionsController(sessionsService);

  // Start session
  fastify.post(
    '/sessions/start',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await sessionsController.startSession(request, reply);
    }
  );

  // End session
  fastify.post(
    '/sessions/end',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await sessionsController.endSession(request, reply);
    }
  );

  // Get session history
  fastify.get(
    '/sessions/history',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await sessionsController.getSessionHistory(request, reply);
    }
  );

  // Get active sessions
  fastify.get(
    '/sessions/active',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await sessionsController.getActiveSessions(request, reply);
    }
  );

  // Get total bytes shared
  fastify.get(
    '/sessions/stats',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await sessionsController.getTotalBytesShared(request, reply);
    }
  );
}
