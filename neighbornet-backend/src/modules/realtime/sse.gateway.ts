import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { authGuard } from '../../middlewares/authGuard.js';
import logger from '../../config/logger.js';
import type { AuthenticatedRequest } from '../../types/index.js';

interface SSEClient {
  userId: string;
  reply: FastifyReply;
  close: () => void;
}

const sseClients = new Map<string, Set<SSEClient>>();

export async function setupSSEGateway(fastify: FastifyInstance) {
  fastify.get(
    '/realtime/sse',
    { onRequest: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const req = request as AuthenticatedRequest;
        const userId = req.userId;
        if (!userId) {
          reply.code(401).send({ error: 'Unauthorized' });
          return;
        }

        // Set SSE headers
        reply.header('Content-Type', 'text/event-stream');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');
        reply.header('X-Accel-Buffering', 'no');

        const client: SSEClient = {
          userId,
          reply,
          close: () => {
            reply.send();
          },
        };

        // Add client to SSE clients
        if (!sseClients.has(userId)) {
          sseClients.set(userId, new Set());
        }
        sseClients.get(userId)!.add(client);

        logger.info({ userId }, 'SSE client connected');

        // Send initial connection message
        reply.send(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          try {
            reply.send(`: heartbeat\n\n`);
          } catch (error) {
            clearInterval(heartbeat);
          }
        }, 30000); // 30 seconds

        // Cleanup on disconnect
        request.socket.on('close', () => {
          clearInterval(heartbeat);
          const clients = sseClients.get(userId);
          if (clients) {
            clients.delete(client);
            if (clients.size === 0) {
              sseClients.delete(userId);
            }
          }
          logger.info({ userId }, 'SSE client disconnected');
        });

        request.socket.on('error', (error) => {
          clearInterval(heartbeat);
          logger.error(error, 'SSE error');
        });
      } catch (error) {
        logger.error(error, 'SSE connection error');
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
}

export function sendSSEToUser(userId: string, message: any) {
  const clients = sseClients.get(userId);
  if (clients) {
    clients.forEach((client) => {
      try {
        client.reply.send(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        logger.error(error, 'Error sending SSE message');
      }
    });
  }
}

export function broadcastSSEToAllClients(message: any) {
  sseClients.forEach((clients) => {
    clients.forEach((client) => {
      try {
        client.reply.send(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        logger.error(error, 'Error broadcasting SSE message');
      }
    });
  });
}
