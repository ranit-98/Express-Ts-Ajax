/**
 * Product controller handling HTTP requests
 */
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ProductCreateRequest, ProductUpdateRequest, ProductFilter } from '../types/product.types';
import { ApiResponse, PaginatedResponse } from '../../../shared/types/common.types';
import { HTTP_STATUS, MESSAGES } from '../../../shared/constants';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Show products page
   */
  showProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ProductFilter = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: 12
      };

      const result = await this.productService.getProducts(filters);
      const categories = await this.productService.getCategories();

      res.render('layouts/main', {
        title: 'Products',
        body: '../modules/product/views/products',
        user: req.session.user || null,
        products: result.products,
        pagination: result.pagination,
        categories,
        filters
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Show single product page
   */
  showProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const product = await this.productService.getProductBySlug(slug);
      
      res.render('layouts/main', {
        title: product.name,
        body: '../modules/product/views/product-detail',
        user: req.session.user || null,
        product
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get products API
   */
  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ProductFilter = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const result = await this.productService.getProducts(filters);

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Products retrieved successfully',
        data: result.products,
        pagination: result.pagination
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single product API
   */
  getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Product retrieved successfully',
        data: product
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create product API
   */
  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productData: ProductCreateRequest = req.body;
      const product = await this.productService.createProduct(productData);

      const response: ApiResponse = {
        success: true,
        message: MESSAGES.SUCCESS.PRODUCT_CREATED,
        data: product
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update product API
   */
  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: Partial<ProductUpdateRequest> = req.body;
      
      const product = await this.productService.updateProduct(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: MESSAGES.SUCCESS.PRODUCT_UPDATED,
        data: product
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete product API
   */
  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);

      const response: ApiResponse = {
        success: true,
        message: MESSAGES.SUCCESS.PRODUCT_DELETED
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search products API
   */
  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      if (!query) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const result = await this.productService.searchProducts(query, page, limit);

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Search results retrieved successfully',
        data: result.products,
        pagination: result.pagination
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}