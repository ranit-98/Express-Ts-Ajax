import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../../auth/middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();
// router.get('/products/create', adminController.showProductForm);

// =======================> All routes require admin authentication <=======================
router.use(requireAuth);
router.use(requireAdmin);

// =======================> Admin Pages <=======================
// Dashboard
router.get('/', adminController.showDashboard);
router.get('/dashboard', adminController.showDashboard);

// Products management
router.get('/products', adminController.showProducts);
router.get('/products/create', adminController.showProductForm);
router.get('/products/edit/:id', adminController.showProductForm);

// Users management
router.get('/users', adminController.showUsers);

// =======================> API Routes <=======================
// Dashboard stats
router.get('/api/stats', adminController.getDashboardStats);

// User management
router.put('/api/users/:id', adminController.updateUser);
router.delete('/api/users/:id', adminController.deleteUser);

export default router;