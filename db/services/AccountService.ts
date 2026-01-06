// sql/services/AccountService.ts
import { AccountDataType } from "@/storage/store/types";
import { AccountRepository } from "../repositories/AccountRepository";

const accountRepo = new AccountRepository();

export class AccountService {
  /**
   * 添加新账户
   * @param accountInfo - 账户信息
   * @returns 创建的账户信息
   */
  static async createNewAccount(
    accountInfo: AccountDataType
  ) {
    // 业务规则校验：例如名字不能太长
    if (accountInfo.name.length > 50) throw new Error("账户名称过长");

    return await accountRepo.create(accountInfo);
  }

  /**
   * 获取用户资产概览
   * @param userId - 用户ID
   * @returns 用户资产信息
   */
  static async getUserAssets(userId: string) {
    const myAccounts = await accountRepo.findByUser(userId);
    const totalBalance = myAccounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    return {
      accounts: myAccounts,
      totalBalance,
    };
  }

  /**
   * 设为默认账户
   * @param userId - 用户ID
   * @param accountId - 账户ID
   * @returns 设置结果
   */
  static async setAsDefault(userId: string, accountId: string) {
    return await accountRepo.setAsDefault(userId, accountId);
  }

  /**
   * 更新账户信息
   * @param accountId - 账户ID
   * @param updateData - 更新数据
   * @returns 更新后的账户信息
   */
  static async updateAccount(accountId: string, updateData: any) {
    return await accountRepo.update(accountId, updateData);
  }

  /**
   * 删除账户
   * @param accountId - 账户ID
   * @returns 删除结果
   */
  static async deleteAccount(accountId: string) {
    return await accountRepo.delete(accountId);
  }

  /**
   * 设置账户为已归档
   * @param accountId - 账户ID
   * @returns 设置结果
   */
  static async setAsArchived(accountId: string) {
    return await accountRepo.setAsArchived(accountId);
  }

  /**
   * 获取当前active账户
   * @param userId - 用户ID
   * @returns active账户信息
   */
  static async getActiveAccount(userId: string) {
    return await accountRepo.getActiveAccount(userId);
  }

  /**
   * 根据ID获取账户信息
   * @param accountId - 账户ID
   * @returns 账户信息
   */
  static async getAccountById(accountId: string) {
    return await accountRepo.findByAccountId(accountId);
  }
}
