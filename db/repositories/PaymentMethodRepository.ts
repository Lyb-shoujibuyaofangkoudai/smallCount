import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { paymentMethods } from '../schema';
import { BaseRepository } from './BaseRepository';

export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type NewPaymentMethod = InferInsertModel<typeof paymentMethods>;

export class PaymentMethodRepository extends BaseRepository<PaymentMethod> {
  constructor() {
    super(paymentMethods);
  }

  // 创建支付方式
  async create(data: Omit<NewPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    const id = this.generateId();
    const [newPaymentMethod] = await this.db.insert(paymentMethods).values({
      ...data,
      id,
      updatedAt: new Date(),
    }).returning();
    return newPaymentMethod;
  }

  // 批量创建支付方式
  async createMany(data: Omit<NewPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PaymentMethod[]> {
    if (data.length === 0) {
      return [];
    }

    const paymentMethodsWithIds = data.map(item => ({
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
    }));

    const result = await this.db.insert(paymentMethods).values(paymentMethodsWithIds).returning();
    return result;
  }

  // 获取所有支付方式
  async findAll(): Promise<PaymentMethod[]> {
    return await this.db.query.paymentMethods.findMany({
      orderBy: (paymentMethods, { desc }) => [desc(paymentMethods.createdAt)],
    });
  }

  // 根据ID获取支付方式
  async findById(id: string): Promise<PaymentMethod | undefined> {
    return await this.db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, id),
    });
  }

  // 根据名称获取支付方式
  async findByName(name: string): Promise<PaymentMethod | undefined> {
    return await this.db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.name, name),
    });
  }

  // 更新支付方式
  async update(id: string, data: Partial<Omit<NewPaymentMethod, 'id' | 'createdAt'>>): Promise<PaymentMethod | undefined> {
    const [updated] = await this.db.update(paymentMethods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated;
  }

  // 删除支付方式
  async delete(id: string): Promise<void> {
    await this.db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // 设置默认支付方式
  async setAsDefault(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // 1. 将所有支付方式设为非默认
      await tx.update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.isDefault, true));
      
      // 2. 将目标支付方式设为默认
      await tx.update(paymentMethods)
        .set({ isDefault: true })
        .where(eq(paymentMethods.id, id));
    });
  }

  // 获取默认支付方式
  async getDefault(): Promise<PaymentMethod | undefined> {
    return await this.db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.isDefault, true),
    });
  }

  // 检查支付方式是否在使用中（被交易引用）
  async isInUse(id: string): Promise<boolean> {
    // 这里需要检查 transactions 表是否有引用此支付方式的记录
    // 由于没有直接访问 transactions 表，暂时返回 false
    // 在实际应用中，需要实现这个检查逻辑
    return false;
  }
}