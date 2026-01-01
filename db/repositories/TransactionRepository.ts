import Big from "big.js";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, between, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  PaginatedResult,
  PaginationParams,
  withPagination,
} from "../db-helper";
import { accounts, paymentMethods, tags, transactions } from "../schema";
import { BaseRepository } from "./BaseRepository";

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(transactions);
  }

  // 私有方法：应用交易对账户余额的影响
  private async _applyTransactionImpact(
    tx: any,
    transaction: Transaction
  ): Promise<void> {
    const account = await tx.query.accounts.findFirst({
      where: eq(accounts.id, transaction.accountId),
    });

    if (account) {
      const currentBalance = new Big(account.balance || 0);
      const transactionAmount = new Big(transaction.amount);
      let newBalance: Big;

      if (transaction.type === "expense") {
        newBalance = currentBalance.minus(transactionAmount);
      } else if (transaction.type === "income") {
        newBalance = currentBalance.plus(transactionAmount);
      } else {
        // 转账类型需要更复杂的处理，这里暂时不处理
        return;
      }

      await tx
        .update(accounts)
        .set({ balance: newBalance.toNumber() })
        .where(eq(accounts.id, transaction.accountId));
    }
  }

  // 私有方法：恢复交易对账户余额的影响
  private async _reverseTransactionImpact(
    tx: any,
    transaction: Transaction
  ): Promise<void> {
    const account = await tx.query.accounts.findFirst({
      where: eq(accounts.id, transaction.accountId),
    });

    if (account) {
      const currentBalance = new Big(account.balance || 0);
      const transactionAmount = new Big(transaction.amount);
      let newBalance: Big;

      // 反向操作：支出变收入，收入变支出
      if (transaction.type === "expense") {
        newBalance = currentBalance.plus(transactionAmount);
      } else if (transaction.type === "income") {
        newBalance = currentBalance.minus(transactionAmount);
      } else {
        // 转账类型需要更复杂的处理，这里暂时不处理
        return;
      }

      await tx
        .update(accounts)
        .set({ balance: newBalance.toNumber() })
        .where(eq(accounts.id, transaction.accountId));
    }
  }

  // 创建交易 (需要事务处理：更新余额)
  async createTransactionWithBalanceUpdate(
    data: Omit<NewTransaction, "id" | "createdAt" | "updatedAt" >
  ): Promise<Transaction> {
    return await this.db.transaction(async (tx) => {
      const id = this.generateId();

      // 1. 插入交易记录
      const [newTx] = await tx
        .insert(transactions)
        .values({
          ...data,
          id,
          updatedAt: new Date(),
        })
        .returning();

      // 2. 更新账户余额 (使用 big.js 处理金额计算，避免浮点数精度问题)
      // 注意：转账逻辑更复杂，这里仅展示基本结构
      if (data.type === "expense") {
        // 读取当前余额
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, data.accountId),
        });
        if (account) {
          const currentBalance = new Big(account.balance || 0);
          const transactionAmount = new Big(data.amount);
          const newBalance = currentBalance.minus(transactionAmount);

          await tx
            .update(accounts)
            .set({ balance: newBalance.toNumber() })
            .where(eq(accounts.id, data.accountId));
        }
      } else if (data.type === "income") {
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, data.accountId),
        });
        if (account) {
          const currentBalance = new Big(account.balance || 0);
          const transactionAmount = new Big(data.amount);
          const newBalance = currentBalance.plus(transactionAmount);

          await tx
            .update(accounts)
            .set({ balance: newBalance.toNumber() })
            .where(eq(accounts.id, data.accountId));
        }
      }

      return newTx;
    });
  }

  /**
   *  批量创建交易记录 （需要事务处理 ：更新余额）如果需要将数据插入到不同账户，则传入的data数据中需要包含accountId字段
   * @param dataArray 
   * @returns 
   */
  async createBatchTransactionsWithBalanceUpdate(
    dataArray: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">[]
  ): Promise<Transaction[]> {
    return await this.db.transaction(async (tx) => {
      // 1. 为每条交易记录生成ID并准备插入数据
      const transactionsToInsert = dataArray.map(data => ({
        ...data,
        id: this.generateId(),
        updatedAt: new Date(),
      }));

      // 2. 批量插入交易记录
      const newTransactions = await tx
        .insert(transactions)
        .values(transactionsToInsert)
        .returning();

      // 3. 按账户分组，计算每个账户的余额变化
      const accountBalanceChanges = new Map<string, Big>();
      
      for (const transaction of newTransactions) {
        const accountId = transaction.accountId;
        const amount = new Big(transaction.amount);
        
        // 初始化账户余额变化（如果不存在）
        if (!accountBalanceChanges.has(accountId)) {
          accountBalanceChanges.set(accountId, new Big(0));
        }
        
        // 根据交易类型更新余额变化
        if (transaction.type === "expense") {
          accountBalanceChanges.set(accountId, accountBalanceChanges.get(accountId)!.minus(amount));
        } else if (transaction.type === "income") {
          accountBalanceChanges.set(accountId, accountBalanceChanges.get(accountId)!.plus(amount));
        }
        // 转账类型需要更复杂的处理，这里暂时不处理
      }

      // 4. 一次性更新所有账户的余额
      for (const [accountId, balanceChange] of accountBalanceChanges.entries()) {
        // 获取当前账户余额
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, accountId),
        });
        
        if (account) {
          const currentBalance = new Big(account.balance || 0);
          const newBalance = currentBalance.plus(balanceChange);
          
          // 更新账户余额
          await tx
            .update(accounts)
            .set({ balance: newBalance.toNumber() })
            .where(eq(accounts.id, accountId));
        }
      }

      return newTransactions;
    });
  }


  // 获取某月交易列表（按账户、年、月过滤）
  async findByMonth(
    accountId: string,
    year: number,
    month: number,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<typeof transactions.$inferSelect>> {
    // 1. 计算时间范围
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const whereCondition = and(
      eq(transactions.accountId, accountId),
      between(transactions.transactionDate, startDate, endDate)
    );

    const dataQuery = this.db
      .select({ tx: transactions }) // 保持你原本的结构
      .from(transactions)
      .where(whereCondition)
      .orderBy(desc(transactions.transactionDate));

    // 4. 构建总数查询 (Count Query)
    const countQuery = this.db
      .select({ count: count() })
      .from(transactions)
      .where(whereCondition);

    // 5. 使用通用 helper 执行
    const result = await withPagination<{
      tx: typeof transactions.$inferSelect;
    }>(dataQuery, countQuery, pagination);

    // 6. 处理返回格式 (如果你想把 { tx: ... } 这一层解构掉)
    const r = {
      ...result,
      items: result.items.map((item) => item.tx), // 在这里做 map 转换
    };
    // console.log("findByMonth 查询结果:", r);
    return r;
  }

  // 获取某年所有交易列表（按账户、年过滤）
  async findByYear(
    accountId: string,
    year: number,
    pagination?: PaginationParams
  ) {
    // 1. 计算时间范围
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const whereCondition = and(
      eq(transactions.accountId, accountId),
      between(transactions.transactionDate, startDate, endDate)
    );

    const dataQuery = this.db
      .select({ tx: transactions }) // 保持你原本的结构
      .from(transactions)
      .where(whereCondition)
      .orderBy(desc(transactions.transactionDate));

    // 4. 构建总数查询 (Count Query)
    const countQuery = this.db
      .select({ count: count() })
      .from(transactions)
      .where(whereCondition);

    // 5. 使用通用 helper 执行
    const result = await withPagination<{
      tx: typeof transactions.$inferSelect;
    }>(dataQuery, countQuery, pagination);

    // 6. 处理返回格式 (如果你想把 { tx: ... } 这一层解构掉)
    const r = {
      ...result,
      items: result.items.map((item) => item.tx), // 在这里做 map 转换
    };
    // console.log("findByYear 查询结果:", r);
    return r;
  }

  // 获取某年或某月的收支统计（包括标签和支付方式统计）
  async findByYearMonth(accountId: string, year: number, month?: number) {
    // 1. 确定时间范围
    let startDate: Date;
    let endDate: Date;
    
    if (month) {
      // 指定了月份，获取该月的数据
      startDate = new Date(year, month - 1, 1, 0, 0, 0); // 月份从0开始，所以减1
      endDate = new Date(year, month, 0, 23, 59, 59); // 获取该月最后一天
    } else {
      // 获取整年的数据
      startDate = new Date(year, 0, 1, 0, 0, 0); // 当年1月1日00:00:00
      endDate = new Date(year, 11, 31, 23, 59, 59); // 当年12月31日23:59:59
    }

    // 2. 获取基本收支统计
    const monthExpr = sql<number>`CAST(strftime('%m', ${transactions.transactionDate}, 'unixepoch', 'localtime') AS INTEGER)`;

    const basicStatsResults = await this.db
      .select({
        month: monthExpr,
        income: sql<number>`TOTAL(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
        expense: sql<number>`TOTAL(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
        balance: sql<number>`TOTAL(CASE 
          WHEN ${transactions.type} = 'income' THEN ${transactions.amount} 
          WHEN ${transactions.type} = 'expense' THEN -${transactions.amount} 
          ELSE 0 
        END)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          between(transactions.transactionDate, startDate, endDate)
        )
      )
      .groupBy(monthExpr)
      .orderBy(monthExpr);

    // 3. 获取标签统计
    const tagStatsResults = await this.db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        tagIcon: tags.icon,
        tagType: tags.type,
        month: monthExpr,
        amount: sql<number>`TOTAL(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(tags, eq(transactions.tagId, tags.id))
      .where(
        and(
          eq(transactions.accountId, accountId),
          between(transactions.transactionDate, startDate, endDate)
        )
      )
      .groupBy(tags.id, monthExpr)
      .orderBy(desc(sql<number>`TOTAL(${transactions.amount})`));

    // 4. 获取支付方式统计
    const paymentMethodStatsResults = await this.db
      .select({
        paymentMethodId: paymentMethods.id,
        paymentMethodName: paymentMethods.name,
        paymentMethodIcon: paymentMethods.icon,
        month: monthExpr,
        amount: sql<number>`TOTAL(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
      .where(
        and(
          eq(transactions.accountId, accountId),
          between(transactions.transactionDate, startDate, endDate)
        )
      )
      .groupBy(paymentMethods.id, monthExpr)
      .orderBy(desc(sql<number>`TOTAL(${transactions.amount})`));

    // 5. 补全月份数据
    const fullData = month ? {
      // 单个月的数据
      month: month,
      income: basicStatsResults[0]?.income || 0,
      expense: basicStatsResults[0]?.expense || 0,
      balance: basicStatsResults[0]?.balance || 0,
      tagStats: tagStatsResults.filter(item => item.month === month).map(item => ({
        id: item.tagId,
        name: item.tagName,
        color: item.tagColor,
        icon: item.tagIcon,
        type: item.tagType,
        amount: item.amount,
      })),
      paymentMethodStats: paymentMethodStatsResults.filter(item => item.month === month).map(item => ({
        id: item.paymentMethodId,
        name: item.paymentMethodName,
        icon: item.paymentMethodIcon,
        amount: item.amount,
      }))
    } : {
      // 整年的数据
      months: Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const found = basicStatsResults.find((r) => r.month === m);

        return {
          month: m,
          income: found?.income || 0,
          expense: found?.expense || 0,
          balance: found?.balance || 0,
          tagStats: tagStatsResults.filter(item => item.month === m).map(item => ({
            id: item.tagId,
            name: item.tagName,
            color: item.tagColor,
            icon: item.tagIcon,
            type: item.tagType,
            amount: item.amount,
          })),
          paymentMethodStats: paymentMethodStatsResults.filter(item => item.month === m).map(item => ({
            id: item.paymentMethodId,
            name: item.paymentMethodName,
            icon: item.paymentMethodIcon,
            amount: item.amount,
          }))
        };
      })
    };

    return fullData;
  }

  // 获取用户某账户下所有交易记录
  async findByAccountId(accountId: string) {
    return await this.db.query.transactions.findMany({
      where: eq(transactions.accountId, accountId),
      orderBy: [desc(transactions.transactionDate)],
    });
  }

  // 更新交易（包含余额更新）
  async update(
    id: string,
    data: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>
  ) {
    return await this.db.transaction(async (tx) => {
      // 1. 获取原始交易记录
      const originalTx = await tx.query.transactions.findFirst({
        where: eq(transactions.id, id),
      });

      if (!originalTx) {
        throw new Error(`交易记录不存在: ${id}`);
      }

      // 2. 更新交易记录
      const [updated] = await tx
        .update(transactions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, id))
        .returning();

      // 3. 检查是否需要更新账户余额
      const amountChanged =
        data.amount !== undefined && data.amount !== originalTx.amount;
      const typeChanged =
        data.type !== undefined && data.type !== originalTx.type;
      const accountChanged =
        data.accountId !== undefined && data.accountId !== originalTx.accountId;

      // 4. 处理账户余额更新
      if (amountChanged || typeChanged || accountChanged) {
        if (accountChanged) {
          // 账户变更：需要处理两个账户的余额
          // 先恢复原始账户的余额影响
          await this._reverseTransactionImpact(tx, originalTx);

          // 再应用新账户的余额影响
          await this._applyTransactionImpact(tx, updated);
        } else {
          // 同一账户内的变更
          // 先恢复原始交易对余额的影响
          await this._reverseTransactionImpact(tx, originalTx);

          // 再应用更新后交易对余额的影响
          await this._applyTransactionImpact(tx, updated);
        }
      }

      return updated;
    });
  }

  /**
   * 批量更新交易记录（包含余额更新）
   * @param ids - 交易记录ID数组
   * @returns 更新的交易记录数组
   */
  async updateBatch(
    ids: string[],
    data: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>
  ) {
    
  }

  // 根据ID查找交易
  async findById(id: string) {
    return await this.db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });
  }

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
    // 确定时间范围
    let startDate: Date;
    let endDate: Date;
    
    if (month) {
      // 指定了月份，获取该月的数据
      startDate = new Date(year, month - 1, 1, 0, 0, 0);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      // 获取整年的数据
      startDate = new Date(year, 0, 1, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // 构建查询条件
    const conditions = [
      eq(transactions.accountId, accountId),
      between(transactions.transactionDate, startDate, endDate)
    ];
 
    // 如果指定了交易类型，添加类型过滤
    if (type) {
      conditions.push(eq(transactions.type, type));
    }

    // 执行查询
    const result = await this.db
      .select({
        total: sql<number>`TOTAL(${transactions.amount})`
      })
      .from(transactions)
      .where(and(...conditions));
      console.log('查询汇总结果:', result);

    // 返回统计金额（如果没有数据返回0）
    return result[0]?.total || 0;
  }

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
    accountIds: string[],
    tagIds: string[],
    paymentMethodIds: string[],
    startDate: Date,
    endDate: Date
  ) {
    // 构建查询条件
    const conditions = [
      inArray(transactions.accountId, accountIds),
      inArray(transactions.tagId, tagIds),
      inArray(transactions.paymentMethodId, paymentMethodIds),
      between(transactions.transactionDate, startDate, endDate)
    ];
     // 执行查询 
    const result = await this.db
      .select()
      .from(transactions)
      .where(and(...conditions));
    return result;
  }

  /**
   * 删除交易记录（包含余额更新）
   * @param id - 交易记录ID
   * @returns 删除的交易记录
   */
  async delete(id: string) {
    return await this.db.transaction(async (tx) => {
      // 1. 获取交易记录
      const transaction = await tx.query.transactions.findFirst({
        where: eq(transactions.id, id),
      });

      if (!transaction) {
        throw new Error(`交易记录不存在: ${id}`);
      }

      // 2. 恢复交易对账户余额的影响
      await this._reverseTransactionImpact(tx, transaction);

      // 3. 删除交易记录
      const [deleted] = await tx
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      return deleted;
    });
  }
}
