import DashboardHeader from "@/components/ui/DashboardHeader";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import { useRouter } from "expo-router";
import {
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 组件导入
import TransactionItem from "@/components/biz/TransactionItem";
import Card from "@/components/ui/Card";
import BalanceWidget from "@/components/widgets/BalanceWidget";
import { useTheme } from "@/context/ThemeContext";
import { useShadowStyle } from "@/hooks/use-shadow";
import { useState } from "react";

// 模拟数据 - 按日期分组的数据结构
const mockTransactionsByDate = [
  {
    title: "11月20日 · 今天",
    total: { expense: 92.40, income: 0 },
    data: [
      {
        id: "1",
        amount: 92.40,
        description: "午餐",
        type: "expense" as const,
        category: "餐饮",
        date: "2024-11-20",
        icon: "🍜",
        color: "#FF9500",
        paymentMethod: "微信",
      },
    ],
  },
  {
    title: "11月19日 · 昨天", 
    total: { expense: 0, income: 300.00 },
    data: [
      {
        id: "2",
        amount: 300.00,
        description: "兼职收入",
        type: "income" as const,
        category: "工资收入",
        date: "2024-11-19",
        icon: "💰",
        color: "#34C759",
        paymentMethod: "支付宝",
      },
    ],
  },
  {
    title: "11月18日 · 周一",
    total: { expense: 178.90, income: 0 },
    data: [
      {
        id: "3",
        amount: 178.90,
        description: "超市采购",
        type: "expense" as const,
        category: "日用品",
        date: "2024-11-18",
        icon: "🛒",
        color: "#5AC8FA",
        paymentMethod: "招商信用卡",
      },
    ],
  },
];

// 日期分组头部组件
const DateSectionHeader = ({ title, total }: { title: string; total: { expense: number; income: number } }) => {
  const totalText = total.income > 0 ? `收: ${total.income.toFixed(2)}` : `支: ${total.expense.toFixed(2)}`;
  
  return (
    <View className="flex-row justify-between items-center bg-transparent px-4 py-2 mt-4 dark:border-gray-800">
      <Text className="text-sm font-medium text-gray-400 dark:text-gray-500">{title}</Text>
      <Text className="text-sm font-medium text-gray-400 dark:text-gray-500">{totalText}</Text>
    </View>
  );
};

const DetailList = () => {
  const handleViewAllTransactions = () => {
    // navigation.navigate(Routes.TRANSACTIONS as any);
    // 暂时注释，因为还没有创建交易列表页面
  };

  // 渲染每个交易项
  const renderTransactionItem = ({ item }: { item: any }) => (
    <View>
      <TransactionItem
        key={item.id}
        title={item.description}
        amount={item.amount}
        type={item.type}
        category={item.category}
        date={item.date}
        paymentMethod={item.paymentMethod}
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
        stickySectionHeadersEnabled={true}
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
    maxHeight: 400,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Tab切换状态
  const [activeTab, setActiveTab] = useState<'calendar' | 'details'>('details');

  // 日期选择器变化处理
  const onDateChange = (event: any) => {
    setShowDatePicker(false);
    setSelectedDate(new Date(event.nativeEvent.timestamp));
  };

  // 显示日期选择器
  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Tab切换处理
  const handleTabChange = (tab: 'calendar' | 'details') => {
    console.log('切换到 Tab:', tab);
    setActiveTab(tab);
  };

  const handleAddTransaction = (type: "income" | "expense") => {
    // navigation.navigate(Routes.ADD_TRANSACTION, { type });
    // 暂时注释，因为还没有创建添加交易页面
    console.log("添加交易:", type);
  };

  const handleNavigateToStats = () => {
    router.push("/stats");
  };

  const handleNavigateToLedgers = () => {
    router.push("/ledgers");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar barStyle="dark-content" />
      {/* 头部组件 */}
      <DashboardHeader 
        selectedDate={selectedDate}
        onDatePress={showDatepicker}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'calendar' ? (
        <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
          {/* 余额组件 */}
          <BalanceWidget balance={12580.5} income={5000.0} expense={218.4} />

          {/* 日历组件 - 传入测试数据 */}
          <Card className="mb-4">
            <CalendarWidget
              transactionsData={{
                '2025-11-12': { expense: 120.50, income: 0 },
                '2025-11-13': { expense: 0, income: 500.00 },
                '2025-11-14': { expense: 85.30, income: 200.00 },
                '2025-11-15': { expense: 256.80, income: 0 },
                '2025-11-16': { expense: 0, income: 0 },
                '2025-11-17': { expense: 45.60, income: 1000.00 },
                '2025-11-18': { expense: 178.90, income: 0 },
                '2025-11-19': { expense: 0, income: 300.50 },
                '2025-11-20': { expense: 92.40, income: 0 },
                '2025-11-21': { expense: 0, income: 0 },
                '2025-11-22': { expense: 167.80, income: 800.00 },
                '2025-11-23': { expense: 34.20, income: 0 },
                '2025-11-24': { expense: 0, income: 150.00 },
                '2025-11-25': { expense: 289.60, income: 0 },
                '2025-11-26': { expense: 0, income: 0 },
                '2025-11-27': { expense: 123.45, income: 600.00 },
                '2025-11-28': { expense: 67.80, income: 0 },
                '2025-11-29': { expense: 0, income: 0 },
                '2025-03-30': { expense: 198.70, income: 1200.00 },
                '2025-03-31': { expense: 76.30, income: 0 },
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
            </Card>

          <View>
            
          </View>
          
          {/* 底部间距 */}
          <View className="h-8" />
        </ScrollView>
      ) : (
        <DetailList />
      )}
    </SafeAreaView>
  );
}
