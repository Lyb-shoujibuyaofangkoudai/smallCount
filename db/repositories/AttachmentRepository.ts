import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { and, count, desc, eq, inArray } from 'drizzle-orm';
import { withPagination, type PaginatedResult, type PaginationParams } from '../db-helper';
import { accounts, attachments, transactions } from '../schema';
import { BaseRepository } from './BaseRepository';

export type Attachment = InferSelectModel<typeof attachments>;
export type NewAttachment = InferInsertModel<typeof attachments>;

export class AttachmentRepository extends BaseRepository<Attachment> {
  constructor() {
    super(attachments);
  }

  // 创建附件记录
  async create(data: Omit<NewAttachment, 'id' | 'updatedAt'>): Promise<Attachment> {
    const id = this.generateId();
    const [newAttachment] = await this.db.insert(attachments).values({
      ...data,
      id,
      updatedAt: new Date()
    }).returning();
    return newAttachment;
  }

  // 批量创建附件记录
  async createBatch(data: Omit<NewAttachment, 'id' | 'updatedAt'>[]): Promise<Attachment[]> {
    const newAttachments = await this.db.insert(attachments).values(data.map(item => ({
      ...item,
      id: this.generateId(),
      updatedAt: new Date()
    }))).returning();
    return newAttachments;
  }

  // 通过ID获取附件
  async findById(id: string, userId: string): Promise<Attachment | undefined> {
    const rows = await this.db
      .select({ attachment: attachments })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(attachments.id, id), eq(accounts.userId, userId)))
      .limit(1);
    return rows[0]?.attachment;
  }

  // 通过ids获取相关附件
  async findByIds(ids: string[]): Promise<Attachment[]> {
    const rows = await this.db
      .select({ attachment: attachments })
      .from(attachments)
      .where(inArray(attachments.id, ids));
    return rows.map(r => r.attachment);
  }

  // 获取单个交易的所有附件
  async findByTransaction(transactionId: string, userId: string): Promise<Attachment[]> {
    const rows = await this.db
      .select({ attachment: attachments })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(attachments.transactionId, transactionId), eq(accounts.userId, userId)))
      .orderBy(({ attachment }) => desc(attachment.updatedAt));
    return rows.map(r => r.attachment);
  }

  // 获取用户的所有附件（分页）
  async findByUser(
    userId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<{ attachment: Attachment }>> {
    const whereCondition = eq(accounts.userId, userId);

    const dataQuery = this.db
      .select({ attachment: attachments })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereCondition)
      .orderBy(({ attachment }) => desc(attachment.updatedAt));

    // 构建总数查询
    const countQuery = this.db
      .select({ count: count() })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereCondition);

    // 使用通用 helper 执行
    return await withPagination<{ attachment: Attachment }>(dataQuery, countQuery, pagination);
  }

  // 删除附件
  async delete(id: string, userId: string): Promise<void> {
    const canDelete = await this.hasAccess(id, userId);
    if (!canDelete) return;
    await this.db.delete(attachments).where(eq(attachments.id, id));
  }

  // 批量删除附件
  async deleteMultiple(ids: string[], userId: string): Promise<void> {
    const allowed = await this.db
      .select({ id: attachments.id })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(inArray(attachments.id, ids), eq(accounts.userId, userId)));
    const allowedIds = allowed.map(r => r.id);
    if (allowedIds.length === 0) return;
    await this.db.delete(attachments).where(inArray(attachments.id, allowedIds));
  }

  // 删除交易的所有附件
  async deleteByTransaction(transactionId: string, userId: string): Promise<void> {
    const ownsTx = await this.db
      .select({ id: transactions.id })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(transactions.id, transactionId), eq(accounts.userId, userId)))
      .limit(1);
    if (ownsTx.length === 0) return;
    await this.db.delete(attachments).where(eq(attachments.transactionId, transactionId));
  }

  // 更新附件信息
  async update(
    id: string,
    userId: string,
    data: Partial<Omit<NewAttachment, 'id' | 'transactionId' | 'updatedAt'>>
  ): Promise<Attachment | undefined> {
    const canUpdate = await this.hasAccess(id, userId);
    if (!canUpdate) return undefined;
    const [updated] = await this.db
      .update(attachments)
      .set(data)
      .where(eq(attachments.id, id))
      .returning();
    return updated;
  }

  // 获取附件统计信息
  async getAttachmentStats(userId: string): Promise<{
    totalCount: number;
    totalSize: number;
    byFileType: Record<string, number>;
  }> {
    const countResult = await this.db
      .select({ count: sql`count(*)` })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId));

    const sizeResult = await this.db
      .select({ totalSize: sum(attachments.fileSize).mapWith(Number) })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId));

    const typeResult = await this.db
      .select({ fileType: attachments.fileType, count: sql`count(*)` })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .groupBy(attachments.fileType);

    const byFileType: Record<string, number> = {};
    typeResult.forEach(item => {
      const type = item.fileType || 'unknown';
      byFileType[type] = Number(item.count);
    });

    return {
      totalCount: Number(countResult[0]?.count) || 0,
      totalSize: sizeResult[0]?.totalSize ?? 0,
      byFileType
    };
  }

  // 检查用户是否拥有该附件
  async hasAccess(id: string, userId: string): Promise<boolean> {
    const attachment = await this.findById(id, userId);
    return !!attachment;
  }

  // 获取最近上传的附件
  async getRecentAttachments(userId: string, limit: number = 10): Promise<Attachment[]> {
    const rows = await this.db
      .select({ attachment: attachments })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .orderBy(({ attachment }) => desc(attachment.updatedAt))
      .limit(limit);
    return rows.map(r => r.attachment);
  }

  // 查找指定类型的附件
  async findByFileType(userId: string, fileType: string): Promise<Attachment[]> {
    const rows = await this.db
      .select({ attachment: attachments })
      .from(attachments)
      .innerJoin(transactions, eq(attachments.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(accounts.userId, userId), eq(attachments.fileType, fileType)))
      .orderBy(({ attachment }) => desc(attachment.updatedAt));
    return rows.map(r => r.attachment);
  }

  // 重命名附件
  async rename(id: string, userId: string, newFileName: string): Promise<Attachment | undefined> {
    return await this.update(id, userId, { fileName: newFileName });
  }
}

// 添加sql和sum导入以支持聚合查询
import { sql, sum } from 'drizzle-orm';

