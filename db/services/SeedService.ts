import { CURRENCIES, DEFAULT_ACCOUNT_NAME, DEFAULT_EMAIL, DEFAULT_TAGS, DEFAULT_USERNAME, PAYMENT_METHODS } from '@/constants/data';
import { defaultStorageManager } from '@/utils/storage';
import { AccountRepository } from '../repositories/AccountRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ACCOUNT_TYPES } from '../schema';
import { AccountService } from './AccountService';
import { PaymentMethodService } from './PaymentMethodService';
import { TagService } from './TagService';


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
    const acc = await AccountService.createNewAccount({
      userId,
      name: DEFAULT_ACCOUNT_NAME,
      type: ACCOUNT_TYPES.CASH,
      currency:  CURRENCIES.CNY.value,
      isDefault: true,
      isActive: true,
      notes: '这是默认账户',
    });
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

const addDefaultTagsDataToDb = async (accountId: string) => {
     // 创建一些标签数据 - 如果没有标签数据 模拟用户进行几笔标签
    try {
      const existingTags = await TagService.getAllTags();
    const existingTagTypeLenMap = existingTags.reduce((acc, tag) => {
      acc[tag.type] = (acc[tag.type] || 0) + 1;
      return acc;
    }, {} as Record<'expense' | 'income' | 'transfer', number>);
    console.log('已存在标签:', existingTagTypeLenMap['expense'], existingTagTypeLenMap['income'], existingTagTypeLenMap['transfer']);

    if(!existingTagTypeLenMap['expense']) {
      await TagService.createTagsBatch(DEFAULT_TAGS.expenses);
    }
    
    if(!existingTagTypeLenMap['income']) {
      await TagService.createTagsBatch(DEFAULT_TAGS.incomes);
    }
    
    if(!existingTagTypeLenMap['transfer']) {
      await TagService.createTagsBatch(DEFAULT_TAGS.transfers);
    }
    } catch (error) {
      console.error('获取标签失败:', error);
      throw error;
    }
};

const addDefaultPaymentMethodsDataToDb = async (accountId: string) => {
     // 创建一些支付方式数据 - 如果没有支付方式数据 模拟用户进行几笔支付方式
    const existingPaymentMethods = await PaymentMethodService.getAllPaymentMethods();
    if (existingPaymentMethods.length === 0) {
      try {
        // 使用PaymentMethodService的批量创建方法，这样可以复用业务逻辑校验
        const paymentMethods = await PaymentMethodService.createPaymentMethodsBatch(PAYMENT_METHODS);
        console.log(`支付方式初始化完成: ${paymentMethods.length} 个支付方式`);
      } catch (error) {
        console.error('支付方式初始化失败:', error);
        throw error;
      }
    } else {
      console.log(`支付方式已存在: ${existingPaymentMethods.length} 个支付方式`);
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
    console.log(`用户初始化完成: ${JSON.stringify(user)} (ID: ${user.id})`);
    defaultStorageManager.set('user', user);
    defaultStorageManager.set('userID', user.id);
    
    // 2. 确保默认账户存在 - 检查该用户是否已有账本，如无则创建默认账本
    const account = await ensureDefaultAccount(user.id);
    console.log(`账户初始化完成: ${account.count} 个账户，默认账户ID: ${account.defaultAccountId}`);
    defaultStorageManager.set('defaultAccountId', account.defaultAccountId);
    defaultStorageManager.set('defaultAccountInfo', account.accountInfo);

    // 3. 初始化交易数据 - 如果没有交易数据 模拟用户进行几笔交易
    // await mockTransactionsDataToDb(account);

    // 4. 初始化标签数据 - 如果没有标签数据 则添加默认标签
    await addDefaultTagsDataToDb(account.defaultAccountId);

    // 5. 初始化支付方式数据 - 如果没有支付方式数据 则添加默认支付方式
    await addDefaultPaymentMethodsDataToDb(account.defaultAccountId);
   
   
    // 返回初始化结果
    return {
      userId: user.id,
      accountCount: account.count,
      defaultAccountId: account.defaultAccountId
    };
  },
};