import { Tag } from "@/db/repositories/TagRepository";
import {
    TransactionService,
    TransactionWithDetailInfo,
} from "@/db/services/TransactionService";
import Big from "big.js";
import { createAppStore } from "../index";
import type {
    StatsChartData,
    StatsFilter,
    StatsState,
    StatsStore,
} from "./types";

// 初始状态定义
const initialState: StatsState = {
  filter: {
    period: "month",
    type: "expense",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  chartData: {
    expense: {
      total: "0",
      color: "",
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
    income: {
      total: "0",
      color: "",
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
  },
  comparisonData: null,
  isLoading: false,
  error: null,
};

// 创建统计存储
export const useStatsStore = createAppStore<StatsStore>((set, get) => ({
  ...initialState,

  // 设置统计过滤器
  setFilter: (filter: Partial<StatsFilter>) => {
    const currentFilter = get().filter;
    set({
      filter: {
        ...currentFilter,
        ...filter,
      },
    });
  },

  // 根据条件加载统计数据
  loadStatsData: async (accountId: string, filter: StatsFilter) => {
    set({ isLoading: true, error: null, filter });

    try {
      if (filter.period === "month") {
        // 加载月统计数据
        await get().loadStatsDataByMonth(accountId, get().filter.year);
      } else {
        await get().loadStatsDataByWeek(
          accountId,
          get().filter.year,
          get().filter.month
        );
      }

      // 加载对比数据
      await get().loadComparisonData(
        accountId,
        filter.year,
        filter.period === "week" ? filter.month : undefined,
        filter.type
      );

      set({
        isLoading: false,
      });
    } catch (error) {
      console.error("加载统计数据失败:", error);
      set({
        error: error instanceof Error ? error.message : "加载统计数据失败",
        isLoading: false,
      });
    }
  },

  // 加载对比数据
  loadComparisonData: async (
    accountId: string,
    year: number,
    month?: number,
    type?: "income" | "expense"
  ) => {
    set({ isLoading: true, error: null });

    try {
      console.log("加载对比数据参数:", accountId, year, month, type);
      const comparisonData = await TransactionService.getComparisonData(
        accountId,
        year,
        month,
        type
      );

      set({
        comparisonData,
        isLoading: false,
      });
    } catch (error) {
      console.error("加载对比数据失败:", error);
      set({
        error: error instanceof Error ? error.message : "加载对比数据失败",
        isLoading: false,
      });
    }
  },

  loadStatsDataByWeek: async (
    accountId: string,
    year: number,
    month: number
  ) => {
    set({ isLoading: true, error: null });

    try {
      // 从数据库获取本周的交易数据，包括周统计信息
      const response = await TransactionService.getTransactionsByWeek(
        accountId,
        year,
        month,
        { ignorePagination: true }
      );

      console.log("按周交易数据响应:", response);

      // 处理数据，转换为图表需要的格式
      // 优先使用weeklyStats数据，如果没有则使用items作为回退
      const chartData = response.weeklyStats
        ? processWeeklyTransactions(response.weeklyStats)
        : processWeeklyTransactions(response.items);

      console.log("处理后的图表数据:", JSON.stringify(chartData));

      set({
        chartData,
        isLoading: false,
      });
    } catch (error) {
      console.error("加载本周统计数据失败:", error);
      set({
        error: error instanceof Error ? error.message : "加载本周统计数据失败",
        isLoading: false,
      });
    }
  },

  // 加载年的月统计数据
  loadStatsDataByMonth: async (accountId: string, year: number) => {
    set({ isLoading: true, error: null });
    try {
      // 从数据库获取某年所有月份的交易收支统计情况
      const response = await TransactionService.getTransactionsByYear(
        accountId,
        year
      );
      // 处理月度统计数据
      const chartData = processMonthlyTransactions(response as any);

      set({
        chartData,
        isLoading: false,
      });
    } catch (error) {
      console.error("加载月度统计数据失败:", error);
      set({
        error: error instanceof Error ? error.message : "加载月度统计数据失败",
        isLoading: false,
      });
    }
  },

  // 加载最近6年统计数据
  loadStatsDataByYear: async (accountId: string, year) => {
    set({ isLoading: true, error: null });
    try {
    } catch (error) {
      console.error("加载年统计数据失败:", error);
      set({
        error: error instanceof Error ? error.message : "加载年统计数据失败",
        isLoading: false,
      });
    }
  },

  // 清除错误信息
  clearError: () => {
    set({ error: null });
  },
}));

// 定义WeeklyStats类型以匹配TransactionService中返回的数据结构
interface WeeklyStats {
  week: number;
  startDate: Date;
  endDate: Date;
  income: number;
  expense: number;
  transactions: TransactionWithDetailInfo[];
}

// 定义月度统计数据接口
export interface MonthlyStats {
  month: number;
  income: number;
  expense: number;
  balance: number;
  tagStats?: Array<{
    tagName: string;
    tagColor: string;
    tagIcon: string;
    amount: number;
    count: number;
  }>;
  paymentMethodStats?: Array<{
    paymentMethodName: string;
    amount: number;
    count: number;
  }>;
}
// 处理月度统计数据函数
function processMonthlyTransactions(data: { months: any[] }): StatsChartData {
  // 初始化统计数据
  const chartData: StatsChartData = {
    expense: {
      total: "0",
      color: "#ef4444", // 支出默认使用红色
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
    income: {
      total: "0",
      color: "#10b981", // 收入默认使用绿色
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
  };

  // 计算总收入和总支出 - 使用Big.js确保精确计算
  let totalExpense = new Big(0);
  let totalIncome = new Big(0);

  // 按标签统计支出
  const expenseByTag: Record<
    string,
    { amount: Big; count: number; color?: string; icon?: string }
  > = {};

  // 按标签统计收入
  const incomeByTag: Record<
    string,
    { amount: Big; count: number; color?: string; icon?: string }
  > = {};

  // 检查数据是否有效
  if (data && Array.isArray(data.months)) {
    // 设置月度数据到chartData的xAxis和yAxis
    chartData.expense.data.xAxis = data.months.map(
      (month) => `${month.month}月`
    );
    chartData.expense.data.yAxis = data.months.map((month) => month.expense);
    chartData.income.data.xAxis = data.months.map(
      (month) => `${month.month}月`
    );
    chartData.income.data.yAxis = data.months.map((month) => month.income);

    // 遍历所有月份数据，汇总标签统计
    data.months.forEach((month) => {
      // 累计总收入和支出
      totalExpense = totalExpense.plus(new Big(month.expense));
      totalIncome = totalIncome.plus(new Big(month.income));

      // 处理标签统计数据
      if (Array.isArray(month.tagStats)) {
        month.tagStats.forEach(
          (tagStat: Tag & { amount: number; count: number }) => {
            // 使用提供的type字段来判断收入或支出类型
            const isIncome = tagStat.type === "income";

            // 根据用户提供的示例数据，字段名应该是name、color、icon而不是tagName、tagColor、tagIcon
            const tagName = tagStat.name || "未分类";
            const tagColor = tagStat.color || "#666";
            const tagIcon = tagStat.icon || "🏷️";
            const tagAmount = new Big(tagStat.amount);
            const tagCount = tagStat.count || 0;

            if (isIncome) {
              if (!incomeByTag[tagName]) {
                incomeByTag[tagName] = {
                  amount: new Big(0),
                  count: 0,
                  color: tagColor,
                  icon: tagIcon,
                };
              }
              incomeByTag[tagName].amount =
                incomeByTag[tagName].amount.plus(tagAmount);
              incomeByTag[tagName].count += tagCount;
            } else {
              if (!expenseByTag[tagName]) {
                expenseByTag[tagName] = {
                  amount: new Big(0),
                  count: 0,
                  color: tagColor,
                  icon: tagIcon,
                };
              }
              expenseByTag[tagName].amount =
                expenseByTag[tagName].amount.plus(tagAmount);
              expenseByTag[tagName].count += tagCount;
            }
          }
        );
      }
    });
  }

  // 设置总金额
  chartData.expense.total = totalExpense.toFixed(2);
  chartData.income.total = totalIncome.toFixed(2);

  // 生成支出排行榜数据
  chartData.expense.ranking = Object.entries(expenseByTag)
    .map(([tagName, data]) => {
      const percent = totalExpense.gt(0)
        ? parseFloat(data.amount.div(totalExpense).times(100).toFixed(2))
        : 0;

      return {
        icon: data.icon || "🏷️",
        name: tagName,
        percent,
        amount: data.amount.toFixed(2),
        color: data.color || "#666",
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // 生成支出环形图数据
  chartData.expense.donut = Object.entries(expenseByTag).map(
    ([tagName, data]) => {
      const percentage = totalExpense.gt(0)
        ? parseFloat(data.amount.div(totalExpense).times(100).toFixed(2))
        : 0;

      return {
        color: data.color || "#666",
        percentage,
        label: tagName,
      };
    }
  );

  // 生成收入排行榜数据
  chartData.income.ranking = Object.entries(incomeByTag)
    .map(([tagName, data]) => {
      const percent = totalIncome.gt(0)
        ? parseFloat(data.amount.div(totalIncome).times(100).toFixed(2))
        : 0;

      return {
        icon: data.icon || "🏷️",
        name: tagName,
        percent,
        amount: data.amount.toFixed(2),
        color: data.color || "#666",
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // 生成收入环形图数据
  chartData.income.donut = Object.entries(incomeByTag).map(
    ([tagName, data]) => {
      const percentage = totalIncome.gt(0)
        ? parseFloat(data.amount.div(totalIncome).times(100).toFixed(2))
        : 0;

      return {
        color: data.color || "#666",
        percentage,
        label: tagName,
      };
    }
  );

  return chartData;
}

function processWeeklyTransactions(
  data: WeeklyStats[] | TransactionWithDetailInfo[]
): StatsChartData {
  // 初始化统计数据
  const chartData: StatsChartData = {
    expense: {
      total: "0",
      color: "#ef4444", // 支出默认使用红色
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
    income: {
      total: "0",
      color: "#10b981", // 收入默认使用绿色
      linePath: "",
      areaPath: "",
      ranking: [],
      donut: [],
      data: {
        xAxis: [],
        yAxis: [],
      },
    },
  };

  // 计算总收入和总支出 - 使用Big.js确保精确计算
  let totalExpense = new Big(0);
  let totalIncome = new Big(0);

  // 按标签统计支出
  const expenseByTag: Record<
    string,
    { amount: Big; count: number; color?: string; icon?: string }
  > = {};

  // 按标签统计收入
  const incomeByTag: Record<
    string,
    { amount: Big; count: number; color?: string; icon?: string }
  > = {};

  // 判断输入数据类型并处理
  if (Array.isArray(data) && data.length > 0) {
    // 检查是否为WeeklyStats数组
    if ("week" in data[0]) {
      // 处理WeeklyStats数组
      const weeklyStatsArray = data as WeeklyStats[];

      // 设置周统计数据到chartData的xAxis和yAxis
      chartData.expense.data.xAxis = weeklyStatsArray.map(
        (week) => `第${week.week}周`
      );
      chartData.expense.data.yAxis = weeklyStatsArray.map(
        (week) => week.expense
      );
      chartData.income.data.xAxis = weeklyStatsArray.map(
        (week) => `第${week.week}周`
      );
      chartData.income.data.yAxis = weeklyStatsArray.map((week) => week.income);

      // 合并所有周的交易记录进行标签统计
      const allTransactions: TransactionWithDetailInfo[] = [];
      weeklyStatsArray.forEach((week) => {
        allTransactions.push(...week.transactions);
      });

      // 遍历合并后的交易记录
      allTransactions.forEach((transaction) => {
        const { amount, type, tag } = transaction;
        const tagName = tag?.name || "未分类";
        const tagColor = tag?.color || "#666"; // 默认标签颜色
        const tagIcon = tag?.icon || "🏷️"; // 默认标签图标
        const transactionAmount = new Big(amount);

        if (type === "expense") {
          totalExpense = totalExpense.plus(transactionAmount);

          if (!expenseByTag[tagName]) {
            expenseByTag[tagName] = {
              amount: new Big(0),
              count: 0,
              color: tagColor,
              icon: tagIcon,
            };
          }

          expenseByTag[tagName].amount =
            expenseByTag[tagName].amount.plus(transactionAmount);
          expenseByTag[tagName].count += 1;
        } else if (type === "income") {
          totalIncome = totalIncome.plus(transactionAmount);

          if (!incomeByTag[tagName]) {
            incomeByTag[tagName] = {
              amount: new Big(0),
              count: 0,
              color: tagColor,
              icon: tagIcon,
            };
          }

          incomeByTag[tagName].amount =
            incomeByTag[tagName].amount.plus(transactionAmount);
          incomeByTag[tagName].count += 1;
        }
      });
    } else {
      // 处理TransactionWithTagAndPaymentMethod数组（回退逻辑）
      const transactions = data as TransactionWithDetailInfo[];

      // 遍历交易数据
      transactions.forEach((transaction) => {
        const { amount, type, tag } = transaction;
        const tagName = tag?.name || "未分类";
        const tagColor = tag?.color || "#666"; // 默认标签颜色
        const tagIcon = tag?.icon || "🏷️"; // 默认标签图标
        const transactionAmount = new Big(amount);

        if (type === "expense") {
          totalExpense = totalExpense.plus(transactionAmount);

          if (!expenseByTag[tagName]) {
            expenseByTag[tagName] = {
              amount: new Big(0),
              count: 0,
              color: tagColor,
              icon: tagIcon,
            };
          }

          expenseByTag[tagName].amount =
            expenseByTag[tagName].amount.plus(transactionAmount);
          expenseByTag[tagName].count += 1;
        } else if (type === "income") {
          totalIncome = totalIncome.plus(transactionAmount);

          if (!incomeByTag[tagName]) {
            incomeByTag[tagName] = {
              amount: new Big(0),
              count: 0,
              color: tagColor,
              icon: tagIcon,
            };
          }

          incomeByTag[tagName].amount =
            incomeByTag[tagName].amount.plus(transactionAmount);
          incomeByTag[tagName].count += 1;
        }
      });
    }
  }

  // 设置总金额
  chartData.expense.total = totalExpense.toFixed(2);
  chartData.income.total = totalIncome.toFixed(2);

  // 生成支出排行榜数据（符合 RankingItem 接口）
  chartData.expense.ranking = Object.entries(expenseByTag)
    .map(([tagName, data]) => {
      const percent = totalExpense.gt(0)
        ? parseFloat(data.amount.div(totalExpense).times(100).toFixed(2))
        : 0;

      return {
        icon: data.icon || "🏷️",
        name: tagName,
        percent,
        amount: data.amount.toFixed(2),
        color: data.color || "#666",
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // 生成支出环形图数据（符合 ChartDataItem 接口）
  chartData.expense.donut = Object.entries(expenseByTag).map(
    ([tagName, data]) => {
      const percentage = totalExpense.gt(0)
        ? parseFloat(data.amount.div(totalExpense).times(100).toFixed(2))
        : 0;

      return {
        color: data.color || "#666",
        percentage,
        label: tagName,
      };
    }
  );

  // 生成收入排行榜数据（符合 RankingItem 接口）
  chartData.income.ranking = Object.entries(incomeByTag)
    .map(([tagName, data]) => {
      const percent = totalIncome.gt(0)
        ? parseFloat(data.amount.div(totalIncome).times(100).toFixed(2))
        : 0;

      return {
        icon: data.icon || "🏷️",
        name: tagName,
        percent,
        amount: data.amount.toFixed(2),
        color: data.color || "#666",
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // 生成收入环形图数据（符合 ChartDataItem 接口）
  chartData.income.donut = Object.entries(incomeByTag).map(
    ([tagName, data]) => {
      const percentage = totalIncome.gt(0)
        ? parseFloat(data.amount.div(totalIncome).times(100).toFixed(2))
        : 0;

      return {
        color: data.color || "#666",
        percentage,
        label: tagName,
      };
    }
  );

  return chartData;
}
