// db/services/PaymentMethodService.ts
import { NewPaymentMethod, PaymentMethodRepository } from '../repositories/PaymentMethodRepository';

const paymentMethodRepo = new PaymentMethodRepository();

export const PaymentMethodService = {
    // 创建新的支付方式
    async createPaymentMethod(accountIds: string, name: string, icon?: string, isDefault?: boolean) {
        // 业务规则校验
        if (!name || name.trim().length === 0) {
            throw new Error("支付方式名称不能为空");
        }
        
        if (name.length > 50) {
            throw new Error("支付方式名称过长");
        }

        // 检查是否已存在同名支付方式
        const existing = await paymentMethodRepo.findByName(name.trim());
        if (existing) {
            throw new Error(`支付方式 "${name}" 已存在`);
        }

        // 如果设置为默认支付方式，需要处理默认逻辑
        if (isDefault) {
            await paymentMethodRepo.setAsDefault(''); // 先清空默认状态
        }

        return await paymentMethodRepo.create({
            accountIds,
            name: name.trim(),
            icon: icon || '💳',
            isDefault: isDefault || false,
        });
    },

    // 获取所有支付方式
    async getAllPaymentMethods() {
        return await paymentMethodRepo.findAll();
    },

    // 根据ID获取支付方式
    async getPaymentMethodById(id: string) {
        if (!id) {
            throw new Error("支付方式ID不能为空");
        }
        
        const paymentMethod = await paymentMethodRepo.findById(id);
        if (!paymentMethod) {
            throw new Error(`支付方式不存在: ${id}`);
        }
        
        return paymentMethod;
    },

    // 更新支付方式
    async updatePaymentMethod(id: string, updates: { name?: string; icon?: string; isDefault?: boolean }) {
        if (!id) {
            throw new Error("支付方式ID不能为空");
        }

        // 检查支付方式是否存在
        const existing = await paymentMethodRepo.findById(id);
        if (!existing) {
            throw new Error(`支付方式不存在: ${id}`);
        }

        // 校验名称
        if (updates.name) {
            if (updates.name.trim().length === 0) {
                throw new Error("支付方式名称不能为空");
            }
            if (updates.name.length > 50) {
                throw new Error("支付方式名称过长");
            }

            // 检查是否与其他支付方式重名（排除自身）
            const sameName = await paymentMethodRepo.findByName(updates.name.trim());
            if (sameName && sameName.id !== id) {
                throw new Error(`支付方式 "${updates.name}" 已存在`);
            }
        }

        // 处理默认支付方式逻辑
        if (updates.isDefault === true) {
            await paymentMethodRepo.setAsDefault(id);
            // 设置默认后，更新数据中不需要再包含 isDefault 字段
            const { isDefault, ...updateData } = updates;
            return await paymentMethodRepo.update(id, {
                ...updateData,
                name: updateData.name?.trim(),
            });
        }

        return await paymentMethodRepo.update(id, {
            ...updates,
            name: updates.name?.trim(),
        });
    },

    // 删除支付方式
    async deletePaymentMethod(id: string) {
        if (!id) {
            throw new Error("支付方式ID不能为空");
        }

        // 检查支付方式是否存在
        const existing = await paymentMethodRepo.findById(id);
        if (!existing) {
            throw new Error(`支付方式不存在: ${id}`);
        }

        // 检查支付方式是否在使用中
        const inUse = await paymentMethodRepo.isInUse(id);
        if (inUse) {
            throw new Error("该支付方式正在使用中，无法删除");
        }

        // 如果是默认支付方式，需要重新设置默认
        if (existing.isDefault) {
            // 获取其他支付方式
            const allMethods = await paymentMethodRepo.findAll();
            const otherMethods = allMethods.filter(method => method.id !== id);
            
            if (otherMethods.length > 0) {
                // 设置第一个非默认支付方式为新的默认
                await paymentMethodRepo.setAsDefault(otherMethods[0].id);
            }
        }

        await paymentMethodRepo.delete(id);
    },

    // 设置默认支付方式
    async setDefaultPaymentMethod(id: string) {
        if (!id) {
            throw new Error("支付方式ID不能为空");
        }

        // 检查支付方式是否存在
        const existing = await paymentMethodRepo.findById(id);
        if (!existing) {
            throw new Error(`支付方式不存在: ${id}`);
        }

        await paymentMethodRepo.setAsDefault(id);
        return await paymentMethodRepo.findById(id);
    },

    // 获取默认支付方式
    async getDefaultPaymentMethod() {
        return await paymentMethodRepo.getDefault();
    },


    // 搜索支付方式
    async searchPaymentMethods(keyword: string) {
        if (!keyword || keyword.trim().length === 0) {
            return await this.getAllPaymentMethods();
        }

        const allMethods = await paymentMethodRepo.findAll();
        const searchTerm = keyword.toLowerCase().trim();
        
        return allMethods.filter(method => 
            method.name.toLowerCase().includes(searchTerm) ||
            (method.icon && method.icon.includes(searchTerm))
        );
    },

    // 批量创建支付方式
    async createPaymentMethodsBatch(paymentMethodsData: Omit<NewPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>[]) {
        // 批量校验
        if (!paymentMethodsData || paymentMethodsData.length === 0) {
            throw new Error("支付方式数据不能为空");
        }

        if (paymentMethodsData.length > 100) {
            throw new Error("批量创建支付方式数量不能超过100个");
        }

        // 校验每个支付方式数据
        for (const [index, data] of paymentMethodsData.entries()) {
            if (!data.name || data.name.trim().length === 0) {
                throw new Error(`第${index + 1}个支付方式名称不能为空`);
            }
            
            if (data.name.length > 50) {
                throw new Error(`第${index + 1}个支付方式名称过长`);
            }
        }

        // 检查是否已存在同名支付方式
        const existingMethods = await paymentMethodRepo.findAll();
        const existingNames = new Set(existingMethods.map(method => method.name.toLowerCase()));
        
        const duplicateNames: string[] = [];
        const newNames = new Set<string>();
        
        for (const data of paymentMethodsData) {
            const normalizedName = data.name.trim().toLowerCase();
            
            if (existingNames.has(normalizedName) || newNames.has(normalizedName)) {
                duplicateNames.push(data.name);
            } else {
                newNames.add(normalizedName);
            }
        }

        if (duplicateNames.length > 0) {
            throw new Error(`以下支付方式名称已存在或重复: ${duplicateNames.join(', ')}`);
        }

        // 处理默认支付方式逻辑
        const hasDefault = paymentMethodsData.some(data => data.isDefault);
        if (hasDefault) {
            // 如果批量数据中有默认支付方式，先清空现有的默认状态
            await paymentMethodRepo.setAsDefault('');
        }

        // 准备批量创建数据
        const createData = paymentMethodsData.map(data => ({
            ...data,
            name: data.name.trim(),
            icon: data.icon || '💳',
            isDefault: data.isDefault || false,
        }));

        return await paymentMethodRepo.createMany(createData);
    },

    // 批量更新支付方式
    async updatePaymentMethodsBatch(updates: { id: string; name?: string; icon?: string; isDefault?: boolean }[]) {
        if (!updates || updates.length === 0) {
            throw new Error("更新数据不能为空");
        }

        if (updates.length > 50) {
            throw new Error("批量更新支付方式数量不能超过50个");
        }

        // 校验每个更新数据
        for (const [index, update] of updates.entries()) {
            if (!update.id) {
                throw new Error(`第${index + 1}个更新数据缺少支付方式ID`);
            }

            if (update.name) {
                if (update.name.trim().length === 0) {
                    throw new Error(`第${index + 1}个支付方式名称不能为空`);
                }
                if (update.name.length > 50) {
                    throw new Error(`第${index + 1}个支付方式名称过长`);
                }
            }
        }

        // 检查支付方式是否存在
        const existingMethods = await paymentMethodRepo.findAll();
        const existingMethodMap = new Map(existingMethods.map(method => [method.id, method]));
        
        for (const update of updates) {
            if (!existingMethodMap.has(update.id)) {
                throw new Error(`支付方式不存在: ${update.id}`);
            }
        }

        // 检查名称重复
        const existingNames = new Set(existingMethods.map(method => method.name.toLowerCase()));
        const updatedNames = new Map<string, string>(); // id -> name
        
        for (const update of updates) {
            if (update.name) {
                const normalizedName = update.name.trim().toLowerCase();
                const existingMethod = existingMethodMap.get(update.id)!;
                
                // 如果名称有变化，检查是否与其他支付方式重名
                if (normalizedName !== existingMethod.name.toLowerCase()) {
                    if (existingNames.has(normalizedName) && 
                        !existingMethods.some(method => 
                            method.name.toLowerCase() === normalizedName && 
                            method.id === update.id
                        )) {
                        throw new Error(`支付方式名称 "${update.name}" 已存在`);
                    }
                }
                updatedNames.set(update.id, normalizedName);
            }
        }

        // 处理默认支付方式逻辑
        const defaultUpdates = updates.filter(update => update.isDefault === true);
        if (defaultUpdates.length > 0) {
            if (defaultUpdates.length > 1) {
                throw new Error("批量更新中只能设置一个默认支付方式");
            }
            await paymentMethodRepo.setAsDefault(defaultUpdates[0].id);
        }

        // 逐个更新支付方式
        const results = [];
        for (const update of updates) {
            // 如果已经处理了默认逻辑，从更新数据中移除 isDefault 字段
            const updateData = { ...update };
            if (defaultUpdates.some(du => du.id === update.id)) {
                delete updateData.isDefault;
            }
            
            const result = await this.updatePaymentMethod(update.id, updateData);
            results.push(result);
        }

        return results;
    }
};