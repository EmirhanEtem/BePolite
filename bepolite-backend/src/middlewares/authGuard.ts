import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/tokens.js';
import { sendError } from '../utils/responses.js';

export async function authGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      sendError(reply, 'Missing authorization header', 401, 'Unauthorized');
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    const payload = verifyAccessToken(token);
    (request as any).userId = payload.userId;
    (request as any).deviceId = payload.deviceId;
  } catch (error) {
    sendError(reply, 'Invalid or expired token', 401, 'Unauthorized');
  }
}

export async function optionalAuthGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      const payload = verifyAccessToken(token);
      (request as any).userId = payload.userId;
      (request as any).deviceId = payload.deviceId;
    }
  } catch (error) {
    // Optional auth, so we don't fail
  }
}
