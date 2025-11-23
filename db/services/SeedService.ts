import { defaultStorageManager } from '@/utils/storage';
import { AccountRepository } from '../repositories/AccountRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AccountService } from './AccountService';

const DEFAULT_USERNAME = 'default_user';
const DEFAULT_EMAIL = 'default@local';
const DEFAULT_ACCOUNT_NAME = 'default';

async function ensureDefaultUser() {
  const userRepo = new UserRepository();
  const existing = await userRepo.findByUsername(DEFAULT_USERNAME);
  if (existing) return existing;
  return await userRepo.create({
    username: DEFAULT_USERNAME,
    email: DEFAULT_EMAIL,
    passwordHash: 'default',
    displayName: '默认用户',
    currency: 'CNY',
    isActive: true,
  });
}


async function ensureDefaultAccount(userId: string) {
  const accountRepo = new AccountRepository();
  const list = await accountRepo.findByUser(userId);
  if (list.length === 0) {
    const acc = await AccountService.createNewAccount(userId, DEFAULT_ACCOUNT_NAME, 'cash', 0);
    await AccountService.setAsDefault(userId, acc.id);
    return { count: 1, defaultAccountId: acc.id, accountInfo: acc };
  }
  
  const def = list.find((a) => a.isDefault === true);
  if (!def) {
    await AccountService.setAsDefault(userId, list[0].id);
    return { count: list.length, defaultAccountId: list[0].id, accountInfo: list[0] };
  }
  
  return { count: list.length, defaultAccountId: def.id, accountInfo: def };
}

const mockTransactionsDataToDb = async (account: {
    count: number;
    defaultAccountId: string;
}) => {
     // 创建一些交易数据 - 如果没有交易数据 模拟用户进行几笔交易
    const tradeRepo = new TransactionRepository();
    const existingTrades = await tradeRepo.findByMonth(account.defaultAccountId, new Date().getFullYear(),new Date().getMonth() + 1, {
      page: 1,
      pageSize: 10,
    });
    console.log(`交易初始化完成: ${existingTrades.items.length} 笔交易`);
    if (existingTrades.items.length === 0) {
      // 模拟用户进行几笔交易
      await tradeRepo.createTransactionWithBalanceUpdate({
        accountId: account.defaultAccountId,
        type: 'expense',
        amount: 1000,
        description: '测试 支出',
        transactionDate: new Date(),
        paymentMethod: 'cash',
        tagId: '1',
      });
      await tradeRepo.createTransactionWithBalanceUpdate({
        accountId: account.defaultAccountId,
        type: 'income',
        amount: 5000,
        description: '测试 收入',
        transactionDate: new Date(),
        paymentMethod: 'wechat_pay',
        tagId: '1',
      });
    }
};

export const SeedService = {
  /**
   * 初始化默认数据
   * 根据分层架构原则，服务层负责协调不同的仓库和服务
   * 1. 确保默认用户存在
   * 2. 确保默认账户存在
   * 
   * @returns 初始化结果，包含用户ID、账户数量和默认账户ID
   */
  async initDefaultData() {
    console.log('开始初始化默认数据...');
    
    // 1. 确保默认用户存在 - 检查数据库中是否已有用户，如无则创建
    const user = await ensureDefaultUser();
    console.log(`用户初始化完成: ${user.displayName} (ID: ${user.id})`);
    defaultStorageManager.set('user', user);
    
    // 2. 确保默认账户存在 - 检查该用户是否已有账本，如无则创建默认账本
    const account = await ensureDefaultAccount(user.id);
    console.log(`账户初始化完成: ${account.count} 个账户，默认账户ID: ${account.defaultAccountId}`);
    defaultStorageManager.set('defaultAccountId', account.defaultAccountId);
    defaultStorageManager.set('defaultAccountInfo', account.accountInfo);
   
   
    // 返回初始化结果
    return {
      userId: user.id,
      accountCount: account.count,
      defaultAccountId: account.defaultAccountId
    };
  },
};