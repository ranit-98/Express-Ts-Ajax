/**
 * Request validation middleware
 */
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/common.types';

export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'password';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
}

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const data = { ...req.body, ...req.query, ...req.params };

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (value) {
        // Type validation
        if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }

        if (rules.type === 'password' && value.length < 6) {
          errors.push({ field, message: `${field} must be at least 6 characters` });
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must not exceed ${rules.maxLength} characters` });
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({ field, message: `${field} format is invalid` });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.map(e => e.message)
      });
      return;
    }

    next();
  };
}