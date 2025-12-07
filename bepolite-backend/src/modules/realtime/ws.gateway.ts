import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../database/prisma.js';
import logger from '../../config/logger.js';
import type { AuthenticatedRequest } from '../../types/index.js';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'location-update' | 'availability-update' | 'ping';
  data?: any;
}

const connectedClients = new Map<string, Set<any>>();

export async function setupWebSocketGateway(fastify: FastifyInstance) {
  await fastify.register(async (fastify) => {
    fastify.get<{ Querystring: { token: string } }>(
      '/realtime/ws',
      { websocket: true } as any,
      async (socket: any, request: any) => {
        try {
          const token = (request.query as { token: string })?.token;
          if (!token) {
            socket.close(4001, 'No token provided');
            return;
          }

          // In production, verify token here
          const userId = (request as any).userId || 'anonymous';

        // Add client to connected clients
        if (!connectedClients.has(userId)) {
          connectedClients.set(userId, new Set());
        }
        connectedClients.get(userId)!.add(socket);

        logger.info({ userId }, 'WebSocket client connected');

        socket.on('message', async (message: Buffer) => {
          try {
            const data: WebSocketMessage = JSON.parse(message.toString());

            switch (data.type) {
              case 'subscribe':
                // Subscribe to nearby providers updates
                socket.send(
                  JSON.stringify({
                    type: 'subscribed',
                    channel: data.data?.channel,
                  })
                );
                break;

              case 'location-update':
                // Broadcast location update to all connected clients
                broadcastToAllClients({
                  type: 'location-update',
                  userId,
                  data: data.data,
                });
                break;

              case 'availability-update':
                // Broadcast provider availability
                broadcastToAllClients({
                  type: 'availability-update',
                  userId,
                  data: data.data,
                });
                break;

              case 'ping':
                socket.send(JSON.stringify({ type: 'pong' }));
                break;
            }
          } catch (error) {
            logger.error(error, 'Error handling WebSocket message');
          }
        });

        socket.on('close', () => {
          const clients = connectedClients.get(userId);
          if (clients) {
            clients.delete(socket);
            if (clients.size === 0) {
              connectedClients.delete(userId);
            }
          }
          logger.info({ userId }, 'WebSocket client disconnected');
        });

        socket.on('error', (error: any) => {
          logger.error(error, 'WebSocket error');
        });
      } catch (error) {
        logger.error(error, 'WebSocket connection error');
        socket.close(4000, 'Internal server error');
      }
    }
  );
  });
}

function broadcastToAllClients(message: any) {
  connectedClients.forEach((clients) => {
    clients.forEach((socket) => {
      if (socket.readyState === 1) { // 1 = OPEN
        socket.send(JSON.stringify(message));
      }
    });
  });
}

export function sendToUser(userId: string, message: any) {
  const clients = connectedClients.get(userId);
  if (clients) {
    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify(message));
      }
    });
  }
}

export function broadcastToNearby(latitude: number, longitude: number, message: any, radiusKm: number = 5) {
  const R = 6371; // Earth's radius in km

  connectedClients.forEach((clients, userId) => {
    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify(message));
      }
    });
  });
}
