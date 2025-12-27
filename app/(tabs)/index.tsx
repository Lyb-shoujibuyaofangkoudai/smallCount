import CalendarDayIEDetail from "@/components/biz/CalendarDayIEDetail";
import DashboardHeader from "@/components/ui/DashboardHeader";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import MonthSelect from "@/components/widgets/MonthSelect";
import { router } from "expo-router";
import {
  Alert,
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
import { useTheme } from "@/context/ThemeContext";
import useDataStore from "@/storage/store/useDataStore";
import { useState } from "react";

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
  const { deleteTransaction } = useDataStore();

  // 渲染每个交易项
  const renderTransactionItem = ({ item }: { item: any }) => (
    <View className="mx-4">
      <SwipeableRow
        className="mb-2 rounded-lg overflow-hidden"
        actions={[
          {
            label: "编辑",
            onPress: () => router.navigate(`/transaction/edit/${item.id}`),
            className: "bg-blue-500",
            textClassName: "text-white",
          },
          {
            label: "删除",
            onPress: () => {
              Alert.alert(
                "确认删除",
                `确定删除交易记录${item.transactionDate.toLocaleDateString()}的${item.tag.name} 吗？`,
                [
                  { text: "取消", style: "cancel" },
                  {
                    text: "删除",
                    style: "destructive",
                    onPress: () => deleteTransaction(item.id),
                  },
                ]
              );
            },
            className: "bg-red-500",
            textClassName: "text-white",
          },
        ]}
        threshold={80}
      >
        <TransactionItem
          key={item.id}
          title={item.tag.name}
          amount={item.amount}
          type={item.type}
          date={item.date}
          paymentMethod={item.paymentMethod}
          tag={item.tag}
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
  const {
    monthlyStats,
    transactionsForDate,
    transactionsDataForCalendar,
    activeAccountId,
    loadTransactions,
    selectedDate, 
    setSelectedDate
  } = useDataStore();

  const [showMonthSelect, setShowMonthSelect] = useState(false);

  // Tab切换状态
  const [activeTab, setActiveTab] = useState<"calendar" | "details">("details");

  const [loading, setLoading] = useState(false);

  // 月份选择器确认回调
  const handleMonthConfirm = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 1); // 月份从0开始，所以需要减1
    setSelectedDate(newDate);
    setShowMonthSelect(false);
    loadTransactions(
      activeAccountId!,
      newDate.getFullYear(),
      newDate.getMonth() + 1
    );
  };

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
            selectionMode="single"
            current={selectedDate.toISOString().split("T")[0]}
            selectedDate={selectedDate.toISOString().split("T")[0]}
            transactionsData={transactionsDataForCalendar}
            onDayChange={(date) => {
              // 只在date不为undefined时更新选中日期
              if (date) {
                setSelectedDate(new Date(date as string));
              }
            }}
            onSelectedDateChange={(date) => {
              // 只在date不为undefined时更新选中日期
              if (date) {
                setSelectedDate(new Date(date));
              }
            }}
            onMonthChange={(date) => {
              // 更新选中日期并重新获取数据
              // 将选中日期设置为新月份的第一天，避免切换月份后自动选中相同日期号的日期
              setSelectedDate(new Date(date.year, date.month - 1, 1));
              loadTransactions(activeAccountId!, date.year, date.month);
            }}
            style={{
              borderRadius: 12,
              marginBottom: 16,
            }}
          />

          <CalendarDayIEDetail />

          {/* 底部间距 */}
          <View className="h-8" />
        </ScrollView>
      ) : (
        <DetailList
          transactionsByDate={transactionsForDate}
          loading={loading}
        />
      )}

      {/* 月份选择弹窗 */}
      <MonthSelect
        visible={showMonthSelect}
        onClose={closeMonthSelectModal}
        onConfirm={handleMonthConfirm}
        initialYear={selectedDate.getFullYear()}
        initialMonth={selectedDate.getMonth() + 1}
        maxDate={new Date().toISOString().split("T")[0]}
      />
    </SafeAreaView>
  );
}
