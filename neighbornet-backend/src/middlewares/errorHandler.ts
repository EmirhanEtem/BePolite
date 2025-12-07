import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responses.js';
import logger from '../config/logger.js';

export const errorHandler = (error: any, request: FastifyRequest, reply: FastifyReply): void => {
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  }, 'Request error');

  // Zod validation errors
  if (error.statusCode === 400 && error.validation) {
    sendError(reply, 'Validation error', 400, error.message);
    return;
  }

  // JWT errors
  if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
    sendError(reply, 'Unauthorized', 401, error.message);
    return;
  }

  // Not found
  if (error.statusCode === 404) {
    sendError(reply, 'Not found', 404, error.message);
    return;
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    sendError(reply, 'Too many requests', 429, 'Rate limit exceeded');
    return;
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  sendError(reply, message, statusCode);
};
