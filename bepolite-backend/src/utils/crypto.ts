import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateDeviceFingerprint = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateRandomToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const createSignature = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

export const verifySignature = (data: string, signature: string, secret: string): boolean => {
  const computed = createSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
};
