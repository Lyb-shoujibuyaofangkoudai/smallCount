import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, isNull, like, or, sql } from "drizzle-orm";
import { tags } from "../schema";
import { BaseRepository } from "./BaseRepository";

export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super(tags);
  }

  // 创建标签
  async create(data: Omit<NewTag, "id" | "createdAt">): Promise<Tag> {
    const id = this.generateId();
    const [newTag] = await this.db
      .insert(tags)
      .values({
        ...data,
        id,
        createdAt: new Date(),
      })
      .returning();
    return newTag;
  }

  // 通过ID获取标签
  async findById(id: string): Promise<Tag | undefined> {
    return await this.db.query.tags.findFirst({
      where: eq(tags.id, id),
    });
  }

  // 通过name获取标签 存在多个优先获取第一个
  async findByName(name: string): Promise<Tag | undefined> {
    return await this.db.query.tags.findFirst({
      where: eq(tags.name, name),
    });
  }

  // 更新标签
  async update(
    id: string,
    data: Partial<Omit<NewTag, "id" | "transactionId" | "createdAt">>
  ): Promise<Tag | undefined> {
    const [updated] = await this.db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return updated;
  }

  // 删除标签
  async delete(id: string): Promise<void> {
    await this.db.delete(tags).where(eq(tags.id, id));
  }

  // 获取所有标签
  async findAll(): Promise<Tag[]> {
    return await this.db.query.tags.findMany();
  }

  // 根据账户ID过滤标签
  async findByAccountId(accountId?: string): Promise<Tag[]> {
    if (!accountId) {
      // 如果未提供accountId，返回所有标签
      return await this.findAll();
    }
    console.log(`根据账户ID22 ${accountId} 过滤标签`);
  const accountIdsNoSpace = sql<string>`replace(coalesce(${tags.accountIds}, ''), ' ', '')`;

    // 使用SQLite的JSON函数来检查accountIds数组中是否包含指定的accountId
    // 或者accountIds为空数组
    return await this.db.query.tags.findMany({
      where: or(
        or(isNull(tags.accountIds), eq(tags.accountIds, "")),
        like(accountIdsNoSpace, `${accountId},%`),
        like(accountIdsNoSpace, `${accountId}%`), 
          like(accountIdsNoSpace, `%,${accountId},%`),
          like(accountIdsNoSpace, `%,${accountId}`)
      ), 
    }); 
  } 

  // 批量创建标签
  async createMany(data: Omit<NewTag, "id" | "createdAt">[]): Promise<Tag[]> {
    const tagsWithId = data.map((item) => ({
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
    }));
    return await this.db.insert(tags).values(tagsWithId).returning();
  }
}
