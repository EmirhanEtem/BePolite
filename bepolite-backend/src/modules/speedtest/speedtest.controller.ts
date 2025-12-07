import { FastifyRequest, FastifyReply } from 'fastify';
import { SpeedTestService } from './speedtest.service.js';
import { sendSuccess, sendError } from '../../utils/responses.js';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../types/index.js';

export class SpeedTestController {
  constructor(private speedTestService: SpeedTestService) {}

  async reportSpeedTest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        uploadMbps: z.number().min(0),
        downloadMbps: z.number().min(0),
        latencyMs: z.number().min(0),
      });

      const body = Schema.parse(request.body);
      const result = await this.speedTestService.reportSpeedTest(
        req.deviceId,
        body.uploadMbps,
        body.downloadMbps,
        body.latencyMs
      );

      sendSuccess(reply, result, 201);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getSpeedTests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        limit: z.string().transform((v) => parseInt(v)).optional(),
      });

      const query = Schema.parse(request.query);
      const tests = await this.speedTestService.getDeviceSpeedTests(
        req.deviceId,
        query.limit
      );

      sendSuccess(reply, tests);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getSpeedStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const stats = await this.speedTestService.getDeviceSpeedStats(req.deviceId);
      sendSuccess(reply, stats);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getGlobalStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.speedTestService.getGlobalStats();
      sendSuccess(reply, stats);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }
}
