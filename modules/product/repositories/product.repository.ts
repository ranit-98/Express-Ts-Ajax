/**
 * Product repository for database operations
 */
import { Product, IProduct } from '../models/Product';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { ProductFilter } from '../types/product.types';

export class ProductRepository {
  /**
   * Create new product
   */
  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id);
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug, isActive: true });
  }

  /**
   * Find products with filters and pagination
   */
  async findWithFilters(filters: ProductFilter) {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      page = 1, 
      limit = 10 
    } = filters;

    const query: FilterQuery<IProduct> = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return { products, total };
  }

  /**
   * Update product
   */
  async update(id: string, updateData: UpdateQuery<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Soft delete product
   */
  async softDelete(id: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return Product.distinct('category', { isActive: true });
  }

  /**
   * Get products by category
   */
  async findByCategory(category: string, limit: number = 10): Promise<IProduct[]> {
    return Product.find({ category, isActive: true })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 6): Promise<IProduct[]> {
    return Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Update stock
   */
  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true }
    );
  }
}