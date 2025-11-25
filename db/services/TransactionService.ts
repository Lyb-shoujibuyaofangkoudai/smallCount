
import type { InferInsertModel } from 'drizzle-orm';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { transactions } from '../schema';

type NewTransaction = InferInsertModel<typeof transactions>;

const transactionRepo = new TransactionRepository();

export const TransactionService = {
  /**
   * 创建新交易（包含余额更新）
   * @param transactionData - 交易数据
   * @returns 创建的交易对象
   */
  async createTransaction(transactionData: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>) {
    // 业务规则校验
    if (transactionData.amount <= 0) {
      throw new Error('交易金额必须大于0');
    }
    
    if (!transactionData.description || transactionData.description.trim().length === 0) {
      throw new Error('交易描述不能为空');
    }
    
    if (transactionData.description.length > 200) {
      throw new Error('交易描述不能超过200个字符');
    }
    
    // 转账交易需要验证目标账户
    if (transactionData.type === 'transfer' && !transactionData.transferAccountId) {
      throw new Error('转账交易必须指定目标账户');
    }
    
    return await transactionRepo.createTransactionWithBalanceUpdate(transactionData);
  },

  /**
   * 获取某月交易列表
   * @param accountId - 账户ID
   * @param year - 年份
   * @param month - 月份 (1-12)
   * @param pagination - 分页参数
   * @returns 分页的交易列表
   */
  async getTransactionsByMonth(
    accountId: string, 
    year: number, 
    month: number, 
    pagination?: { page?: number; pageSize?: number }
  ) {
    if (month < 1 || month > 12) {
      throw new Error('月份必须在1-12之间');
    }
    
    if (year < 2000 || year > 2100) {
      throw new Error('年份必须在2000-2100之间');
    }
    
    return await transactionRepo.findByMonth(accountId, year, month, pagination);
  },

  /**
   * 获取账户下所有交易记录
   * @param accountId - 账户ID
   * @returns 交易记录列表
   */
  async getTransactionsByAccount(accountId: string) {
    return await transactionRepo.findByAccountId(accountId);
  },

  /**
   * 获取某月交易统计
   * @param accountId - 账户ID
   * @param year - 年份
   * @param month - 月份 (1-12)
   * @returns 交易统计信息
   */
  async getMonthlyStats(accountId: string, year: number, month: number) {
    const result = await transactionRepo.findByMonth(accountId, year, month);
    
    const transactions = result.items;
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netFlow = totalIncome - totalExpense;
    
    return {
      totalIncome,
      totalExpense,
      netFlow,
      transactionCount: transactions.length,
      averageTransactionAmount: transactions.length > 0 
        ? (totalIncome + totalExpense) / transactions.length 
        : 0
    };
  },

  /**
   * 获取交易详情
   * @param transactionId - 交易ID
   * @returns 交易详情
   */
  async getTransactionDetail(transactionId: string) {
    // 这里可以添加关联查询，获取交易相关的标签、附件等信息
    // 目前先返回基础交易信息
    return await transactionRepo.findById(transactionId);
  },

  /**
   * 更新交易信息
   * @param transactionId - 交易ID
   * @param updateData - 更新数据
   * @returns 更新后的交易
   */
  async updateTransaction(
    transactionId: string, 
    updateData: Partial<Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    // 业务规则校验
    if (updateData.amount !== undefined && updateData.amount <= 0) {
      throw new Error('交易金额必须大于0');
    }
    
    if (updateData.description && updateData.description.length > 200) {
      throw new Error('交易描述不能超过200个字符');
    }
    
    return await transactionRepo.update(transactionId, updateData);
  },

  /**
   * 删除交易（软删除或硬删除）
   * @param transactionId - 交易ID
   * @returns 删除结果
   */
  async deleteTransaction(transactionId: string) {
    // 这里可以实现软删除逻辑，比如标记为已删除状态
    // 目前先实现硬删除
    return await transactionRepo.delete(transactionId);
  },

  /**
   * 搜索交易记录
   * @param accountId - 账户ID
   * @param keyword - 搜索关键词
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 匹配的交易列表
   */
  async searchTransactions(
    accountId: string, 
    keyword?: string, 
    startDate?: Date, 
    endDate?: Date
  ) {
    // 这里可以实现更复杂的搜索逻辑
    // 目前先返回账户下所有交易，后续可以添加全文搜索
    const transactions = await transactionRepo.findByAccountId(accountId);
    
    return transactions.filter(tx => {
      let match = true;
      
      // 关键词搜索
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        match = tx?.description?.toLowerCase()?.includes(searchTerm) || false;
      }
      
      // 日期范围过滤
      if (startDate && tx.transactionDate < startDate) {
        match = false;
      }
      
      if (endDate && tx.transactionDate > endDate) {
        match = false;
      }
      
      return match;
    });
  },

  /**
   * 创建简化交易记录（用于UI界面快速提交）
   * @param transactionData - 交易数据
   * @returns 创建的交易对象
   */
  async createSimpleTransaction(transactionData: {
    accountId: string;
    type: 'expense' | 'income';
    amount: number;
    tagId: string;
    description?: string;
    transactionDate: Date;
    paymentMethodId: string;
    note?: string;
    attachmentIds?: string;
  }) {
    // 基本参数校验
    if (!transactionData.accountId) {
      throw new Error('账户ID不能为空');
    }
    
    if (!transactionData.tagId) {
      throw new Error('分类ID不能为空');
    }
    
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error('交易金额必须大于0');
    }
    
    // 生成交易描述（如果没有提供）
    const description = transactionData.description || `${transactionData.type === 'income' ? '收入' : '支出'}交易`;
    
    // 设置默认日期为当前时间
    const transactionDate = transactionData.transactionDate || new Date();
    
    // 构建完整的交易数据
    const fullTransactionData: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
      accountId: transactionData.accountId,
      type: transactionData.type,
      amount: transactionData.amount,
      tagId: transactionData.tagId,
      description: description,
      transactionDate: transactionDate,
      paymentMethodId: transactionData.paymentMethodId,
      notes: transactionData.note || null,
      transferAccountId: null, // 简化版本不支持转账
      attachmentIds: null, // 简化版本不支持附件
      isRecurring: false, // 简化版本不支持定期交易
    };
    
    // 调用现有的创建方法
    return await this.createTransaction(fullTransactionData);
  }
};