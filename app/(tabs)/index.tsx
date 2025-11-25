import DashboardHeader from "@/components/ui/DashboardHeader";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import MonthSelect from "@/components/widgets/MonthSelect";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 组件导入
import TransactionItem from "@/components/biz/TransactionItem";
import BalanceWidget from "@/components/widgets/BalanceWidget";
import SwipeableRow from "@/components/widgets/SwipeableRow";
import { useDatabase } from "@/context/DbContext";
import { useTheme } from "@/context/ThemeContext";
import { TransactionService } from "@/db/services/TransactionService";
import { useShadowStyle } from "@/hooks/use-shadow";
import { defaultStorageManager } from "@/utils/storage";
import { useCallback, useEffect, useState } from "react";

// 日期分组头部组件
const DateSectionHeader = ({
  title,
  total,
}: {
  title: string;
  total: { expense: number; income: number };
}) => {
  const totalText =
    total.income > 0
      ? `收: ${total.income.toFixed(2)}`
      : `支: ${total.expense.toFixed(2)}`;

  return (
    <View className="flex-row justify-between items-center bg-transparent px-4 py-2 mt-4 dark:border-gray-800">
      <Text className="text-sm font-medium text-gray-400 dark:text-gray-300">
        {title}
      </Text>
      <Text className="text-sm font-medium text-gray-400 dark:text-gray-300">
        {totalText}
      </Text>
    </View>
  );
};

const DetailList = ({
  transactionsByDate,
  loading,
}: {
  transactionsByDate: any[];
  loading: boolean;
}) => {
  // 渲染每个交易项
  const renderTransactionItem = ({ item }: { item: any }) => (
    <View className="mx-4">
      <SwipeableRow
        className="mb-2 rounded-lg overflow-hidden"
        actions={[
          {
            label: "编辑",
            onPress: () => console.log("编辑交易:", item.id),
            className: "bg-blue-500",
            textClassName: "text-white",
          },
          {
            label: "删除",
            onPress: () => console.log("删除交易:", item.id),
            className: "bg-red-500",
            textClassName: "text-white",
          },
        ]}
        threshold={80}
      >
        <TransactionItem
          key={item.id}
          title={item.description}
          amount={item.amount}
          type={item.type}
          date={item.date}
          paymentMethod={item.paymentMethod}
          tags={item.tags}
          icon={item.icon}
        />
      </SwipeableRow>
    </View>
  );

  // 渲染分组头部
  const renderSectionHeader = ({ section }: { section: any }) => (
    <DateSectionHeader title={section.title} total={section.total} />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    );
  }

  if (transactionsByDate.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">暂无交易记录</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={transactionsByDate}
      keyExtractor={(item) => item.id}
      renderItem={renderTransactionItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.sectionListContent}
      style={styles.sectionList}
    />
  );
};

const styles = StyleSheet.create({
  sectionListContent: {
    paddingBottom: 16,
  },
  sectionList: {
    flex: 1,
  },
  transactionItemContainer: {
    paddingHorizontal: 1,
  },
});

export default function HomeScreen() {
  const { theme } = useTheme();
  const db = useDatabase();
  const shadowStyle = useShadowStyle(theme.dark, "large");
  const router = useRouter();

  // 日期选择器状态
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  // Tab切换状态
  const [activeTab, setActiveTab] = useState<"calendar" | "details">("details");

  // 交易数据状态
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsByDate, setTransactionsByDate] = useState<any[]>([]);
  const [transactionsDataForCalendar, setTransactionsDataForCalendar] =
    useState<Record<string, { expense: number; income: number }>>({});
  const [monthlyStats, setMonthlyStats] = useState<{
    balance: number;
    income: number;
    expense: number;
  }>({
    balance: 0,
    income: 0,
    expense: 0,
  });
  const [loading, setLoading] = useState(false);

  // 月份选择器确认回调
  const handleMonthConfirm = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 1); // 月份从0开始，所以需要减1
    setSelectedDate(newDate);
    setShowMonthSelect(false);
  };

  const getData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    getTransactionByDate(year, month);
  };

  // 组件挂载和月份变化时获取数据
  useEffect(() => {
    if (!db.isInitialized) {
      return;
    }
    getData();
  }, [selectedDate, db.isInitialized]);

  // 监听页面聚焦事件，当从modal返回时重新获取数据
  useFocusEffect(
    useCallback(() => {
      if (!db.isInitialized) {
        return;
      }
      getData();
    }, [db.isInitialized])
  );

  // 显示月份选择器
  const showMonthSelectModal = () => {
    setShowMonthSelect(true);
  };

  // 关闭月份选择器
  const closeMonthSelectModal = () => {
    setShowMonthSelect(false);
  };

  // Tab切换处理
  const handleTabChange = (tab: "calendar" | "details") => {
    console.log("切换到 Tab:", tab);
    setActiveTab(tab);
  };

  // 获取指定月份的交易数据
  const getTransactionByDate = async (year: number, month: number) => {
    try {
      setLoading(true);
      const accountId =
        await defaultStorageManager.getString("defaultAccountId");

      // 调用TransactionService获取月份交易数据
      const result = await TransactionService.getTransactionsByMonth(
        accountId as string,
        year,
        month
      );

      if (result && result.items) {
        setTransactions(result.items);
        console.log("获取到的交易数据:", result.items[0]);
        // 计算月度统计数据
        let totalIncome = 0;
        let totalExpense = 0;

        result.items.forEach((transaction: any) => {
          if (transaction.type === "expense") {
            totalExpense += transaction.amount;
          } else if (transaction.type === "income") {
            totalIncome += transaction.amount;
          }
        });

        const balance = totalIncome - totalExpense;
        setMonthlyStats({
          balance,
          income: totalIncome,
          expense: totalExpense,
        });

        // 处理数据用于日历组件
        const calendarData: Record<
          string,
          { expense: number; income: number }
        > = {};

        result.items.forEach((transaction: any) => {
          const dateStr = new Date(transaction.transactionDate)
            .toISOString()
            .split("T")[0];

          if (!calendarData[dateStr]) {
            calendarData[dateStr] = { expense: 0, income: 0 };
          }

          if (transaction.type === "expense") {
            calendarData[dateStr].expense += transaction.amount;
          } else if (transaction.type === "income") {
            calendarData[dateStr].income += transaction.amount;
          }
        });

        setTransactionsDataForCalendar(calendarData);

        // 处理数据用于详情列表
        const groupedData = groupTransactionsByDate(result.items);
        setTransactionsByDate(groupedData);
      }
    } catch (error) {
      console.error("获取交易数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 按日期分组交易数据
  const groupTransactionsByDate = (transactions: any[]) => {
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
        paymentMethod: transaction.paymentMethod || "现金",
        tags: transaction.tags || [],
      });
    });
    // 转换为SectionList需要的格式
    return Object.entries(grouped).map(([title, data]) => {
      const total = {
        expense: data
          .filter((t: any) => t.type === "expense")
          .reduce((sum: number, t: any) => sum + t.amount, 0),
        income: data
          .filter((t: any) => t.type === "income")
          .reduce((sum: number, t: any) => sum + t.amount, 0),
      };

      return {
        title,
        total,
        data,
      };
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="dark-content" />
      {/* 头部组件 */}
      <DashboardHeader
        selectedDate={selectedDate}
        onDatePress={showMonthSelectModal}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === "calendar" ? (
        <ScrollView
          className="flex-1 px-3"
          showsVerticalScrollIndicator={false}
        >
          {/* 余额组件 */}
          <BalanceWidget
            balance={monthlyStats.balance}
            income={monthlyStats.income}
            expense={monthlyStats.expense}
            month={`${selectedDate.getMonth() + 1}月`}
          />

          {/* 日历组件 - 传入真实数据 */}
          <CalendarWidget
            current={selectedDate.toISOString().split("T")[0]}
            transactionsData={transactionsDataForCalendar}
            onDayPress={(date) => {
              console.log("选中日期:", date);
            }}
            onMonthChange={(date) => {
              console.log("月份变化:", date);
              // 更新选中日期并重新获取数据
              setSelectedDate(new Date(date.timestamp));
            }}
            style={{
              borderRadius: 12,
              marginBottom: 16,
            }}
          />

          {/* 底部间距 */}
          <View className="h-8" />
        </ScrollView>
      ) : (
        <DetailList transactionsByDate={transactionsByDate} loading={loading} />
      )}

      {/* 月份选择弹窗 */}
      <MonthSelect
        visible={showMonthSelect}
        onClose={closeMonthSelectModal}
        onConfirm={handleMonthConfirm}
        initialYear={selectedDate.getFullYear()}
        initialMonth={selectedDate.getMonth() + 1}
      />
    </SafeAreaView>
  );
}
