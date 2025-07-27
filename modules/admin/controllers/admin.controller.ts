import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ProductService } from '../../product/services/product.service';
import { ApiResponse } from '../../../shared/types/common.types';
import { HTTP_STATUS } from '../../../shared/constants';

export class AdminController {
  private adminService: AdminService;
  private productService: ProductService;

  constructor() {
    this.adminService = new AdminService();
    this.productService = new ProductService();
  }

  /**
   * Show admin dashboard
   */
  showDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dashboardData = await this.adminService.getDashboardStats();

      res.render('layouts/main', {
        title: 'Admin Dashboard',
        body: '../modules/admin/views/dashboard',
        user: req.session.user,
        ...dashboardData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Show products management page
   */
  showProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const result = await this.productService.getProducts({ page, limit: 10 });
      const categories = await this.productService.getCategories();

      res.render('layouts/main', {
        title: 'Manage Products',
         body: 'products',
        user: req.session.user,
        products: result.products,
        pagination: result.pagination,
        categories
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Show product form (create/edit)
   */
  showProductForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let product = null;
      const { id } = req.params;

      if (id) {
        product = await this.productService.getProductById(id);
      }

      const categories = await this.productService.getCategories();

      res.render('layouts/main', {
        title: product ? 'Edit Product' : 'Add Product',
          body: 'product-form',
        // body: '../modules/admin/views/product-form',
        user: req.session.user,
        product,
        categories: ['electronics', 'clothing', 'books', 'home', 'sports', 'other']
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Show users management page
   */
  showUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const result = await this.adminService.getUsers(page, 10);

      res.render('layouts/main', {
        title: 'Manage Users',
        body: '../modules/admin/views/users',
        user: req.session.user,
        users: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get dashboard stats API
   */
  getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: stats
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user API
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await this.adminService.updateUser(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: user
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user API
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.adminService.deleteUser(id);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}