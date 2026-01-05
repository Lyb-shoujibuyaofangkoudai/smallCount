// storage/store/types.ts

// 导入数据库实体类型
import type { Account, NewAccount } from "@/db/repositories/AccountRepository";
import { NewAttachment } from "@/db/repositories/AttachmentRepository";
import type { PaymentMethod } from "@/db/repositories/PaymentMethodRepository";
import type { Tag } from "@/db/repositories/TagRepository";
import type { Transaction } from "@/db/repositories/TransactionRepository";
import type { User } from "@/db/repositories/UserRepository";
import { TransactionWithDetailInfo } from "@/db/services/TransactionService";

// 数据存储状态接口
export interface DataState {
  // 用户相关
  currentUser: User | null;

  // 账户相关
  accounts: Account[];
  accountsLoading: boolean;
  accountsError: string;
  activeAccountId: string;
  activeAccount: Account;

  // 交易相关
  transactions: TransactionWithDetailInfo[];
  transactionsForDate: {
    title: string;
    total: {
      expense: any;
      income: any;
    };
    data: any[];
  }[];
  transactionsDataForCalendar: Record<
    string,
    { expense: number; income: number }
  >;
  monthlyStats: {
    balance: number;
    income: number;
    expense: number;
  };
  transactionsLoading: boolean;
  transactionsError: string | null;

  // 标签相关
  tags: Tag[];
  tagsLoading: boolean;
  tagsError: string | null;

  // 支付方式相关
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;

  // 全局状态
  isInitialized: boolean;
  lastSyncTime: number | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
  
}

// 数据操作接口
export interface DataActions {
  // 初始化数据
  initializeData: () => Promise<void>;

  // 账户操作
  loadAccounts: () => Promise<void>;
  switchActiveAccount: (accountId: string) => void;
  addAccount: (
    account: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // 交易操作
  loadTransactions: (
    accountId: string,
    year?: number,
    month?: number
  ) => Promise<void>;
  convertTransactionsForCalendar: (transactions: Transaction[]) => Promise<void>;
  groupTransactionsByDate: (transactions: Transaction[]) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => Promise<Transaction>;
  addBatchTransactions: (
    transactions: Omit<Transaction, "id" | "createdAt" | "updatedAt">[]
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // 标签操作
  loadTags: () => Promise<void>;
  addTag: (tag: Omit<Tag, "id" | "accountIds" | "updatedAt" | "createdAt">) => Promise<Tag>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // 支付方式操作
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (
    paymentMethod: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">
  ) => Promise<PaymentMethod>;
  updatePaymentMethod: (
    id: string,
    paymentMethod: Partial<PaymentMethod>
  ) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;

  // 票据图片操作
  addTicketImagesToTransaction: (
    ticketImages: Omit<NewAttachment, "id" | "createdAt" | "updatedAt">[],
    transactionId: string,
  ) => Promise<Transaction | null>;
  // updateTicketImage: (
  //   id: string,
  //   ticketImage: Partial<TicketImage>
  // ) => Promise<void>;
  // deleteTicketImage: (id: string) => Promise<void>;

  // 用户操作
  loadCurrentUser: () => Promise<void>;

  // 全局操作
  refreshAllData: () => Promise<void>;
  clearError: () => void;
  clearAllData: () => void;

  setSelectedDate: (date: Date) => Promise<void>;
}

// 数据存储完整类型
export type DataStore = DataState & DataActions;

// 数据加载选项
export interface DataLoadOptions {
  forceRefresh?: boolean;
  silent?: boolean;
}

// 数据过滤选项
export interface TransactionFilterOptions {
  accountId?: string;
  year?: number;
  month?: number;
  type?: "expense" | "income" | "transfer";
  tagId?: string;
}

// 统计数据接口
export interface DataStats {
  totalAccounts: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  monthlyStats: {
    [yearMonth: string]: {
      income: number;
      expense: number;
      balance: number;
    };
  };
}

export type AccountDataType = Omit<NewAccount, 'id'  | 'createdAt' | 'updatedAt'>;


// 统计数据类型定义
export interface ChartDataItem {
  color: string;
  percentage: number;
  label: string;
}

export interface RankingItem {
  icon: string;
  name: string;
  percent: number;
  amount: string;
  color: string;
}

export interface CategoryData {
  total: string;
  color: string;
  linePath: string;
  areaPath: string;
  ranking: RankingItem[];
  donut: ChartDataItem[];
  data: {
    xAxis: string[];
    yAxis: number[];
  };
}

export interface StatsChartData {
  expense: CategoryData;
  income: CategoryData;
}

// 统计筛选条件
export interface StatsFilter {
  period: 'week' | 'month';
  type: 'expense' | 'income';
  year: number;
  month: number;
}

// 对比数据接口
export interface ComparisonData {
  currentAmount: number;
  compareAmount: number;
  percentageChange: number;
}

// 统计状态接口
export interface StatsState {
  filter: StatsFilter;
  chartData: StatsChartData;
  comparisonData: ComparisonData | null;
  isLoading: boolean;
  error: string | null;
}

// 统计操作接口
export interface StatsActions {
  setFilter: (filter: Partial<StatsFilter>) => void;
  loadStatsData: (accountId: string, filter: StatsFilter) => Promise<void>;
  loadStatsDataByWeek: (accountId: string, year: number, month: number) => Promise<void>;
  loadStatsDataByMonth: (accountId: string, year: number) => Promise<void>;
  loadStatsDataByYear: (accountId: string, year: number) => Promise<void>;
  loadComparisonData: (accountId: string, year: number, month?: number, type?: 'income' | 'expense') => Promise<void>;
  clearError: () => void;
}

export type StatsStore = StatsState & StatsActions;

// 设置状态接口
export interface SettingState {
  // AI配置相关
  apiUrl: string;
  apiKey: string;
  modelName: string;
  serviceProvider: string;
  
  // 状态相关
  isConfigured: boolean;
  isLoading: boolean;
  lastTestTime: number | null;
  testResult: {
    success: boolean;
    message: string;
    timestamp: number;
  } | null;
  
  // 其他设置
  autoSave: boolean;
  enableNotifications: boolean;
  theme: string;
}

// 设置操作接口
export interface SettingActions {
  // AI配置操作
  updateApiUrl: (url: string) => void;
  updateApiKey: (key: string) => void;
  updateModelName: (model: string) => void;
  updateServiceProvider: (provider: string) => void;
  
  // 初始化AI配置
  initializeConfig: () => Promise<void>;
  
  // 保存AI配置
  saveAiConfig: (config: {
    apiUrl: string;
    apiKey: string;
    modelName: string;
    serviceProvider?: string;
  }) => Promise<boolean>;
  
  // 测试AI连接
  testAiConnection: () => Promise<{
    success: boolean;
    message: string;
  }>;
  
  // 重置AI配置
  resetAiConfig: () => Promise<void>;
  
  // 其他设置操作
  updateAutoSave: (autoSave: boolean) => void;
  updateEnableNotifications: (enableNotifications: boolean) => void;
  updateTheme: (theme: string) => void;
  
  // 重置所有设置
  resetAllSettings: () => Promise<void>;
}

// 设置存储完整类型
export type SettingStore = SettingState & SettingActions;