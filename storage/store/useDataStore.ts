// storage/store/useDataStore.ts

import { Transaction } from "@/db/repositories/TransactionRepository";
import { AccountService } from "@/db/services/AccountService";
import { PaymentMethodService } from "@/db/services/PaymentMethodService";
import { TagService } from "@/db/services/TagService";
import { TransactionService } from "@/db/services/TransactionService";
import { UserService } from "@/db/services/UserService";
import { generateRandomColor } from "@/theme/colors";
import { defaultStorageManager } from "@/utils/storage";
import Big from "big.js";
import { createAppStore } from "../index";
import type { DataState, DataStore } from "./types";

// 初始状态
const initialState: DataState = {
  // 用户相关
  currentUser: null,

  // 账户相关
  accounts: [],
  accountsLoading: false,
  accountsError: null,
  activeAccountId: null,
  activeAccount: null,

  // 交易相关
  transactions: [],
  transactionsForDate: [],
  transactionsDataForCalendar: {},
  monthlyStats: {
    balance: 0,
    income: 0,
    expense: 0,
  },
  transactionsLoading: false,
  transactionsError: null,

  // 标签相关
  tags: [],
  tagsLoading: false,
  tagsError: null,

  // 支付方式相关
  paymentMethods: [],
  paymentMethodsLoading: false,
  paymentMethodsError: null,

  // 全局状态
  isInitialized: false,
  lastSyncTime: null,
  isLoading: false,
  error: null,
};

// 创建数据存储
const useDataStore = createAppStore<DataStore>((set, get) => ({
  ...initialState,

  // 初始化数据
  initializeData: async () => {
    try {
      set({ isLoading: true, error: null });

      // 加载当前用户
      await get().loadCurrentUser();
      await get().loadAccounts();
      const defaultAccount = get().accounts.find((a) => a.isDefault);
      set({ activeAccount: defaultAccount || null });
      set({ activeAccountId: defaultAccount!.id });
      // 并行加载基础数据
      await Promise.all([
        get().loadTags(),
        get().loadPaymentMethods(),
        get().loadTransactions(defaultAccount!.id),
      ]);

      set({
        isInitialized: true,
        lastSyncTime: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "初始化数据失败",
        isLoading: false,
      });
    }
  },

  // 账户操作
  loadAccounts: async () => {
    try {
      set({ accountsLoading: true, accountsError: null });
      const currentUser = get().currentUser;
      if (!currentUser) {
        throw new Error("用户未登录");
      }
      const accounts = await AccountService.getUserAssets(currentUser.id);
      console.log("accounts", accounts.accounts.length);
      set({ accounts: accounts.accounts, accountsLoading: false });
    } catch (error) {
      set({ 
        accountsError: error instanceof Error ? error.message : "加载账户失败",
        accountsLoading: false,
      });
    }
  },

  addAccount: async (accountData) => {
    try {
      // 确保传递完整的参数给createNewAccount函数
      await AccountService.createNewAccount(
        accountData.userId,
        accountData.name,
        accountData.type,
        accountData.balance || 0,
        accountData.notes || "",
        accountData.icon || '💰',
        accountData.color || generateRandomColor(),
        accountData.isDefault || false,
        accountData.currency || 'CNY'
      );
      // 重新加载账户列表，确保数据最新
      await get().loadAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加账户失败",
      });
      throw error;
    }
  },

  updateAccount: async (id, accountData) => {
    try {
      const updatedAccount = await AccountService.updateAccount(
        id,
        accountData
      );
      if (!updatedAccount) {
        throw new Error("更新账户失败");
      }
      const { accounts } = get();
      set({
        accounts: accounts.map((acc) => (acc.id === id ? updatedAccount : acc)),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "更新账户失败",
      });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    try {
      await AccountService.deleteAccount(id);
      const { accounts } = get();
      set({ accounts: accounts.filter((acc) => acc.id !== id) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "删除账户失败",
      });
      throw error;
    }
  },

  // 交易操作
  loadTransactions: async (
    accountId: string,
    year: number = new Date().getFullYear(),
    month: number = new Date().getMonth() + 1
  ) => {
    try {
      set({ transactionsLoading: true, transactionsError: null });

      let transactions;

      if (accountId && year && month) {
        // 加载特定月份的交易
        const result = await TransactionService.getTransactionsByMonth(
          accountId,
          year,
          month
        );
        transactions = result.items || [];
      }

      set({ transactions, transactionsLoading: false });
      // 转换交易数据为日期格式
      await get().convertTransactionsForCalendar(get().transactions);
      // 分组交易数据
      await get().groupTransactionsByDate(get().transactions);
    } catch (error) {
      set({
        transactionsError:
          error instanceof Error ? error.message : "加载交易失败",
        transactionsLoading: false,
      });
    }
  },

  convertTransactionsForCalendar: async (transactions: Transaction[]) => {
    if (transactions.length) {
      // 计算月度统计数据 (使用 big.js 避免浮点数精度问题)
      let totalIncome = new Big(0);
      let totalExpense = new Big(0);

      transactions.forEach((transaction: any) => {
        if (transaction.type === "expense") {
          totalExpense = totalExpense.plus(new Big(transaction.amount));
        } else if (transaction.type === "income") {
          totalIncome = totalIncome.plus(new Big(transaction.amount));
        }
      });

      const balance = totalIncome.minus(totalExpense);
      set({
        monthlyStats: {
          balance: balance.toNumber(),
          income: totalIncome.toNumber(),
          expense: totalExpense.toNumber(),
        },
      });

      // 处理数据用于日历组件
      const calendarData: Record<string, { expense: number; income: number }> =
        {};

      transactions.forEach((transaction: any) => {
        const dateStr = new Date(transaction.transactionDate)
          .toISOString()
          .split("T")[0];

        if (!calendarData[dateStr]) {
          calendarData[dateStr] = { expense: 0, income: 0 };
        }

        if (transaction.type === "expense") {
          const currentExpense = new Big(calendarData[dateStr].expense);
          calendarData[dateStr].expense = currentExpense
            .plus(new Big(transaction.amount))
            .toNumber();
        } else if (transaction.type === "income") {
          const currentIncome = new Big(calendarData[dateStr].income);
          calendarData[dateStr].income = currentIncome
            .plus(new Big(transaction.amount))
            .toNumber();
        }
      });
      set({ transactionsDataForCalendar: calendarData });
    }
  },

  groupTransactionsByDate: async (transactions: Transaction[]) => {
    const grouped: Record<string, any[]> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-dd 格式

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push({
        ...transaction,
        date: date.toISOString().split("T")[0],
        icon: transaction.type === "income" ? "💰" : "💳",
        color: transaction.type === "income" ? "#34C759" : "#FF3B30",
      });
    });
    // 转换为SectionList需要的格式 (使用 big.js 避免浮点数精度问题)
    const r = Object.entries(grouped).map(([title, data]) => {
      const expenseTotal = data
        .filter((t: any) => t.type === "expense")
        .reduce((sum: Big, t: any) => sum.plus(new Big(t.amount)), new Big(0));

      const incomeTotal = data
        .filter((t: any) => t.type === "income")
        .reduce((sum: Big, t: any) => sum.plus(new Big(t.amount)), new Big(0));

      const total = {
        expense: expenseTotal.toNumber(),
        income: incomeTotal.toNumber(),
      };
      return {
        title,
        total,
        data,
      };
    });

    set({ transactionsForDate: r });
  },

  addTransaction: async (transaction) => {
    try {
      const newTransaction =
      await TransactionService.createTransaction(transaction);
      const { transactions } = get();
      set({ transactions: [...transactions, newTransaction] });

      await get().loadTransactions(
        get().activeAccountId!,
        transaction.transactionDate.getFullYear(),
        transaction.transactionDate.getMonth() + 1
      );
      // 转换交易数据为日期格式
      await get().convertTransactionsForCalendar(get().transactions);
      // 分组交易数据
      await get().groupTransactionsByDate(get().transactions);
      // 更新相关账户的余额
      await get().loadAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加交易失败",
      });
      throw error;
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const updatedTransaction = await TransactionService.updateTransaction(
        id,
        transactionData
      );
      await get().loadTransactions(
        get().activeAccountId!,
        updatedTransaction.transactionDate.getFullYear(),
        updatedTransaction.transactionDate.getMonth() + 1
      );
      await get().convertTransactionsForCalendar(get().transactions);
      await get().groupTransactionsByDate(get().transactions);
      // 更新相关账户的余额
      await get().loadAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "更新交易失败",
      });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await TransactionService.deleteTransaction(id);
      const { transactions } = get();
      set({ transactions: transactions.filter((tx) => tx.id !== id) });
      await get().convertTransactionsForCalendar(get().transactions);
      await get().groupTransactionsByDate(get().transactions);
      // 更新相关账户的余额
      await get().loadAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "删除交易失败",
      });
      throw error;
    }
  },

  // 标签操作
  loadTags: async () => {
    try {
      set({ tagsLoading: true, tagsError: null });

      const tags = await TagService.getAllTags();
      set({ tags, tagsLoading: false });
    } catch (error) {
      set({
        tagsError: error instanceof Error ? error.message : "加载标签失败",
        tagsLoading: false,
      });
    }
  },

  addTag: async (tagData) => {
    try {
      const newTag = await TagService.createTag(tagData);
      const { tags } = get();
      set({ tags: [...tags, newTag] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加标签失败",
      });
      throw error;
    }
  },

  updateTag: async (id, tagData) => {
    try {
      const updatedTag = await TagService.updateTag(id, tagData);
      if (!updatedTag) {
        throw new Error("更新标签失败");
      }
      const { tags } = get();
      set({
        tags: tags.map((tag) => (tag.id === id ? updatedTag : tag)),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "更新标签失败",
      });
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      await TagService.deleteTag(id);
      const { tags } = get();
      set({ tags: tags.filter((tag) => tag.id !== id) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "删除标签失败",
      });
      throw error;
    }
  },

  // 支付方式操作
  loadPaymentMethods: async () => {
    try {
      set({ paymentMethodsLoading: true, paymentMethodsError: null });

      const paymentMethods = await PaymentMethodService.getAllPaymentMethods();
      set({ paymentMethods, paymentMethodsLoading: false });
    } catch (error) {
      set({
        paymentMethodsError:
          error instanceof Error ? error.message : "加载支付方式失败",
        paymentMethodsLoading: false,
      });
    }
  },

  addPaymentMethod: async (paymentMethodData) => {
    try {
      const newPaymentMethod = await PaymentMethodService.createPaymentMethod(
        paymentMethodData.name,
        paymentMethodData.icon || "",
        paymentMethodData.isDefault || false
      );
      const { paymentMethods } = get();
      set({ paymentMethods: [...paymentMethods, newPaymentMethod] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加支付方式失败",
      });
      throw error;
    }
  },

  updatePaymentMethod: async (id, paymentMethodData) => {
    try {
      const updatedPaymentMethod =
        await PaymentMethodService.updatePaymentMethod(id, {
          name: paymentMethodData.name || "",
          icon: paymentMethodData.icon || "",
          isDefault: paymentMethodData.isDefault || false,
        });
      if (!updatedPaymentMethod) {
        throw new Error("更新支付方式失败");
      }
      const { paymentMethods } = get();
      set({
        paymentMethods: paymentMethods.map((pm) =>
          pm.id === id ? updatedPaymentMethod : pm
        ),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "更新支付方式失败",
      });
      throw error;
    }
  },

  deletePaymentMethod: async (id) => {
    try {
      await PaymentMethodService.deletePaymentMethod(id);
      const { paymentMethods } = get();
      set({ paymentMethods: paymentMethods.filter((pm) => pm.id !== id) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "删除支付方式失败",
      });
      throw error;
    }
  },

  // 获取默认用户操作
  loadCurrentUser: async () => {
    try {
      // 从本地存储获取当前用户ID
      const userID = (await defaultStorageManager.get("userID")) as string;
      if (userID) {
        const user = await UserService.getUserById(userID);
        set({ currentUser: user || null });
      }
    } catch (error) {
      console.error("加载当前用户失败:", error);
    }
  },

  // 全局操作
  refreshAllData: async () => {
    try {
      set({ isLoading: true, error: null });

      await Promise.all([
        get().loadAccounts(),
        get().loadTags(),
        get().loadPaymentMethods(),
      ]);

      set({
        lastSyncTime: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "刷新数据失败",
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({
      error: null,
      accountsError: null,
      transactionsError: null,
      tagsError: null,
      paymentMethodsError: null,
    });
  },

  clearAllData: () => {
    set(initialState);
  },
}));

export default useDataStore;
