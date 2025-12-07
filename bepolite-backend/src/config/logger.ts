import pino, { Logger } from 'pino';
import { isDevelopment } from './env.js';

let logger: Logger;

if (isDevelopment) {
  logger = pino(
    {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    }
  );
} else {
  logger = pino({
    level: 'info',
  });
}

export default logger;
