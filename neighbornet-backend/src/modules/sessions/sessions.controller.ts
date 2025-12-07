import { FastifyRequest, FastifyReply } from 'fastify';
import { SessionsService } from './sessions.service.js';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../../utils/responses.js';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../types/index.js';

export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  async startSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        providerDeviceId: z.string().min(1),
        requesterDeviceId: z.string().min(1),
      });

      const body = Schema.parse(request.body);
      const session = await this.sessionsService.startSession(
        body.providerDeviceId,
        body.requesterDeviceId,
        req.userId,
        req.userId
      );

      sendSuccess(reply, session, 201);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async endSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        sessionId: z.string().min(1),
        totalBytesShared: z.number().optional(),
      });

      const body = Schema.parse(request.body);
      const session = await this.sessionsService.endSession(
        body.sessionId,
        body.totalBytesShared
      );

      sendSuccess(reply, session);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getSessionHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        limit: z.string().transform((v) => parseInt(v)).optional(),
      });

      const query = Schema.parse(request.query);
      const sessions = await this.sessionsService.getUserSessions(
        req.userId,
        query.limit
      );

      sendSuccess(reply, sessions);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getActiveSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const sessions = await this.sessionsService.getActiveSessions(req.userId);
      sendSuccess(reply, sessions);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getTotalBytesShared(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const result = await this.sessionsService.getTotalBytesShared(req.userId);
      sendSuccess(reply, result);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }
}
