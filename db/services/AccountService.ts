// sql/services/AccountService.ts
import { AccountRepository } from '../repositories/AccountRepository';

const accountRepo = new AccountRepository();

export const AccountService = {
    // 添加新账户
    async createNewAccount(userId: string, name: string, type: any, balance: number, notes?: string) {
        // 业务规则校验：例如名字不能太长
        if (name.length > 50) throw new Error("账户名称过长");
        
        return await accountRepo.create({
            userId,
            name,
            type,
            balance,
            currency: 'CNY',
            // 其他字段给默认值或 undefined
            isDefault: false,
            notes,
        });
    },

    // 获取用户资产概览
    async getUserAssets(userId: string) {
        const myAccounts = await accountRepo.findByUser(userId);
        const totalBalance = myAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        return {
            accounts: myAccounts,
            totalBalance
        };
    },
    
    // 设为默认
    async setAsDefault(userId: string, accountId: string) {
        return await accountRepo.setAsDefault(userId, accountId);
    },

};