import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import { accounts } from '../schema';
import { BaseRepository } from './BaseRepository';

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super(accounts);
  }

  // 创建账户
  async create(data: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const id = this.generateId();
    const [newAccount] = await this.db.insert(accounts).values({
      ...data,
      id,
      updatedAt: new Date(),
    }).returning(); // SQLite 支持 returning
    return newAccount;
  }

  // 获取用户的所有账户
  async findByUser(userId: string): Promise<Account[]> {
    return await this.db.query.accounts.findMany({
      where: and(eq(accounts.userId, userId), eq(accounts.isArchived, false)),
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });
  } 

  // 更新账户
  async update(id: string, data: Partial<Omit<NewAccount, 'id' | 'userId' | 'createdAt'>>): Promise<Account | undefined> {
    const [updated] = await this.db.update(accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return updated;
  }

  // 物理删除账户 (级联删除由数据库外键处理，但也需注意逻辑删除需求)
  async delete(id: string): Promise<void> {
    await this.db.delete(accounts).where(eq(accounts.id, id));
  }
  
  // 设置默认账户逻辑 (事务示例)
  async setAsDefault(userId: string, accountId: string): Promise<void> {
      await this.db.transaction(async (tx) => {
          // 1. 将该用户其他账户设为非默认
          await tx.update(accounts)
            .set({ isDefault: false })
            .where(and(eq(accounts.userId, userId), eq(accounts.isDefault, true)));
          
          // 2. 将目标账户设为默认
          await tx.update(accounts)
            .set({ isDefault: true })
            .where(eq(accounts.id, accountId));
      });
  }

  // 设置账户为已归档
  async setAsArchived(accountId: string): Promise<void> {
    await this.db.update(accounts)
      .set({ isArchived: true })
      .where(eq(accounts.id, accountId));
  }

  /**
   * 获取用户的active账户
   * @param userId - 用户ID
   * @returns active账户信息
   */
  async getActiveAccount(userId: string): Promise<Account | undefined> {
    return await this.db.query.accounts.findFirst({
      where: and(eq(accounts.userId, userId), eq(accounts.isArchived, false)),
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });
  }

  /**
   * 根据ID获取账户信息
   * @param accountId - 账户ID
   * @returns 账户信息
   */
  async findByAccountId(accountId: string): Promise<Account | undefined> {
    return await this.db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.isArchived, false)),
    });
  }
}