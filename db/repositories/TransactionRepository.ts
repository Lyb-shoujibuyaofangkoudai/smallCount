import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, between, count, desc, eq } from "drizzle-orm";
import {
  PaginatedResult,
  PaginationParams,
  withPagination,
} from "../db-helper";
import { accounts, transactions } from "../schema";
import { BaseRepository } from "./BaseRepository";

type Transaction = InferSelectModel<typeof transactions>;
type NewTransaction = InferInsertModel<typeof transactions>;

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

      // 2. 更新账户余额 (简单的业务逻辑：支出减，收入加)
      // 注意：转账逻辑更复杂，这里仅展示基本结构
      if (data.type === "expense") {
        // 读取当前余额 (这里为了演示简单处理，实际可能需要原子更新)
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, data.accountId),
        });
        if (account) {
          await tx
            .update(accounts)
            .set({ balance: (account.balance || 0) - data.amount })
            .where(eq(accounts.id, data.accountId));
        }
      } else if (data.type === "income") {
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, data.accountId),
        });
        if (account) {
          await tx
            .update(accounts)
            .set({ balance: (account.balance || 0) + data.amount })
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

  // 更新交易
  async update(id: string, data: Partial<Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>>) {
    const [updated] = await this.db
      .update(transactions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return updated;
  }

  // 删除交易
  async delete(id: string) {
    const [deleted] = await this.db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    
    return deleted;
  }

  // 根据ID查找交易
  async findById(id: string) {
    return await this.db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });
  }
}
