import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn']
        : ['error'],
    });

    prisma.$connect().then(() => {
      logger.info('Database connected successfully');
    }).catch((error: any) => {
      logger.error(error, 'Failed to connect to database');
      process.exit(1);
    });
  }

  return prisma;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
  }
};
