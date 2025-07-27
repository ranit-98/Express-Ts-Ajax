/**
 * User repository for database operations
 */
import { User, IUser } from '../models/User';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class UserRepository {
  /**
   * Create new user
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email, isActive: true });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }

  /**
   * Find user with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email, isActive: true }).select('+password');
  }

  /**
   * Update user
   */
  async update(id: string, updateData: UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  /**
   * Find users with filters
   */
  async find(filter: FilterQuery<IUser> = {}): Promise<IUser[]> {
    return User.find({ ...filter, isActive: true }).select('-password');
  }

  /**
   * Get user count
   */
  async count(filter: FilterQuery<IUser> = {}): Promise<number> {
    return User.countDocuments({ ...filter, isActive: true });
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<IUser> = { email, isActive: true };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const user = await User.findOne(filter);
    return !!user;
  }
}