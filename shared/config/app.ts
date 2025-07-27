/**
 * Application configuration constants and settings
 */
export const APP_CONFIG = {
  JWT: {
    SECRET: process.env.JWT_SECRET || 'default-jwt-secret',
    EXPIRES_IN: '7d'
  },
  BCRYPT: {
    SALT_ROUNDS: 12
  },
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const;