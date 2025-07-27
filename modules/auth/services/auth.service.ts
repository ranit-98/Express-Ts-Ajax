
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '../types/auth.types';
import { APP_CONFIG } from '../../../shared/config/app';
import { createError } from '../../../shared/middleware/error.middleware';
import { MESSAGES, HTTP_STATUS } from '../../../shared/constants';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, APP_CONFIG.JWT.SECRET, {
      expiresIn: APP_CONFIG.JWT.EXPIRES_IN
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, APP_CONFIG.JWT.SECRET) as JwtPayload;
    } catch (error) {
      throw createError(MESSAGES.ERROR.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
  }

  /**
   * Register new user
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, confirmPassword } = registerData;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw createError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw createError(MESSAGES.ERROR.USER_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password,
      role: 'user'
    });

    
    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      message: MESSAGES.SUCCESS.USER_CREATED,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Login user
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(email) 
    if (!user) {
      throw createError(MESSAGES.ERROR.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(MESSAGES.ERROR.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createError(MESSAGES.ERROR.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }
}