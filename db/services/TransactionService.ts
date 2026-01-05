
import type { InferInsertModel } from 'drizzle-orm';
import { PaginationParams } from '../db-helper';
import { Account } from '../repositories/AccountRepository';
import { Attachment, AttachmentRepository } from '../repositories/AttachmentRepository';
import type { NewPaymentMethod, PaymentMethod } from '../repositories/PaymentMethodRepository';
import { PaymentMethodRepository } from '../repositories/PaymentMethodRepository';
import { NewTag, TagRepository } from '../repositories/TagRepository';
import type { Transaction } from '../repositories/TransactionRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { transactions } from '../schema';

type NewTransaction = InferInsertModel<typeof transactions>;

const transactionRepo = new TransactionRepository();
const tagRepo = new TagRepository();
const paymentMethodRepo = new PaymentMethodRepository();
const attachmentRepo = new AttachmentRepository();

// 定义包含标签和支付方式信息的交易记录类型
export interface TransactionWithDetailInfo extends Transaction {
  tag?: Omit<NewTag, 'id' | 'createdAt' | 'updatedAt'>;
  paymentMethod?: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>;
  attachments?: Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>[];
  fromAccount?: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;
  transferAccount?: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;
}

// 定义每周统计数据接口
export interface WeeklyStats {
  week: number; // 周数（1-4）
  startDate: Date; // 周开始日期
  endDate: Date; // 周结束日期
  income: number; // 收入总额
  expense: number; // 支出总额
  transactions: TransactionWithDetailInfo[]; // 本周交易记录
}

export interface PaginatedTransactionsWithDetailInfo {
  items: TransactionWithDetailInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  weeklyStats?: WeeklyStats[]; // 可选的每周统计信息
}

// 定义包含items的结果类型
interface ResultWithItems {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
    if (transactionData.type === 'transfer') {
      if (!transactionData.fromAccountId) {
        throw new Error('转账交易必须指定转出账户');
      }
      if (!transactionData.transferAccountId) {
        throw new Error('转账交易必须指定转入账户');
      }
      if (transactionData.fromAccountId === transactionData.transferAccountId) {
        throw new Error('转出账户和转入账户不能相同');
      }
    }
    
    return await transactionRepo.createTransactionWithBalanceUpdate(transactionData);
  },

  /**
   * 批量创建交易记录（包含余额更新）
   * @param transactionsData - 交易数据列表
   * @returns 创建的交易对象列表
   */
  async createTransactionsBatch(transactionsData: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>[]) {
    // 批量创建交易记录
    const createdTransactions = await transactionRepo.createBatchTransactionsWithBalanceUpdate(transactionsData);
    
    // 为交易记录添加标签和支付方式信息
    const enrichedTransactions = await this.enrichTransactionsWithDetailInfo({
      items: createdTransactions,
      total: createdTransactions.length,
      page: 1,
      pageSize: createdTransactions.length,
      totalPages: 1
    });
    
    return enrichedTransactions;
  },

  /**
   * 私有方法：为交易记录添加标签和支付方式信息
   * @param result - 包含交易记录的结果对象
   * @returns 带有标签和支付方式信息的交易记录列表
   */
   async enrichTransactionsWithDetailInfo(
    result: ResultWithItems
  ): Promise<TransactionWithDetailInfo[]> {
    const tagIds = result.items
          .map(tx => tx.tagId)
          .filter((tagId): tagId is string => tagId !== null && tagId !== undefined);
          
    const paymentMethodIds = result.items
          .map(tx => tx.paymentMethodId)
          .filter((paymentMethodId): paymentMethodId is string => paymentMethodId !== null && paymentMethodId !== undefined)

    const attachmentIds = result.items
          .map(tx => tx.attachmentIds?.split(',') || [])
          .flat();
    
    // 批量获取标签信息
    const tagsMap = new Map<string, Omit<NewTag, 'id' | 'createdAt' | 'updatedAt'>>();
    if (tagIds.length > 0) {
      const tags = await tagRepo.findByIds(tagIds);
      tags.forEach(tag => {
        if (tag) {
          tagsMap.set(tag.id, tag);
        }
      });
    }
    
    // 批量获取支付方式信息
    const paymentMethodsMap = new Map<string, Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>>();
    if (paymentMethodIds.length > 0) {
      const paymentMethods = await paymentMethodRepo.findByIds(paymentMethodIds);
      paymentMethods.forEach(paymentMethod => {
        if (paymentMethod) {
          paymentMethodsMap.set(paymentMethod.id, paymentMethod);
        }
      });
    }
    
    // 批量获取附件信息
    const attachmentsMap = new Map<string, Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>>();
    if (attachmentIds.length > 0) {
      const attachments = await attachmentRepo.findByIds(attachmentIds);
      attachments.forEach(attachment => {
        if (attachment) {
          attachmentsMap.set(attachment.id, attachment);
        }
      });
    }
    
    // 拼装交易记录、标签信息和支付方式信息
    return result.items.map(tx => ({
      ...tx,
      tag: tx.tagId ? tagsMap.get(tx.tagId) : undefined,
      paymentMethod: tx.paymentMethodId ? paymentMethodsMap.get(tx.paymentMethodId) : undefined,
      attachments: tx.attachmentIds ? tx.attachmentIds.split(',').map(id => attachmentsMap.get(id)) as Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>[] : []
    }));
  },

  /**
   * 获取某月交易列表（包含标签和支付方式信息）
   * @param accountId - 账户ID
   * @param year - 年份
   * @param month - 月份 (1-12)
   * @param pagination - 分页参数
   * @returns 分页的交易列表（包含标签和支付方式信息）
   */
  async getTransactionsByMonth(
    accountId: string, 
    year: number, 
    month: number, 
    pagination?: { page?: number; pageSize?: number, ignorePagination?: boolean }
  ): Promise<PaginatedTransactionsWithDetailInfo> {
    if (month < 1 || month > 12) {
      throw new Error('月份必须在1-12之间');
    }
    
    if (year < 2000 || year > 2100) {
      throw new Error('年份必须在2000-2100之间');
    }
    
    // 获取基础交易数据
    const result = await transactionRepo.findByMonth(accountId, year, month, pagination);
    
    // 使用封装的方法添加标签和支付方式信息
    const transactionsWithTagsAndPaymentMethods = await this.enrichTransactionsWithDetailInfo(result);
    
    return {
      items: transactionsWithTagsAndPaymentMethods,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    };
  },

  /**
   * 获取某年某月中每周的交易列表（包含标签和支付方式信息）
   * @param accountId - 账户ID
   * @param year - 年份
   * @param month - 月份 (1-12)
   * @param pagination - 分页参数
   * @returns 分页的交易列表（包含标签和支付方式信息）
   */
  async getTransactionsByWeek(
    accountId: string, 
    year: number, 
    month: number, 
    pagination?: PaginationParams
  ): Promise<PaginatedTransactionsWithDetailInfo> {
    // 参数校验
    if (month < 1 || month > 12) {
      throw new Error('月份必须在1-12之间');
    }
    
    if (year < 2000 || year > 2100) {
      throw new Error('年份必须在2000-2100之间');
    }

    
    // 获取基础交易数据
    const result = await transactionRepo.findByMonth(accountId, year, month, {
      ...pagination,
      ignorePagination: true,
    });
    
    // 使用封装的方法添加标签和支付方式信息
    const transactionsWithTagsAndPaymentMethods = await this.enrichTransactionsWithDetailInfo(result);
    
    // 按周分组
    
    // 计算当前月份的四周日期范围
    const getWeeksInMonth = (year: number, month: number): WeeklyStats[] => {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0); // 本月最后一天
      const weeks: WeeklyStats[] = [];
      
      // 计算本月有多少天
      const daysInMonth = monthEnd.getDate();
      
      // 计算每周的开始和结束日期
      // 将一个月分成4周，大致均匀分布
      const daysPerWeek = Math.ceil(daysInMonth / 4);
      
      for (let i = 0; i < 4; i++) {
        const weekStartDate = new Date(year, month - 1, i * daysPerWeek + 1);
        const weekEndDate = i === 3 
          ? monthEnd // 最后一周结束于月底
          : new Date(year, month - 1, (i + 1) * daysPerWeek);
        
        weeks.push({
          week: i + 1,
          startDate: weekStartDate,
          endDate: weekEndDate,
          income: 0,
          expense: 0,
          transactions: []
        });
      }
      
      return weeks;
    };
    
    // 获取四周数据结构
    const weeks = getWeeksInMonth(year, month);
    
    // 按周分组交易记录并统计收支
    transactionsWithTagsAndPaymentMethods.forEach(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      
      // 找到交易所在的周
      const week = weeks.find(w => {
        return transactionDate >= w.startDate && transactionDate <= w.endDate;
      });
      
      if (week) {
        week.transactions.push(transaction);
        
        // 统计收支
        if (transaction.type === 'income') {
          week.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          week.expense += transaction.amount;
        }
      }
    });

    console.log("按周分组结果:", weeks);
    
    // 调整返回数据，包含每周统计信息
    return {
      items: transactionsWithTagsAndPaymentMethods,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      weeklyStats: weeks // 添加每周统计信息
    };
  },

  /**
   * 获取某年所有月份的交易收支统计情况
   * @param accountId - 账户ID
   * @param year - 年份
   * @param pagination - 分页参数
   * @returns 交易记录列表
   */
  async getTransactionsByYear(
    accountId: string, 
    year: number, 
  ) {
    // 参数校验
    if (year < 2000 || year > 2100) {
      throw new Error('年份必须在2000-2100之间');
    }
    
    // 获取基础交易数据
    return await transactionRepo.findByYearMonth(accountId, year);
    
  
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
    const result = await this.getTransactionsByMonth(accountId, year, month);
    
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
   * 获取交易详情（包含标签和支付方式信息）
   * @param transactionId - 交易ID
   * @returns 交易详情（包含标签和支付方式信息）
   */
  async getTransactionDetail(transactionId: string): Promise<TransactionWithDetailInfo | undefined> {
    const transaction = await transactionRepo.findById(transactionId);
    
    if (!transaction) {
      return undefined;
    }
    
    const enrichedTransactions = await this.enrichTransactionsWithDetailInfo({
      items: [transaction],
      total: 1,
      page: 1,
      pageSize: 1,
      totalPages: 1
    });
    
    return enrichedTransactions[0];
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

    console.log("更新交易数据:", updateData);
    
    return await transactionRepo.update(transactionId, updateData);
  },

  /**
   * 删除交易记录（包含余额恢复）
   * @param transactionId - 交易ID
   * @returns 删除结果
   */
  async deleteTransaction(transactionId: string) {
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
   * 获取某年或某月总支出或总收入
   * @param accountId - 账户ID
   * @param year - 年份
   * @param month - 月份 (可选，不传则统计整年)
   * @param type - 交易类型 ('income' 或 'expense')
   * @returns 统计金额
   */
  async getTotalAmountByPeriod(
    accountId: string,
    year: number,
    month?: number,
    type?: 'income' | 'expense'
  ): Promise<number> {
    // 参数校验
    if (!accountId) {
      throw new Error('账户ID不能为空');
    }
    
    if (year < 2000 || year > 2100) {
      throw new Error('年份必须在2000-2100之间');
    }
    
    if (month && (month < 1 || month > 12)) {
      throw new Error('月份必须在1-12之间');
    }

    // 调用仓库层方法获取统计金额
    return await transactionRepo.getTotalAmountByPeriod(accountId, year, month, type);
  },

  /**
   * 获取同比/环比数据
   * @param accountId - 账户ID
   * @param year - 当前年份
   * @param month - 当前月份 (可选)
   * @param type - 交易类型 ('income' 或 'expense')
   * @returns 包含当前金额、对比金额和变化百分比的对象
   */
  async getComparisonData(
    accountId: string,
    year: number,
    month?: number,
    type?: 'income' | 'expense'
  ): Promise<{
    currentAmount: number;
    compareAmount: number;
    percentageChange: number;
  }> {
    // 参数校验
    if (!accountId) {
      throw new Error('账户ID不能为空'); 
    } 
    
    // 获取当前时期的金额
    const currentAmount = await this.getTotalAmountByPeriod(accountId, year, month, type);
    
    // 确定对比时期的参数
    let compareYear: number;
    let compareMonth: number | undefined;
    
    if (month) {
      // 有月份参数，表示月环比或年同比
      if (year > 2000) {
        // 月同比：去年同月
        compareYear = year;
        compareMonth = month  - 1;
      } else {
        throw new Error('年份必须大于2000才能进行同比比较');
      }
    } else {
      // 没有月份参数，表示年同比
      if (year > 2000) {
        compareYear = year - 1;
        compareMonth = undefined;
      } else {
        throw new Error('年份必须大于2000才能进行同比比较');
      }
    }
    
    // 获取对比时期的金额
    const compareAmount = await this.getTotalAmountByPeriod(accountId, compareYear, compareMonth, type);
    console.log('currentAmount:', currentAmount);
    console.log('compareAmount:', compareAmount);
    // 计算变化百分比
    let percentageChange = 0;
    if (compareAmount !== 0) {
      percentageChange = ((currentAmount - compareAmount) / compareAmount) * 100;
    } else if (currentAmount > 0) {
      // 如果对比金额为0，而当前金额大于0，则变化率为100%
      percentageChange = 100;
    }
    
    return {
      currentAmount,
      compareAmount,
      percentageChange
    };
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
  },

  /**
   * 根据筛选条件查询交易记录
   * @param accountIds - 账户ID列表
   * @param tagIds - 标签ID列表
   * @param paymentMethodIds - 支付方式ID列表
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 符合条件的交易记录列表
   */
  async getTransactionsByFilters(
    accounts: Account[],
    tags: NewTag[],
    paymentMethods: NewPaymentMethod[],
    startDate: Date,
    endDate: Date,
  ) {
    const accountIds = accounts.map(account => account.id);
    const tagIds = tags.map(tag => tag.id);
    const paymentMethodIds = paymentMethods.map(method => method.id);
    
    const result =  await transactionRepo.getTransactionsByFilters(
      accountIds,
      tagIds,
      paymentMethodIds,
      startDate,
      endDate
    );

    return await this.enrichTransactionsWithDetailInfo({
      items: result,
      total: result.length, 
      page: 1,
      pageSize: result.length,
      totalPages: 1,
    });
  }
}
