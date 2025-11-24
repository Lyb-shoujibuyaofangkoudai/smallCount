import { defaultStorageManager } from '@/utils/storage';
import { AccountRepository } from '../repositories/AccountRepository';
import { NewTag, TagRepository } from '../repositories/TagRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AccountService } from './AccountService';

const DEFAULT_USERNAME = 'default_user';
const DEFAULT_EMAIL = 'default@local';
const DEFAULT_ACCOUNT_NAME = 'default';
const DEFAULT_TAGS: {
  expenses: Omit<NewTag, 'id' | 'createdAt'>[];
  incomes: Omit<NewTag, 'id' | 'createdAt'>[];
} = {
  // ===========================
  // 支出分类 (Expenses)
  // ===========================
  expenses: [
    {
      name: '餐饮美食',
      icon: 'fast-food', 
      color: '#ff7675', // 柔红
      type: 'expense',
    },
    {
      name: '交通出行',
      icon: 'bus',
      color: '#74b9ff', // 天蓝
      type: 'expense',
    },
    {
      name: '居家物业',
      icon: 'home',
      color: '#fdcb6e', // 暖黄
      type: 'expense',
    },
    {
      name: '日常购物',
      icon: 'cart',
      color: '#e17055', // 橘红
      type: 'expense',
    },
    {
      name: '服饰美容',
      icon: 'shirt',
      color: '#fd79a8', // 粉色
      type: 'expense',
    },
    {
      name: '娱乐消遣',
      icon: 'game-controller',
      color: '#a29bfe', // 淡紫
      type: 'expense',  
    },
    {
      name: '医疗健康',
      icon: 'medkit',
      color: '#00b894', // 绿色
      type: 'expense',  
    },
    {
      name: '教育学习',
      icon: 'school',
      color: '#55efc4', // 青绿
      type: 'expense',  
    },
    {
      name: '人情社交',
      icon: 'gift',
      color: '#d63031', // 深红
      type: 'expense',  
    },
    {
      name: '数码科技',
      icon: 'phone-portrait',
      color: '#636e72', // 灰色
      type: 'expense',  
    },
    {
      name: '孩子宝贝',
      icon: 'balloon', // Ionicons没有婴儿图标，用气球代表孩子/玩乐
      color: '#fab1a0', // 浅橘
      type: 'expense',  
    },
    {
      name: '宠物喵汪',
      icon: 'paw',
      color: '#e67e22', // 棕橘
      type: 'expense',  
    },
    {
      name: '旅行出游',
      icon: 'airplane',
      color: '#0984e3', // 深蓝
      type: 'expense',  
    },
    {
      name: '维修服务',
      icon: 'construct',
      color: '#2d3436', // 深灰
      type: 'expense',  
    },
    {
      name: '其他支出',
      icon: 'apps',
      color: '#b2bec3', // 浅灰
      type: 'expense',  
    }
  ],

  // ===========================
  // 收入分类 (Income)
  // ===========================
  incomes: [
    {
      name: '工资薪水',
      icon: 'wallet',
      color: '#F7B731', // 金黄
      type: 'income',  
    },
    {
      name: '奖金补贴',
      icon: 'trophy',
      color: '#FA8231', // 橙色
      type: 'income',  
    },
    {
      name: '理财投资',
      icon: 'trending-up',
      color: '#20BF6B', // 鲜绿
      type: 'income',  
    },
    {
      name: '兼职外快',
      icon: 'briefcase',
      color: '#45AAF2', // 亮蓝
      type: 'income',  
    },
    {
      name: '人情红包',
      icon: 'mail-open', // 类似拆开的信封/红包
      color: '#EB3B5A', // 红色
      type: 'income',  
    },
    {
      name: '退款入账',
      icon: 'arrow-undo',
      color: '#A55EEA', // 紫色
      type: 'income',   
    },
    {
      name: '二手交易',
      icon: 'repeat',
      color: '#778ca3', // 蓝灰
      type: 'income',   
    },
    {
      name: '借入款项',
      icon: 'cash',
      color: '#4b6584', // 深蓝灰
      type: 'income',   
    },
    {
      name: '意外所得',
      icon: 'sparkles', // 星星/闪光，代表好运
      color: '#f1c40f', // 亮黄
      type: 'income',   
    },
    {
      name: '其他收入',
      icon: 'grid',
      color: '#95afc0', // 银色
      type: 'income',   
    }
  ]
};

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
        paymentMethodId: '1',
        tagId: '1',
      });
      await tradeRepo.createTransactionWithBalanceUpdate({
        accountId: account.defaultAccountId,
        type: 'income',
        amount: 5000,
        description: '测试 收入',
        transactionDate: new Date(),
        paymentMethodId: '1',
        tagId: '1',
      });
    }
};

const addDefaultTagsDataToDb = async () => {
     // 创建一些标签数据 - 如果没有标签数据 模拟用户进行几笔标签
    const tagRepo = new TagRepository();
    const existingTags = await tagRepo.findAll();
    console.log(`标签初始化完成: ${existingTags.length} 个标签`);
    if (existingTags.length === 0) {
      const expenseTags = await tagRepo.createMany(DEFAULT_TAGS.expenses);
      const incomeTags = await tagRepo.createMany(DEFAULT_TAGS.incomes);
      console.log(`标签初始化完成: ${expenseTags.length + incomeTags.length} 个标签`);
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

    // 3. 初始化交易数据 - 如果没有交易数据 模拟用户进行几笔交易
    // await mockTransactionsDataToDb(account);

    // 4. 初始化标签数据 - 如果没有标签数据 则添加默认标签
    await addDefaultTagsDataToDb();
   
   
    // 返回初始化结果
    return {
      userId: user.id,
      accountCount: account.count,
      defaultAccountId: account.defaultAccountId
    };
  },
};