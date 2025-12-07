import { z } from 'zod';

export const RegisterSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(100),
  email: z.string().email().optional(),
  deviceFingerprint: z.string().min(20),
  batteryLevel: z.number().min(0).max(100).optional().default(100),
  connectionType: z.string().optional().default('4G'),
});

export const LoginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(1),
  deviceFingerprint: z.string().min(20),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutSchema = z.object({
  deviceId: z.string().min(1),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type LogoutRequest = z.infer<typeof LogoutSchema>;
