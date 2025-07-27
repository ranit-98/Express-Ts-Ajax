/**
 * Global error handling middleware
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/common.types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorMiddleware(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error
  logger.error(`Error ${statusCode}: ${message}`, {
    url: req.url,
    method: req.method,
    stack: error.stack
  });

  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Something went wrong' 
      : message
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    response.message = 'Validation Error';
    response.errors = Object.values((error as any).errors).map((err: any) => err.message);
  }

  if (error.name === 'CastError') {
    response.message = 'Invalid ID format';
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    response.message = 'Duplicate entry found';
  }

  res.status(statusCode).json(response);
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}