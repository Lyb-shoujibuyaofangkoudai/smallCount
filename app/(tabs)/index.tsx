import DashboardHeader from "@/components/ui/DashboardHeader";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import MonthSelect from "@/components/widgets/MonthSelect";
import { useRouter } from "expo-router";
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
import { useTheme } from "@/context/ThemeContext";
import { useShadowStyle } from "@/hooks/use-shadow";
import { useState } from "react";

// 模拟数据 - 按日期分组的数据结构
const mockTransactionsByDate = [
  {
    title: "11月20日 · 今天",
    total: { expense: 92.4, income: 0 },
    data: [
      {
        id: "1",
        amount: 92.4,
        description: "午餐",
        type: "expense" as const,
        date: "2024-11-20",
        icon: "🍜",
        color: "#FF9500",
        paymentMethod: "微信",
        tags: [
          { id: "tag1", name: "餐饮", color: "#FF9500" },
          { id: "tag2", name: "午餐", color: "#FF6B6B" }
        ]
      },{
        id: "2",
        amount: 92.4,
        description: "午餐",
        type: "expense" as const,
        date: "2024-11-20",
        icon: "🍜",
        color: "#FF9500",
        paymentMethod: "微信",
        tags: [
          { id: "tag1", name: "餐饮", color: "#FF9500" },
          { id: "tag2", name: "午餐", color: "#FF6B6B" }
        ]
      },
      {
        id: "3",
        amount: 300.0,
        description: "兼职收入",
        type: "income" as const,
        date: "2024-11-19",
        icon: "💰",
        color: "#34C759",
        paymentMethod: "支付宝",
        tags: [
          { id: "tag3", name: "收入", color: "#34C759" },
          { id: "tag4", name: "兼职", color: "#4ECDC4" }
        ]
      },
    ],
  },
  {
    title: "11月19日 · 昨天",
    total: { expense: 0, income: 300.0 },
    data: [
      {
        id: "2",
        amount: 300.0,
        description: "兼职收入",
        type: "income" as const,
        date: "2024-11-19",
        icon: "💰",
        color: "#34C759",
        paymentMethod: "支付宝",
        tags: [
          { id: "tag3", name: "收入", color: "#34C759" },
          { id: "tag4", name: "兼职", color: "#4ECDC4" }
        ]
      },
    ],
  },
  {
    title: "11月18日 · 周一",
    total: { expense: 178.9, income: 0 },
    data: [
      {
        id: "3",
        amount: 178.9,
        description: "超市采购",
        type: "expense" as const,
        date: "2024-11-18",
        icon: "🛒",
        color: "#5AC8FA",
        paymentMethod: "招商信用卡",
        tags: [
          { id: "tag5", name: "购物", color: "#45B7D1" },
          { id: "tag6", name: "日用品", color: "#FED766" }
        ]
      },
    ],
  },
];

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

const DetailList = () => {


  // 渲染每个交易项
  const renderTransactionItem = ({ item }: { item: any }) => (
    <View className="mx-4">
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
    </View>
  );

  // 渲染分组头部
  const renderSectionHeader = ({ section }: { section: any }) => (
    <DateSectionHeader title={section.title} total={section.total} />
  );

  return (
    <SectionList
      sections={mockTransactionsByDate}
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
  const shadowStyle = useShadowStyle(theme.dark, "large");
  const router = useRouter();

  // 日期选择器状态
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  // Tab切换状态
  const [activeTab, setActiveTab] = useState<"calendar" | "details">("details");

  // 月份选择器确认回调
  const handleMonthConfirm = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 1); // 月份从0开始，所以需要减1
    setSelectedDate(newDate);
    setShowMonthSelect(false);
    console.log("选择月份:", year, "年", month, "月");
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
          <BalanceWidget balance={12580.5} income={5000.0} expense={218.4} />

          {/* 日历组件 - 传入测试数据 */}
          <CalendarWidget
            transactionsData={{
              "2025-11-12": { expense: 120.5, income: 0 },
              "2025-11-13": { expense: 0, income: 500.0 },
              "2025-11-14": { expense: 85.3, income: 200.0 },
              "2025-11-15": { expense: 256.8, income: 0 },
              "2025-11-16": { expense: 0, income: 0 },
              "2025-11-17": { expense: 45.6, income: 1000.0 },
              "2025-11-18": { expense: 178.9, income: 0 },
              "2025-11-19": { expense: 0, income: 300.5 },
              "2025-11-20": { expense: 92.4, income: 0 },
              "2025-11-21": { expense: 0, income: 0 },
              "2025-11-22": { expense: 167.8, income: 800.0 },
              "2025-11-23": { expense: 34.2, income: 0 },
              "2025-11-24": { expense: 0, income: 150.0 },
              "2025-11-25": { expense: 289.6, income: 0 },
              "2025-11-26": { expense: 0, income: 0 },
              "2025-11-27": { expense: 123.45, income: 600.0 },
              "2025-11-28": { expense: 67.8, income: 0 },
              "2025-11-29": { expense: 0, income: 0 },
              "2025-03-30": { expense: 198.7, income: 1200.0 },
              "2025-03-31": { expense: 76.3, income: 0 },
            }}
            onDayPress={(date) => {
              // console.log('选中日期:', date);
            }}
            onMonthChange={(date) => {
              // console.log('月份变化:', date);
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
        <DetailList />
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
