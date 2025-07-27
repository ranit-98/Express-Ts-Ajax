
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import { ApiResponse } from '../../../shared/types/common.types';
import { HTTP_STATUS, MESSAGES } from '../../../shared/constants';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Show login page
   */
  showLogin = (req: Request, res: Response): void => {
    res.render('layouts/main', {
      title: 'Login',
      body: '../modules/auth/views/login',
      user: req.session.user || null
    });
  };

  /**
   * Show register page
   */
  showRegister = (req: Request, res: Response): void => {
    res.render('layouts/main', {
      title: 'Register',
      body: '../modules/auth/views/register',
      user: req.session.user || null
    });
  };

  /**
   * Handle login request
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;
      const result = await this.authService.login(loginData);

      // Set session
      req.session.user = {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role as 'user' | 'admin'
      };

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: { redirectUrl: result.user!.role === 'admin' ? '/admin' : '/' }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle register request
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData: RegisterRequest = req.body;
      const result = await this.authService.register(registerData);

      // Set session
      req.session.user = {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role as 'user' | 'admin'
      };

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: { redirectUrl: '/' }
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle logout request
   */
  logout = (req: Request, res: Response): void => {
    req.session.destroy((err) => {
      if (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Logout failed'
        });
        return;
      }

      res.clearCookie('connect.sid');
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT_SUCCESS,
        data: { redirectUrl: '/auth/login' }
      });
    });
  };

  /**
   * Get user profile
   */
  profile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.session.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED
        });
        return;
      }

      const user = await this.authService.getProfile(req.session.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}