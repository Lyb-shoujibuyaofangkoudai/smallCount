import { CURRENCIES } from "@/constants/data";
import { useTheme } from "@/context/ThemeContext";
import { Account } from "@/db/repositories/AccountRepository";
import { AccountService } from "@/db/services/AccountService";
import { TransactionWithDetailInfo } from "@/db/services/TransactionService";
import useDataStore from "@/storage/store/useDataStore";
import { addAlphaToColor } from "@/theme/colors";
import { getFirstCharToUpper } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate } from "../../utils/format";

// 模拟数据 - 实际项目中应从数据库获取
const mockTransaction = {
  id: "e73ac0f3-f409-4385-aede-0df6045a4fe5",
  tagId: "6451500e-d722-4df2-acef-314cd1862ff7",
  paymentMethodId: "005727ee-63e7-451c-96a8-87ce9b7992db",
  accountId: "6fbf15fe-b6ef-4a2b-bbb8-1d7c7df2bbdb",
  attachmentIds: null,
  type: "expense" as const, // expense, income, transfer
  amount: 200,
  notes: "",
  description: "服饰美容支出",
  fromAccountId: null,
  transferAccountId: null,
  transactionDate: new Date("2026-01-01T00:00:00.000Z"),
  location: "上海市南京西路店",
  receiptImageUrl: null,
  isRecurring: false,
  recurringRule: null,
  isConfirmed: true,
  createdAt: new Date("2026-01-01T12:56:48.000Z"),
  updatedAt: new Date("2026-01-01T13:45:28.000Z"),
  tag: {
    id: "6451500e-d722-4df2-acef-314cd1862ff7",
    accountIds: null,
    name: "服饰美容",
    color: "#fd79a8",
    icon: "shirt",
    type: "expense",
    isDefault: true,
    createdAt: new Date("2025-12-03T10:30:39.000Z"),
    updatedAt: new Date("2025-12-03T10:30:39.000Z"),
  },
  paymentMethod: {
    id: "005727ee-63e7-451c-96a8-87ce9b7992db",
    accountIds: null,
    name: "现金",
    icon: "cash-outline",
    isDefault: false,
    createdAt: new Date("2025-12-03T10:30:39.000Z"),
    updatedAt: new Date("2025-12-03T10:30:39.000Z"),
  },
  account: {
    id: "6fbf15fe-b6ef-4a2b-bbb8-1d7c7df2bbdb",
    name: "招商信用卡",
    accountNumber: "8890",
    type: "credit_card",
    icon: "card-outline",
    color: "#3b82f6",
  },
  fromAccount: null,
  transferAccount: null,
  attachments: [],
};

// TODO: 转账类型待完善
const mockTransferTransaction = {
  ...mockTransaction,
  id: "2",
  type: "transfer" as const,
  amount: 5000.0,
  description: "10月账单还款",
  tag: {
    id: "2",
    accountIds: null,
    name: "信用卡还款",
    color: "#3b82f6",
    icon: "card-outline",
    type: "expense",
    isDefault: false,
    createdAt: new Date("2025-12-03T10:30:39.000Z"),
    updatedAt: new Date("2025-12-03T10:30:39.000Z"),
  },
  fromAccount: {
    id: "2",
    name: "中国银行",
    accountNumber: "4403",
    type: "bank",
    icon: "cash-outline",
    color: "#3b82f6",
  },
  transferAccount: {
    id: "1",
    name: "招商银行",
    accountNumber: "8890",
    type: "credit_card",
    icon: "card-outline",
    color: "#0284c7",
  },
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { transactions, activeAccount, deleteTransaction } = useDataStore();
  const transaction = transactions.find((t) => t.id === id);
  const router = useRouter();
  const { isDarkMode, theme } = useTheme();

  const Head = () => (
    <View className="flex-row items-center justify-between px-5 py-4 sticky top-0 z-10 bg-background/85 backdrop-blur-md">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800"
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={isDarkMode ? "white" : "black"}
        />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-text">交易详情</Text>
      <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center"></TouchableOpacity>
    </View>
  );

  // 添加防御性检查，确保transaction对象存在
  if (!transaction) {
    return (
      <SafeAreaView className="flex-1">
        <Head />
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-text">
            交易数据不存在
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [fromAccount, setFromAccount] = useState<Account>({} as Account);
  const [transferAccount, setTransferAccount] = useState<Account>({} as Account);

  const getTransferTransactionAccountDetail = async () => {
    if(transaction.type !== "transfer") {
      return ;
    } else {
      const fromAccountId = transaction.fromAccountId;
      const transferAccountId = transaction.transferAccountId;
      const promiseArr = [
        AccountService.getAccountById(fromAccountId!),
        AccountService.getAccountById(transferAccountId!),
      ];
      const res = await Promise.allSettled(promiseArr);
      console.log("查看获取数据结果：",JSON.stringify(res));
      if(res[0].status === "fulfilled") {
        setFromAccount(res[0].value as Account);
      }
      if(res[1].status === "fulfilled") {
        setTransferAccount(res[1].value as Account);
      }
    }
  }

  useEffect(() => {
    getTransferTransactionAccountDetail();
  }, [transaction]);



  const getThemeClass = () => {
    switch (transaction.type) {
      case "income":
        return "theme-income";
      case "transfer":
        return "theme-transfer";
      case "expense":
      default:
        return "theme-expense";
    }
  };

  const getTransactionTypeText = () => {
    switch (transaction.type) {
      case "income":
        return "收入";
      case "transfer":
        return "转账";
      case "expense":
      default:
        return "支出";
    }
  };

  const getTagTextColorClass = () => {
    switch (transaction.type) {
      case "income":
        return "text-green-600 dark:text-green-400";
      case "transfer":
        return "text-blue-600 dark:text-blue-400";
      case "expense":
      default:
        return "text-neutral-800 dark:text-neutral-200";
    }
  };

  const handleDeleteTransaction = (transaction: TransactionWithDetailInfo) => {
    if (transaction.type === "transfer") {
      Alert.alert(
        "确认删除",
        `此转账交易仅会从当前账户中删除，目标账户的记录需要您手动删除。确定删除吗？`,
        [
          { text: "取消", style: "cancel" },
          {
            text: "删除",
            style: "destructive",
            onPress: () => deleteTransaction(transaction.id),
          },
        ]
      );
    } else {
      Alert.alert(
        "确认删除",
        `确定删除交易记录${transaction.transactionDate.toLocaleDateString()}的${transaction!.tag!.name} 吗？`,
        [
          { text: "取消", style: "cancel" },
          {
            text: "删除",
            style: "destructive",
            onPress: () => deleteTransaction(transaction.id),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* 导航栏 */}
      <Head />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 交易信息区 */}
        <View className={`px-5 py-6 items-center ${getThemeClass()}`}>
          {/* 分类徽章 */}
          <View
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full mb-4 ${transaction.type === "income" ? "bg-green-50 dark:bg-green-900/30" : transaction.type === "transfer" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-white dark:bg-neutral-800"} shadow-sm`}
          >
            <Ionicons
              name={transaction.tag?.icon as any}
              size={24}
              className={getTagTextColorClass()}
              color={transaction.tag?.color || theme.colors.primary}
            />
            <Text className={`text-sm font-semibold ${getTagTextColorClass()}`}>
              {transaction.tag?.name}
            </Text>
          </View>

          {/* 交易描述 */}
          <Text className="text-2xl font-bold text-text mb-2">
            {transaction.description}
          </Text>

          {/* 金额显示 */}
          <View className="flex-row items-start justify-center mb-2">
            <Text
              className={`text-xl font-semibold text-text/60 mr-1 mt-1 ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : transaction.type === "transfer" ? "text-blue-600 dark:text-blue-400" : "text-text"}`}
            >
              {CURRENCIES[activeAccount?.currency || "CNY"].char}
            </Text>
            <Text
              className={`text-5xl font-bold ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : transaction.type === "transfer" ? "text-blue-600 dark:text-blue-400" : "text-text"}`}
            >
              {transaction.amount.toFixed(2)}
            </Text>
          </View>

          {/* 交易日期和类型 */}
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatDate(transaction.transactionDate, "time")} ·{" "}
            {getTransactionTypeText()}
          </Text>
        </View>

        {/* 交易详情卡片 */}
        <View className="px-5 mb-6">
          <View className="bg-card rounded-2xl shadow-md overflow-hidden">
            {/* 支付账户 */}
            <View className="flex-row items-center px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                style={{
                  backgroundColor: addAlphaToColor(theme.colors.primary, 0.7),
                }}
              >
                <Text className="text-white text-lg font-bold">
                  {getFirstCharToUpper(activeAccount?.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                  {transaction.type === "income" ? "入账账户" : "支付账户"}
                </Text>
                <Text className="text-base font-medium text-text">
                  {activeAccount?.name}
                </Text>
              </View>
            </View>

            {/* 支付方式 */}
            <View className="flex-row items-center px-5 py-4">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                style={{
                  backgroundColor: addAlphaToColor(theme.colors.primary, 0.7),
                }}
              >
                <Ionicons
                  name={transaction.paymentMethod?.icon as any}
                  size={20}
                  color="white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                  {transaction.type === "income" ? "交易方式" : "支付方式"}
                </Text>
                <Text className="text-base font-medium text-text">
                  {transaction.paymentMethod?.name}
                </Text>
              </View>
            </View>

            {/* 地点 - 仅支出类型显示 */}
            {transaction.type === "expense" && transaction.location && (
              <View className="flex-row items-center px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                  style={{
                    backgroundColor: addAlphaToColor(theme.colors.primary, 0.7),
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={isDarkMode ? "white" : "black"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                    地点
                  </Text>
                  <Text className="text-base font-medium text-text">
                    {transaction.location}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 转账流程 - 仅转账类型显示 */}
        {transaction.type === "transfer" &&
          fromAccount.id &&
          transferAccount.id && (
            <View className="px-5 mb-6">
              <View className="bg-card rounded-2xl shadow-md p-6 flex-row items-center justify-between">
                {/* 转出账户 */}
                <View className="flex-1 items-center py-4 px-2 bg-red-500/15 rounded-3xl border-2 border-red-500/50">
                  <View className="items-center bg-red-500/20 rounded-md py-0.5 px-2 mb-5">
                    <Text className="text-sm text-red-500">转出 FROM</Text>
                  </View>

                  <View
                    className="w-14 h-14 rounded-md items-center justify-center mb-4"
                    style={{
                      backgroundColor: fromAccount.color || theme.colors.primary,
                    }}
                  >
                    <View className="rounded-md items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {getFirstCharToUpper(fromAccount.name)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-lg font-medium text-text text-center"
                    numberOfLines={1}
                  >
                    {fromAccount.name}
                  </Text>
                  <Text className="text-sm text-textSecondary mt-1">
                    余额: ¥{fromAccount.balance?.toFixed(2) || "0.00"}
                  </Text>
                </View>

                {/* 箭头 */}
                <View className="mx-3 w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: theme.colors.card }}>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>

                {/* 转入账户 */}
                <View className="flex-1 items-center py-4 px-2 bg-green-500/15 rounded-3xl border-2 border-green-500/50">
                  <View className="items-center bg-green-500/20 rounded-md py-0.5 px-2 mb-5">
                    <Text className="text-sm text-green-500">转入 TO</Text>
                  </View>

                  <View
                    className="w-14 h-14 rounded-md items-center justify-center mb-4"
                    style={{
                      backgroundColor: transferAccount.color || theme.colors.success,
                    }}
                  >
                    <View className="rounded-md items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {getFirstCharToUpper(transferAccount.name)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-lg font-medium text-text text-center"
                    numberOfLines={1}
                  >
                    {transferAccount.name}
                  </Text>
                  <Text className="text-sm text-textSecondary mt-1">
                    余额: ¥{transferAccount.balance?.toFixed(2) || "0.00"}
                  </Text>
                </View>
              </View>
            </View>
          )}

        {/* 备注和附件 */}
        <View className="px-5 mb-6">
          <View className="bg-card rounded-2xl shadow-md overflow-hidden">
            {/* 描述 */}
            <View className="p-5">
              <Text className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                描述
              </Text>
              {transaction.description ? (
                <Text className="text-base text-text leading-relaxed">
                  {transaction.description}
                </Text>
              ) : (
                <Text className="text-base text-neutral-500 dark:text-neutral-400">
                  没有描述
                </Text>
              )}
            </View>

            {/* 备注 */}
            <View className="p-5 border-t border-neutral-200 dark:border-neutral-700">
              <Text className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                备注
              </Text>
              {transaction.notes ? (
                <Text className="text-base text-text leading-relaxed">
                  {transaction.notes}
                </Text>
              ) : (
                <Text className="text-base text-neutral-500 dark:text-neutral-400">
                  没有备注
                </Text>
              )}
            </View>

            {/* 附件 */}
            <View className="p-5 border-t border-neutral-200 dark:border-neutral-700">
              <Text className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                附件
              </Text>
              {Array.isArray(transaction?.attachments) &&
              transaction.attachments.length > 0 ? (
                transaction.attachments.map((item: any) => (
                  <View key={item.id}>
                    <View className="rounded-xl overflow-hidden h-36 bg-neutral-100 dark:bg-neutral-800 relative mb-4">
                      <Image
                        source={{ uri: item?.fileUrl }}
                        className="w-full h-full object-cover"
                      />
                      <View className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Text className="text-xs text-white">
                          {item?.fileName}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-base text-neutral-500 dark:text-neutral-400">
                  没有附件
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* 底部操作栏 */}
      <View className="p-5 bg-background">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleDeleteTransaction(transaction)}
            className="flex-1 h-12 rounded-full items-center justify-center bg-card shadow-lg border border-red-200 dark:border-red-900/30"
          >
            <Text className="text-base font-semibold text-red-600 dark:text-red-400">
              删除
            </Text>
          </TouchableOpacity>
          {transaction.type !== "transfer" && (
            <TouchableOpacity
              className="flex-[2] h-12 rounded-full items-center justify-center bg-black dark:bg-white shadow-lg flex-row gap-2"
              onPress={() => router.push(`/transaction/edit/${id}`)}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={isDarkMode ? "black" : "white"}
              />
              <Text className="text-base font-semibold text-white dark:text-black">
                编辑
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
