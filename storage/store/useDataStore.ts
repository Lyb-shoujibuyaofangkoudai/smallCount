// storage/store/useDataStore.ts

import { NewTag } from "@/db/repositories/TagRepository";
import { Transaction } from "@/db/repositories/TransactionRepository";
import { AccountService } from "@/db/services/AccountService";
import { AttachmentService } from "@/db/services/AttachmentService";
import { PaymentMethodService } from "@/db/services/PaymentMethodService";
import { TagService } from "@/db/services/TagService";
import { TransactionService } from "@/db/services/TransactionService";
import { UserService } from "@/db/services/UserService";
import { defaultStorageManager } from "@/utils/storage";
import Big from "big.js";
import { createAppStore } from "../index";
import type { AccountDataType, DataState, DataStore } from "./types";

// 初始状态
const initialState: DataState = {
  // 用户相关
  currentUser: null,

  // 账户相关
  accounts: [],
  accountsLoading: false,
  accountsError: "",
  activeAccountId: "",
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
  selectedDate: new Date(),
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
      console.log("✅加载当前用户:", get().currentUser);
      await get().loadAccounts();
      console.log("✅加载账户:", JSON.stringify(get().accounts));
      const activeAccount = get().accounts.find((a) => a.isActive);
      if (!activeAccount) {
        console.log("⚠️未找到活跃账户，使用默认账户");
        const defaultAccount = get().accounts.find((a) => a.isDefault);
        console.log("✅默认账户:", defaultAccount);
        set({ activeAccount: defaultAccount || null });
        set({ activeAccountId: defaultAccount!.id });
      } else {
        set({ activeAccount: activeAccount || null });
        set({ activeAccountId: activeAccount!.id });
      }
      console.log("开始加载其他数据:标签、支付方式、交易");
      // 并行加载基础数据
      await Promise.all([
        get().loadTags(),
        get().loadPaymentMethods(),
        get().loadTransactions(activeAccount!.id),
      ])
      console.log("✅加载标签:", get().tags);
      console.log("✅加载支付方式:", get().paymentMethods);
      console.log("✅加载交易:", get().transactions);

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
      set({ accountsLoading: true, accountsError: "" });
      const currentUser = get().currentUser;
      if (!currentUser) {
        throw new Error("用户未登录");
      }
      const accounts = await AccountService.getUserAssets(currentUser.id);
      const activeAccount = accounts.accounts.find((a) => a.isActive);
      set({
        accounts: accounts.accounts,
        accountsLoading: false,
        activeAccount: activeAccount || null,
        activeAccountId: activeAccount?.id || "",
      });
    } catch (error) {
      set({
        accountsError: error instanceof Error ? error.message : "加载账户失败",
        accountsLoading: false,
      });
    }
  },

  // 切换活跃账户
  switchActiveAccount: async (accountId: string) => {
    try {
      console.warn("切换活跃账户:", accountId);
      // 保存旧的活跃账户ID
      const { accounts, activeAccountId: oldActiveAccountId } = get();
      // 更新账户列表中每个账户的isActive状态
      const updatedAccounts = accounts.map((acc) => ({
        ...acc,
        isActive: acc.id === accountId,
      }));
      const account = updatedAccounts.find((acc) => acc.id === accountId);
      if (account) {
        // 调用API更新后端数据
        await AccountService.updateAccount(accountId, { isActive: true });
        // 更新本地状态
        set({
          accounts: updatedAccounts,
          activeAccountId: accountId,
          activeAccount: account,
        });
        // 切换旧的活跃账户为非活跃状态
        if (oldActiveAccountId && oldActiveAccountId !== accountId) {
          console.log("切换旧活跃账户为非活跃状态:", oldActiveAccountId);
          await AccountService.updateAccount(oldActiveAccountId, {
            isActive: false,
          });
        }
        // 加载新账户的标签
        await get().loadTags();
        // 加载新账户的交易
        await get().loadTransactions(
          accountId,
          get().selectedDate.getFullYear(),
          get().selectedDate.getMonth() + 1
        );
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "切换账户失败",
      });
      throw error;
    }
  },

  addAccount: async (accountData: AccountDataType) => {
    try {
      console.log("调用useDataStore添加账户:", accountData);
      // 直接将accountData作为参数传递给createNewAccount函数
      if (accountData.isActive) {
        // 先将当前活跃账户设为非活跃
        await AccountService.updateAccount(get().activeAccountId!, {
          isActive: false,
        });
      }
      const newAccount = await AccountService.createNewAccount(accountData);
      await get().loadAccounts();
      if (accountData.isActive) {
        // 切换新账户为活跃账户
        await get().switchActiveAccount(newAccount.id);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加账户失败",
      });
      throw error;
    }
  },

  updateAccount: async (id, accountData) => {
    try {
      console.log("调用useDataStore更新账户:", id, accountData);
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
        activeAccount: updatedAccount.isActive ? updatedAccount : get().activeAccount,
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
      await AccountService.setAsArchived(id);
      const { accounts, activeAccountId } = get();
      const newAcountsList = accounts.filter((acc) => acc.id !== id);
      if (activeAccountId === id) {
        // 如果删除的是当前活跃账户，切换到第一个账户
        await get().switchActiveAccount(newAcountsList[0].id);
      }
      set({ accounts: newAcountsList });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "删除账户失败",
      });
      throw error;
    }
  },


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
          month,
          { ignorePagination: true }
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
      return newTransaction;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加交易失败",
      });
      throw error;
    }
  },

  addBatchTransactions: async (transactions) => {
    try {
      const newTransactions =
        await TransactionService.createTransactionsBatch(transactions);
      const { transactions: oldTransactions } = get();
      set({ transactions: [...oldTransactions, ...newTransactions] });

      await get().loadTransactions(
        get().activeAccountId!,
        get().selectedDate.getFullYear(),
        get().selectedDate.getMonth() + 1
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
      const tags = await TagService.getTagsByAccountId(get().activeAccountId!);
      console.log("根据账户ID过滤标签:", tags.length);
      set({ tags, tagsLoading: false });
    } catch (error) {
      set({
        tagsError: error instanceof Error ? error.message : "加载标签失败",
        tagsLoading: false,
      });
    }
  },

  addTag: async (
    tagData: Omit<NewTag, "id" | "accountIds" | "updatedAt" | "createdAt">
  ) => {
    try {
      const newTag = await TagService.createTag({
        ...tagData,
        accountIds: [get().activeAccountId!].join(","),
      });
      const { tags } = get();
      set({ tags: [...tags, newTag] });
      return newTag;
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
      console.log("获取数据库中的所有支付方式:", paymentMethods.length);
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
        [get().activeAccountId!].join(","),
        paymentMethodData.name,
        paymentMethodData.icon || "",
        paymentMethodData.isDefault || false
      );
      const { paymentMethods } = get();
      set({ paymentMethods: [...paymentMethods, newPaymentMethod] });
      return newPaymentMethod
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

  // todo: 票据图片添加到交易单中
  addTicketImagesToTransaction: async (ticketImagesData, transactionId) => {
    try {
      const attachmentImgs = await AttachmentService.createBatch(ticketImagesData);
      if (attachmentImgs.length) {
        const updatedTransaction = await TransactionService.updateTransaction(transactionId, {
          attachmentIds: attachmentImgs.map((img) => img.id).join(","),
        });
        const newTransaction = await TransactionService.getTransactionDetail(transactionId);
        console.log("更新后的交易单:", newTransaction);
        if (newTransaction) {
          set({ transactions: get().transactions.map((tx) => (tx.id === transactionId ? newTransaction : tx)) });
        }
        return updatedTransaction
      }
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "添加票据图片失败",
      });
      throw error;
    }
  },

  // 获取默认用户操作
  loadCurrentUser: async () => {
    try {
      // 从本地存储获取当前用户ID
      const userID = (await defaultStorageManager.get("userID")) as string;
      let user;
      if (userID) {
        user = await UserService.getUserById(userID);
        set({ currentUser: user || null });
      } else {
        user = await UserService.findUserAny();
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
      accountsError: "",
      transactionsError: null,
      tagsError: null,
      paymentMethodsError: null,
    });
  },

  clearAllData: () => {
    set(initialState);
  },

  setSelectedDate: async (date: Date) => {
    set({ selectedDate: date });
  },
}));

export default useDataStore;
