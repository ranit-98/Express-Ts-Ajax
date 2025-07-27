/**
 * Authentication middleware for route protection
 */
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, MESSAGES, USER_ROLES } from '../../../shared/constants';

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    if (req.xhr || req.headers['content-type']?.includes('application/json')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }
    res.redirect('/auth/login');
    return;
  }
  next();
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    if (req.xhr || req.headers['content-type']?.includes('application/json')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }
    res.redirect('/auth/login');
    return;
  }

  console.log('User role:', req.session.user);
  if (req.session.user.role !== USER_ROLES.ADMIN) {
    if (req.xhr || req.headers['content-type']?.includes('application/json')) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ERROR.FORBIDDEN
      });
      return;
    }
    res.status(HTTP_STATUS.FORBIDDEN).render('layouts/main', {
      title: 'Access Denied',
      body: '../partials/403',
      user: req.session.user
    });
    return;
  }
  next();
}

/**
 * Middleware to redirect authenticated users
 */
export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.session.user) {
    const redirectUrl = req.session.user.role === USER_ROLES.ADMIN ? '/admin' : '/';
    res.redirect(redirectUrl);
    return;
  }
  next();
}