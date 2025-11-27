import type { InferInsertModel } from 'drizzle-orm';
import { UserRepository } from '../repositories/UserRepository';
import { users } from '../schema';

type NewUser = InferInsertModel<typeof users>;

const userRepository = new UserRepository();

export class UserService {
  /**
   * 根据ID获取用户
   * @param id - 用户ID
   * @returns 用户信息
   */
  static async getUserById(id: string) {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    
    return await userRepository.findById(id);
  }



  /**
   * 根据用户名获取用户
   * @param username - 用户名
   * @returns 用户信息
   */
  static async getUserByUsername(username: string) {
    if (!username || username.trim().length === 0) {
      throw new Error('用户名不能为空');
    }
    
    if (username.length > 50) {
      throw new Error('用户名不能超过50个字符');
    }
    
    return await userRepository.findByUsername(username.trim());
  }

  /**
   * 根据邮箱获取用户
   * @param email - 邮箱地址
   * @returns 用户信息
   */
  static async getUserByEmail(email: string) {
    if (!email || email.trim().length === 0) {
      throw new Error('邮箱地址不能为空');
    }
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }
    
    return await userRepository.findByEmail(email.trim());
  }

  /**
   * 创建新用户
   * @param userData - 用户数据
   * @returns 创建的用户信息
   */
  static async createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>) {
    // 数据验证
    if (!userData.username || userData.username.trim().length === 0) {
      throw new Error('用户名不能为空');
    }
    
    if (userData.username.length > 50) {
      throw new Error('用户名不能超过50个字符');
    }
    
    if (!userData.email || userData.email.trim().length === 0) {
      throw new Error('邮箱地址不能为空');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('邮箱格式不正确');
    }
    
    // 检查用户名是否已存在
    const existingUserByUsername = await userRepository.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new Error('用户名已存在');
    }
    
    // 检查邮箱是否已存在
    const existingUserByEmail = await userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('邮箱地址已存在');
    }
    
    return await userRepository.create(userData);
  }

  /**
   * 更新用户信息
   * @param id - 用户ID
   * @param userData - 更新数据
   * @returns 更新后的用户信息
   */
  static async updateUser(id: string, userData: Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    
    // 数据验证
    if (userData.username && userData.username.trim().length === 0) {
      throw new Error('用户名不能为空');
    }
    
    if (userData.username && userData.username.length > 50) {
      throw new Error('用户名不能超过50个字符');
    }
    
    if (userData.email && userData.email.trim().length === 0) {
      throw new Error('邮箱地址不能为空');
    }
    
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('邮箱格式不正确');
      }
    }
    
    // 这里需要实现更新用户的逻辑
    // 由于UserRepository中没有update方法，需要先实现
    // 暂时抛出错误，实际项目中需要实现此方法
    throw new Error('updateUser 方法尚未实现');
  }

  /**
   * 删除用户
   * @param id - 用户ID
   * @returns 删除结果
   */
  static async deleteUser(id: string) {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    
    // 这里需要实现删除用户的逻辑
    // 由于UserRepository中没有delete方法，需要先实现
    // 暂时抛出错误，实际项目中需要实现此方法
    throw new Error('deleteUser 方法尚未实现');
  }

  /**
   * 获取任意用户（用于测试或默认用户）
   * @returns 用户信息
   */
  static async getAnyUser() {
    return await userRepository.findAny();
  }


  /**
   * 检查用户名是否可用
   * @param username - 用户名
   * @returns 是否可用
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    if (!username || username.trim().length === 0) {
      return false;
    }
    
    const existingUser = await userRepository.findByUsername(username.trim());
    return !existingUser;
  }

  /**
   * 检查邮箱是否可用
   * @param email - 邮箱地址
   * @returns 是否可用
   */
  static async isEmailAvailable(email: string): Promise<boolean> {
    if (!email || email.trim().length === 0) {
      return false;
    }
    
    const existingUser = await userRepository.findByEmail(email.trim());
    return !existingUser;
  }

  static async findUserAny() {
    return await userRepository.findAny();
  }

}