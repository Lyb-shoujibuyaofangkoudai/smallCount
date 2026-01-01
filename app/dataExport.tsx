import AccountSelectModal from "@/components/ui/AddTransaction/AccountSelectModal";
import CategoryManageModal from "@/components/ui/AddTransaction/CategoryManageModal";
import PaymentMethodModal from "@/components/ui/AddTransaction/PaymentMethodModal";
import MonthPickerModal from "@/components/widgets/MonthSelect";
import { APP_NAME, GITHUB_LINK } from "@/constants/data";
import { useTheme } from "@/context/ThemeContext";
import { Account } from "@/db/repositories/AccountRepository";
import { PaymentMethod } from "@/db/repositories/PaymentMethodRepository";
import { NewTag } from "@/db/repositories/TagRepository";
import {
    TransactionService,
    TransactionWithDetailInfo,
} from "@/db/services/TransactionService";
import useDataStore from "@/storage/store/useDataStore";
import { exportDataToXlsx } from "@/utils/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingItemProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  trailing?: React.ReactNode;
  bottomBorder?: boolean;
};

function SettingItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  trailing,
  bottomBorder = true,
}: SettingItemProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      className={`flex-row items-center justify-between bg-card py-4 px-4  transition-colors ${bottomBorder ? "border-b border-b-gray-200 dark:border-b-neutral-800" : ""}`}
      android_ripple={{ color: "#e5e5ea" }}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
    >
      <View className="flex-row items-center flex-1">
        {icon ? (
          <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-gray-100 dark:bg-neutral-800">
            <MaterialIcons name={icon} size={18} color={theme.colors.primary} />
          </View>
        ) : null}
        <Text className="text-base text-neutral-900 dark:text-neutral-100 font-medium">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {value ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">
            {value}
          </Text>
        ) : null}
        {trailing}
        {showArrow && !trailing ? (
          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function DataExportPage() {
  const {
    activeAccount,
    tags: allTags,
    paymentMethods: allPaymentMethods,
  } = useDataStore();
  const { accounts, paymentMethods, tags } = useDataStore();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const currentDate = new Date();
  const [startYear, setStartYear] = useState(
    currentDate.getMonth() <= 2
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear()
  );
  const [startMonth, setStartMonth] = useState(
    currentDate.getMonth() <= 2
      ? currentDate.getMonth() + 10
      : currentDate.getMonth() - 2
  );
  const [endYear, setEndYear] = useState(currentDate.getFullYear());
  const [endMonth, setEndMonth] = useState(currentDate.getMonth() + 1);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<NewTag[]>([]);

  useEffect(() => {
    if (activeAccount) {
      setSelectedAccounts([activeAccount]);
    }
    setSelectedTags(allTags);
    setSelectedPaymentMethods(allPaymentMethods);
  }, [activeAccount]);

  const handleExport = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 计算结束月份的最后一天
    const lastDayOfEndMonth = new Date(endYear, endMonth, 0);
    console.log("计算得到的结束日期:", lastDayOfEndMonth);

    // 获取数据库中的数据
    const transactions = await TransactionService.getTransactionsByFilters(
      selectedAccounts,
      selectedTags,
      selectedPaymentMethods,
      new Date(`${startYear}-${startMonth}-01`),
      lastDayOfEndMonth
    );

    console.log("从数据库获取的交易记录:", JSON.stringify(transactions));

    // 按账户分组交易数据
    const transactionsByAccount: Record<
      string,
      { account: Account; transactions: TransactionWithDetailInfo[] }
    > = {};

    // 初始化分组对象，为每个选中的账户创建空数组
    selectedAccounts.forEach((account) => {
      transactionsByAccount[account.id] = {
        account,
        transactions: [],
      };
    });

    // 将交易数据按账户分组
    transactions.forEach((transaction) => {
      if (
        transaction.accountId &&
        transactionsByAccount[transaction.accountId]
      ) {
        transactionsByAccount[transaction.accountId].transactions.push(
          transaction
        );
      }
    });

    // 按交易日期排序每个账户的交易记录
    Object.keys(transactionsByAccount).forEach((accountId) => {
      transactionsByAccount[accountId].transactions.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
    });

    console.log(
      "按账户分组后的交易数据:",
      JSON.stringify(transactionsByAccount)
    );

    // 调用导出函数
    await exportDataToXlsx(transactionsByAccount, [
      [`感谢使用${APP_NAME}，如果APP对你有帮助，欢迎给个star：${GITHUB_LINK}`],
      [
        `导出时间: ${formatDateRange(startYear, startMonth, endYear, endMonth)}`,
      ],
      [
        `导出账户: ${selectedAccounts.map((account) => account.name).join("、")}`,
      ],
      [`导出分类: ${selectedTags.map((tag) => tag.name).join("、")}`],
      [
        `导出支付方式: ${selectedPaymentMethods.map((method) => method.name).join("、")}`,
      ],
    ]);
  };

  // 格式化日期范围显示
  const formatDateRange = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ) => {
    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear}年${startMonth}月`;
    }
    return `${startYear}-${startMonth.toString().padStart(2, "0")} 至 ${endYear}-${endMonth.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-950">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-border">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </Pressable>
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 ml-4">
            导出选项
          </Text>
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Title Section */}
            <View className="px-6 pt-6 pb-4">
              <Text className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                导出数据
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                筛选并导出你的记账记录到本地文件。
              </Text>
            </View>

            {/* Filter Section */}
            <View className="px-6 pb-6">
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                筛选条件
              </Text>

              <View className="bg-card rounded-2xl overflow-hidden border border-border">
                {/* Date Range */}
                <SettingItem
                  icon="event"
                  label="日期范围"
                  value={formatDateRange(
                    startYear,
                    startMonth,
                    endYear,
                    endMonth
                  )}
                  onPress={() => {
                    setShowMonthPicker(true);
                  }}
                />

                {/* Account Source */}
                <SettingItem
                  icon="account-balance-wallet"
                  label="账户来源"
                  value={
                    selectedAccounts.length > 0
                      ? `已选 ${selectedAccounts.length} 项`
                      : "不限"
                  }
                  onPress={() => {
                    setShowAccountPicker(true);
                  }}
                />

                {/* Tags */}
                <SettingItem
                  icon="local-offer"
                  label="消费标签"
                  value={
                    selectedTags.length > 0
                      ? `已选 ${selectedTags.length} 个`
                      : "不限"
                  }
                  onPress={() => {
                    setShowTagPicker(true);
                  }}
                />

                {/* Payment Method */}
                <SettingItem
                  icon="apps"
                  label="支付方式"
                  value={
                    selectedPaymentMethods.length > 0
                      ? `已选 ${selectedPaymentMethods.length} 项`
                      : "不限"
                  }
                  bottomBorder={false}
                  onPress={() => {
                    setShowPaymentPicker(true);
                  }}
                />
              </View>
            </View>

            {/* File Format Section */}
            <View className="px-6 pb-6">
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                文件格式
              </Text>

              <View className="bg-card rounded-2xl overflow-hidden border border-border">
                <SettingItem
                  icon="description"
                  label="Excel 表格 (.xlsx)"
                  trailing={
                    <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                      <MaterialIcons name="check" size={14} color="white" />
                    </View>
                  }
                  bottomBorder={false}
                  onPress={() => {
                    // 这里可以添加格式选择逻辑
                    console.log("选择文件格式");
                  }}
                />
              </View>
            </View>

            {/* 添加底部占位，避免内容被固定底部遮挡 */}
            <View className="h-24" />
          </ScrollView>
        </View>

        {/* 固定在底部的导出按钮区域 */}
        <View className="px-6 py-4 bg-card bg-card border-t border-border">
          <Pressable
            className="bg-primary rounded-2xl py-4 items-center justify-center shadow-sm flex-row"
            onPress={handleExport}
          >
            <MaterialIcons
              name="download"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-semibold text-base">确认导出</Text>
          </Pressable>
        </View>
      </View>

      {/* MonthPicker Modal */}
      <MonthPickerModal
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        enableRangeSelection={true}
        initialStartYear={startYear}
        initialStartMonth={startMonth}
        initialEndYear={endYear}
        initialEndMonth={endMonth}
        onRangeConfirm={(startYear, startMonth, endYear, endMonth) => {
          setStartYear(startYear);
          setStartMonth(startMonth);
          setEndYear(endYear);
          setEndMonth(endMonth);
          setShowMonthPicker(false);
        }}
      />

      {/* AccountSelect Modal */}
      <AccountSelectModal
        visible={showAccountPicker}
        onClose={() => setShowAccountPicker(false)}
        enableMultipleSelection={true}
        selectedIds={selectedAccounts.map((account) => account.id)}
        onMultipleSelect={(accounts) => {
          setSelectedAccounts(accounts);
          setShowAccountPicker(false);
        }}
        data={accounts}
        confirmButtonText="确定选择"
        maxSelection={5}
      />

      {/* PaymentMethod Modal */}
      <PaymentMethodModal
        visible={showPaymentPicker}
        onClose={() => setShowPaymentPicker(false)}
        enableMultipleSelection={true}
        selectedIds={selectedPaymentMethods.map((method) => method.id)}
        onMultipleSelect={(methods) => {
          setSelectedPaymentMethods(methods);
          setShowPaymentPicker(false);
        }}
        data={paymentMethods}
        confirmButtonText="确定选择"
      />

      {/* CategoryManage Modal */}
      <CategoryManageModal
        visible={showTagPicker}
        onClose={() => setShowTagPicker(false)}
        categories={tags}
        currentType="expense"
        onUpdateCategories={() => {}} // 在选择模式下不需要更新分类
        enableSelection={true}
        selectionMode="multiple"
        selectedIds={selectedTags.map((tag) => tag.id)}
        onSelectionChange={(tagIds) => {
          // 根据选中的ID获取完整的标签对象
          const selectedTagObjects = tags.filter((tag) =>
            tagIds.includes(tag.id)
          );
          setSelectedTags(selectedTagObjects);
        }}
        confirmButtonText="确定"
        showEditButtons={false}
      />
    </SafeAreaView>
  );
}
