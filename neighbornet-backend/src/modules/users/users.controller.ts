import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service.js';
import { sendSuccess, sendError } from '../../utils/responses.js';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../types/index.js';

export class UsersController {
  constructor(private usersService: UsersService) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const user = await this.usersService.getUserById(req.userId);
      sendSuccess(reply, user);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        email: z.string().email().optional(),
      });

      const body = Schema.parse(request.body);
      const user = await this.usersService.updateUserProfile(req.userId, body);
      sendSuccess(reply, user);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getDevices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const devices = await this.usersService.getDevices(req.userId);
      sendSuccess(reply, devices);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async updateDeviceInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.deviceId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const Schema = z.object({
        batteryLevel: z.number().min(0).max(100).optional(),
        connectionType: z.string().optional(),
        bandwidthEstimate: z.number().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      });

      const body = Schema.parse(request.body);
      const device = await this.usersService.updateDeviceInfo(req.deviceId, body);
      sendSuccess(reply, device);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async getTrustScore(request: FastifyRequest, reply: FastifyReply) {
    try {
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const score = await this.usersService.getTrustScore(req.userId);
      sendSuccess(reply, score);
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }
}
