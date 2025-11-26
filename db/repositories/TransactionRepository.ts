import Big from "big.js";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, between, count, desc, eq } from "drizzle-orm";
import {
  PaginatedResult,
  PaginationParams,
  withPagination,
} from "../db-helper";
import { accounts, transactions } from "../schema";
import { BaseRepository } from "./BaseRepository";

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(transactions);
  }

  // 创建交易 (需要事务处理：更新余额)
  async createTransactionWithBalanceUpdate(
    data: Omit<NewTransaction, "id" | "createdAt" | "updatedAt" | "categoryId">
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
    }
    // console.log("findByMonth 查询结果:", r);
    return r;
  }

  // 获取用户某账户下所有交易记录
  async findByAccountId(accountId: string) {
    return await this.db.query.transactions.findMany({
      where: eq(transactions.accountId, accountId),
      orderBy: [desc(transactions.transactionDate)],
    });
  }

  // 更新交易（包含余额更新）
  async update(id: string, data: Partial<Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>>) {
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
      const amountChanged = data.amount !== undefined && data.amount !== originalTx.amount;
      const typeChanged = data.type !== undefined && data.type !== originalTx.type;
      const accountChanged = data.accountId !== undefined && data.accountId !== originalTx.accountId;
      
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

  // 删除交易（包含余额更新）
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

  // 根据ID查找交易
  async findById(id: string) {
    return await this.db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });
  }

  // 私有方法：应用交易对账户余额的影响
  private async _applyTransactionImpact(tx: any, transaction: Transaction): Promise<void> {
    const account = await tx.query.accounts.findFirst({
      where: eq(accounts.id, transaction.accountId),
    });
    
    if (account) {
      const currentBalance = new Big(account.balance || 0);
      const transactionAmount = new Big(transaction.amount);
      let newBalance: Big;
      
      if (transaction.type === 'expense') {
        newBalance = currentBalance.minus(transactionAmount);
      } else if (transaction.type === 'income') {
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
  private async _reverseTransactionImpact(tx: any, transaction: Transaction): Promise<void> {
    const account = await tx.query.accounts.findFirst({
      where: eq(accounts.id, transaction.accountId),
    });
    
    if (account) {
      const currentBalance = new Big(account.balance || 0);
      const transactionAmount = new Big(transaction.amount);
      let newBalance: Big;
      
      // 反向操作：支出变收入，收入变支出
      if (transaction.type === 'expense') {
        newBalance = currentBalance.plus(transactionAmount);
      } else if (transaction.type === 'income') {
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
}
