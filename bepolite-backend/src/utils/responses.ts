import { FastifyReply } from 'fastify';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export const sendSuccess = <T>(reply: FastifyReply, data: T, statusCode: number = 200, message?: string): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  reply.code(statusCode).send(response);
};

export const sendError = (reply: FastifyReply, error: string, statusCode: number = 400, message?: string): void => {
  const response: ApiResponse<never> = {
    success: false,
    error,
    message: message || error,
    timestamp: new Date().toISOString(),
  };
  reply.code(statusCode).send(response);
};

export const sendPaginatedSuccess = <T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): void => {
  const response = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  };
  reply.code(statusCode).send(response);
};
