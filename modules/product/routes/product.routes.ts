
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { requireAuth, requireAdmin } from '../../auth/middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// =======================> Validation Schemas <=======================
const productCreateValidation = {
  name: { required: true, minLength: 2, maxLength: 100 },
  description: { required: true, maxLength: 1000 },
  price: { required: true, type: 'number' as const },
  category: { required: true },
  stock: { required: true, type: 'number' as const }
};

const productUpdateValidation = {
  name: { minLength: 2, maxLength: 100 },
  description: { maxLength: 1000 },
  price: { type: 'number' as const },
  stock: { type: 'number' as const }
};

// =======================> Public Routes <=======================
// Show products page
router.get('/', productController.showProducts);

// Show single product
router.get('/:slug', productController.showProduct);

// =======================> API Routes <=======================
// Get products API
router.get('/api/products', productController.getProducts);

// Search products
router.get('/api/search', productController.searchProducts);

// Get single product API
router.get('/api/products/:id', productController.getProduct);

// =======================> Protected Routes (Admin Only) <=======================
// Create product
router.post('/api/products', 
  requireAuth, 
  requireAdmin, 
  validateRequest(productCreateValidation), 
  productController.createProduct
);

// Update product
router.put('/api/products/:id', 
  requireAuth, 
  requireAdmin, 
  validateRequest(productUpdateValidation), 
  productController.updateProduct
);

// Delete product
router.delete('/api/products/:id', 
  requireAuth, 
  requireAdmin, 
  productController.deleteProduct
);

export default router;