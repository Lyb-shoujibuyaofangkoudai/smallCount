// storage/store/types.ts

// 导入数据库实体类型
import type { Account } from "@/db/repositories/AccountRepository";
import type { PaymentMethod } from "@/db/repositories/PaymentMethodRepository";
import type { Tag } from "@/db/repositories/TagRepository";
import type { Transaction } from "@/db/repositories/TransactionRepository";
import type { User } from "@/db/repositories/UserRepository";

// 数据存储状态接口
export interface DataState {
  // 用户相关
  currentUser: User | null;

  // 账户相关
  accounts: Account[];
  accountsLoading: boolean;
  accountsError: string | null;
  activeAccountId: string | null;
  activeAccount: Account | null;

  // 交易相关
  transactions: Transaction[];
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
}

// 数据操作接口
export interface DataActions {
  // 初始化数据
  initializeData: () => Promise<void>;

  // 账户操作
  loadAccounts: () => Promise<void>;
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
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // 标签操作
  loadTags: () => Promise<void>;
  addTag: (tag: Omit<Tag, "id" | "createdAt">) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // 支付方式操作
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (
    paymentMethod: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePaymentMethod: (
    id: string,
    paymentMethod: Partial<PaymentMethod>
  ) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;

  // 用户操作
  loadCurrentUser: () => Promise<void>;

  // 全局操作
  refreshAllData: () => Promise<void>;
  clearError: () => void;
  clearAllData: () => void;
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
