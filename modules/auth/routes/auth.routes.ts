/**
 * Authentication routes configuration
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { redirectIfAuthenticated } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// =======================> Validation Schemas <=======================
const loginValidation = {
  email: { required: true, type: 'email' as const },
  password: { required: true, minLength: 6 }
};

const registerValidation = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, type: 'email' as const },
  password: { required: true, type: 'password' as const },
  confirmPassword: { required: true, minLength: 6 }
};

// =======================> Routes <=======================
// Show login page
router.get('/login', redirectIfAuthenticated, authController.showLogin);

// Show register page
router.get('/register', redirectIfAuthenticated, authController.showRegister);

// Handle login
router.post('/login', validateRequest(loginValidation), authController.login);

// Handle register
router.post('/register', validateRequest(registerValidation), authController.register);

// Handle logout
router.post('/logout', authController.logout);

// Get profile
router.get('/profile', authController.profile);

export default router;