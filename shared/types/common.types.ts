/**
 * Common TypeScript types used across the application
 */
import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface ValidationError {
  field: string;
  message: string;
}

declare module 'express-session' {
  interface SessionData {
    user: SessionUser;
  }
}