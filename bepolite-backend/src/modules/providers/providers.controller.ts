import { FastifyRequest, FastifyReply } from 'fastify';
import { ProvidersService } from './providers.service.js';
import { sendSuccess, sendError } from '../../utils/responses.js';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../types/index.js';

export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  async getNearbyProviders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const Schema = z.object({
        lat: z.string().transform((v) => parseFloat(v)),
        lng: z.string().transform((v) => parseFloat(v)),
        radius: z.string().transform((v) => parseFloat(v)).optional(),
      });

      const query = Schema.parse(request.query);
      const providers = await this.providersService.getNearbyProviders(
        query.lat,
        query.lng,
        query.radius
      );
      sendSuccess(reply, providers);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getBestProvider(request: FastifyRequest, reply: FastifyReply) {
    try {
      const Schema = z.object({
        lat: z.string().transform((v) => parseFloat(v)),
        lng: z.string().transform((v) => parseFloat(v)),
        radius: z.string().transform((v) => parseFloat(v)).optional(),
      });

      const query = Schema.parse(request.query);
      const provider = await this.providersService.getBestProvider(
        query.lat,
        query.lng,
        query.radius
      );

      if (!provider) {
        sendError(reply, 'No providers available', 404);
        return;
      }

      sendSuccess(reply, provider);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async setAvailability(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        isAvailable: z.boolean(),
        hotspotEnabled: z.boolean().optional(),
        estimatedSpeed: z.number().optional(),
        maxShareMbps: z.number().optional(),
      });

      const body = Schema.parse(request.body);
      const result = await this.providersService.setAvailability(req.deviceId, body);
      sendSuccess(reply, result);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async stopSharing(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const result = await this.providersService.stopSharing(req.deviceId);
      sendSuccess(reply, result);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getProviderStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const status = await this.providersService.getProviderStatus(req.deviceId);
      sendSuccess(reply, status);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getProviderHistory(request: FastifyRequest, reply: FastifyReply) {
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
      const history = await this.providersService.getProviderHistory(
        req.deviceId,
        query.limit
      );
      sendSuccess(reply, history);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }
}
