import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middlewares/authGuard.js';
import { SpeedTestController } from './speedtest.controller.js';
import { SpeedTestService } from './speedtest.service.js';

export async function speedTestRoutes(fastify: FastifyInstance) {
  const speedTestService = new SpeedTestService();
  const speedTestController = new SpeedTestController(speedTestService);

  // Report speed test
  fastify.post(
    '/speedtest/report',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await speedTestController.reportSpeedTest(request, reply);
    }
  );

  // Get speed tests for device
  fastify.get(
    '/speedtest/tests',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await speedTestController.getSpeedTests(request, reply);
    }
  );

  // Get speed stats for device
  fastify.get(
    '/speedtest/stats',
    { onRequest: [authGuard] },
    async (request, reply) => {
      await speedTestController.getSpeedStats(request, reply);
    }
  );

  // Get global speed stats
  fastify.get(
    '/speedtest/global-stats',
    async (request, reply) => {
      await speedTestController.getGlobalStats(request, reply);
    }
  );
}
