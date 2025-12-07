import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { 
  RegisterSchema, 
  LoginSchema, 
  RefreshTokenSchema, 
  LogoutSchema 
} from './auth.schema.js';
import { sendSuccess, sendError } from '../../utils/responses.js';
import type { AuthenticatedRequest } from '../../types/index.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = RegisterSchema.parse(request.body);
      const result = await this.authService.register(body);
      sendSuccess(reply, result, 201, 'User registered successfully');
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = LoginSchema.parse(request.body);
      const result = await this.authService.login(body);
      sendSuccess(reply, result, 200, 'Logged in successfully');
    } catch (error: any) {
      sendError(reply, error.message, 401);
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = RefreshTokenSchema.parse(request.body);
      const result = await this.authService.refreshToken(body);
      sendSuccess(reply, result, 200, 'Token refreshed');
    } catch (error: any) {
      sendError(reply, error.message, 401);
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = LogoutSchema.parse(request.body);
      const req = request as AuthenticatedRequest;
      if (!req.userId) {
        sendError(reply, 'Unauthorized', 401);
        return;
      }

      const result = await this.authService.logout(req.userId);
      sendSuccess(reply, result, 200, 'Logged out successfully');
    } catch (error: any) {
      sendError(reply, error.message, 400);
    }
  }
}
