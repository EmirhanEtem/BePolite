import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || '';
};

export const env = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  HOST: getEnvVar('HOST', '0.0.0.0'),
  
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRY: getEnvVar('JWT_EXPIRY', '15m'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRY: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
  
  // CORS
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', '*'),
  
  // Security
  BCRYPT_ROUNDS: parseInt(getEnvVar('BCRYPT_ROUNDS', '10'), 10),
  
  // Rate limiting
  RATE_LIMIT_MAX: parseInt(getEnvVar('RATE_LIMIT_MAX', '100'), 10),
  RATE_LIMIT_TIME_WINDOW: parseInt(getEnvVar('RATE_LIMIT_TIME_WINDOW', '900000'), 10),
  
  // Geolocation
  NEARBY_RADIUS_KM: parseInt(getEnvVar('NEARBY_RADIUS_KM', '5'), 10),
  
  // SpeedTest
  MAX_SPEEDTEST_SAMPLES: parseInt(getEnvVar('MAX_SPEEDTEST_SAMPLES', '100'), 10),
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
