
import { ProductRepository } from '../repositories/product.repository';
import { ProductCreateRequest, ProductUpdateRequest, ProductFilter } from '../types/product.types';
import { createError } from '../../../shared/middleware/error.middleware';
import { MESSAGES, HTTP_STATUS } from '../../../shared/constants';
import { Helpers } from '../../../shared/utils/helpers';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Create new product
   */
  async createProduct(productData: ProductCreateRequest) {
    const product = await this.productRepository.create(productData);
    return product;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product || !product.isActive) {
      throw createError(MESSAGES.ERROR.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return product;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw createError(MESSAGES.ERROR.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return product;
  }

  /**
   * Get products with filters
   */
  async getProducts(filters: ProductFilter) {
    const result = await this.productRepository.findWithFilters(filters);
    
    const pagination = Helpers.getPaginationInfo(
      filters.page || 1,
      filters.limit || 10,
      result.total
    );

    return {
      products: result.products,
      pagination
    };
  }

  /**
   * Update product
   */
  async updateProduct(id: string, updateData: Partial<ProductUpdateRequest>) {
    const existingProduct = await this.getProductById(id);
    
    const updatedProduct = await this.productRepository.update(id, updateData);
    if (!updatedProduct) {
      throw createError(MESSAGES.ERROR.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    return updatedProduct;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    const product = await this.getProductById(id);
    
    const deletedProduct = await this.productRepository.softDelete(id);
    if (!deletedProduct) {
      throw createError(MESSAGES.ERROR.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    return deletedProduct;
  }

  /**
   * Get categories
   */
  async getCategories() {
    return this.productRepository.getCategories();
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 6) {
    return this.productRepository.getFeatured(limit);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, limit: number = 10) {
    return this.productRepository.findByCategory(category, limit);
  }

  /**
   * Search products
   */
  async searchProducts(query: string, page: number = 1, limit: number = 10) {
    return this.getProducts({
      search: query,
      page,
      limit
    });
  }
}