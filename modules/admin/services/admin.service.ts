
import { UserRepository } from '../../auth/repositories/user.repository';
import { ProductRepository } from '../../product/repositories/product.repository';

export class AdminService {
  private userRepository: UserRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [userCount, productCount, categories] = await Promise.all([
      this.userRepository.count(),
      this.productRepository.findWithFilters({}).then(result => result.total),
      this.productRepository.getCategories()
    ]);

    const recentProducts = await this.productRepository.getFeatured(5);
    const recentUsers = await this.userRepository.find();

    return {
      stats: {
        totalUsers: userCount,
        totalProducts: productCount,
        totalCategories: categories.length
      },
      recentProducts: recentProducts.slice(0, 5),
      recentUsers: recentUsers.slice(0, 5)
    };
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.find(),
      this.userRepository.count()
    ]);

    return {
      users: users.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  /**
   * Update user
   */
  async updateUser(id: string, updateData: any) {
    return this.userRepository.update(id, updateData);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    return this.userRepository.softDelete(id);
  }
}