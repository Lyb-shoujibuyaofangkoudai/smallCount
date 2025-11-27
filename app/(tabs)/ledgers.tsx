import AccountCreateOrEditModalWidget from "@/components/widgets/AccountCreateOrEditModalWidget";
import SwipeableRow, { SwipeAction } from "@/components/widgets/SwipeableRow";
import { useTheme } from "@/context/ThemeContext";
import { Account } from "@/db/repositories/AccountRepository";
import { AccountDataType } from "@/storage/store/types";
import useDataStore from "@/storage/store/useDataStore";
import { addAlphaToColor } from "@/theme/colors";
import { getFirstCharToUpper } from "@/utils/utils";
import Big from "big.js";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountsScreen() {
  const { theme } = useTheme();
  const [totalBalance, setTotalBalance] = useState(0);
  const [debtBalance, setDebtBalance] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const {
    accounts: acList,
    addAccount,
    updateAccount,
    deleteAccount,
    activeAccountId,
    activeAccount,
    switchActiveAccount,
  } = useDataStore();

  useEffect(() => {
    // 计算总余额 - 使用bigjs避免浮点数精度问题
    const total = acList.reduce((sum, acc) => {
      const balance = new Big(acc.balance || 0);
      return sum.plus(balance);
    }, new Big(0));
    setTotalBalance(total.toNumber());

    // 计算负债总额 - 使用bigjs避免浮点数精度问题
    const debt = acList
      .filter((account) => account.balance !== null && account.balance < 0)
      .reduce((sum, acc) => {
        const balance = new Big(acc.balance || 0);
        return sum.plus(balance);
      }, new Big(0));
    setDebtBalance(Math.abs(debt.toNumber()));
  }, [acList]);

  // 格式化金额辅助函数
  const formatMoney = (amount: number) => {
    // 处理正负号显示逻辑
    const sign = amount > 0 && !amount.toString().includes("-") ? "" : "";
    // toLocaleString 自动添加千分位
    return `${sign}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 处理删除操作
  const handleDelete = async (id: string) => {
    try {
      console.log("Delete item:", id);
      Alert.alert(
        "确认删除",
        `确定删除账户 ${getFirstCharToUpper(activeAccount?.name || "")} 吗？`,
        [
          { text: "取消", style: "cancel" },
          {
            text: "删除",
            style: "destructive",
            onPress: async () => {
              await deleteAccount(id);
            },
          },
        ]
      );
      // await deleteAccount(id);
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  // 处理编辑操作
  const handleEdit = (id: string) => {
    const accountToEdit = acList.find(account => account.id === id);
    if (accountToEdit) {
      setEditingAccount(accountToEdit);
      setIsModalVisible(true);
    }
  };

  // 处理添加账户
  const handleAddAccount = () => {
    setEditingAccount(undefined);
    setIsModalVisible(true);
  };

  // 处理保存账户
  const handleSaveAccount = async (accountData: AccountDataType) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, accountData as any);
      } else {
        await addAccount(accountData as any);
      }
      setIsModalVisible(false);
      setEditingAccount(undefined);
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      {/* --- 头部区域 (Header) --- */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          多账户管理
        </Text>
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
          {formatMoney(totalBalance)}
        </Text>
        <View className="mt-2 mb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            负债: {formatMoney(debtBalance)}
          </Text>
        </View>
      </View>

      {/* 当前选中账户 */}
      {activeAccount && (
        <View className="px-4 mb-4">
          <View className="bg-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            {/* 头部标题 */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                当前选中账户
              </Text>
              <View className="px-2 py-1 bg-primary/10 rounded-full">
                <Text className="text-xs font-medium text-primary">
                  当前使用
                </Text>
              </View>
            </View>

            {/* 账户信息 */}
            <View className="flex-row items-center gap-4 mb-3">
              {/* 账户图标 */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: activeAccount.color || theme.colors.primary,
                }}
              >
                <Text className="text-white text-lg font-bold">
                  {getFirstCharToUpper(activeAccount.name)}
                </Text>
              </View>

              {/* 账户详情 */}
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {activeAccount.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {activeAccount.notes || "暂无描述"}
                </Text>
              </View>
            </View>

            {/* 账户余额 */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                账户余额
              </Text>
              <Text
                className={`text-xl font-bold ${
                  activeAccount.balance !== null && activeAccount.balance < 0
                    ? "text-danger"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {formatMoney(activeAccount.balance || 0)}
              </Text>
            </View>
          </View>
        </View>
      )}
      <ScrollView
        className="flex-1 mb-4"
        contentContainerStyle={{ paddingBottom: 100 }} // 底部留白给 TabBar
        showsVerticalScrollIndicator={false}
      >
        {/* --- 账户列表 (List) --- */}
        <View className="flex-col gap-3">
          {acList.map((account) => {
            // 定义滑动菜单的动作
            const rightActions: SwipeAction[] = [
              {
                label: "编辑",
                onPress: () => handleEdit(account.id),
                className: "bg-gray-400", // 灰色背景
                width: 80,
              },
              // 如果是默认账户，不显示删除按钮
              ...(!account.isDefault ? [
                {
                  label: "删除",
                  onPress: () => handleDelete(account.id),
                  className: "bg-red-500", // 红色背景
                  width: 80, 
                }
              ] : []),
            ];

            return (
              <SwipeableRow
                key={account.id}
                actions={rightActions}
                className="mx-4 mb-1 mb-2 rounded-lg overflow-hidden border border-transparent" // 外层容器样式
              >
                {/* 卡片本体 */}
                <TouchableOpacity
                  onPress={() => switchActiveAccount(account.id)}
                  activeOpacity={0.7}
                >
                  <View
                    className="bg-card flex-row justify-between items-center p-5"
                    style={{
                      backgroundColor:
                        account.id === activeAccountId
                          ? addAlphaToColor(theme.colors.primary, 0.1)
                          : theme.colors.card,
                    }}
                  >
                    {/* 左侧：图标 + 信息 */}
                    <View className="flex-row items-center gap-3">
                      {/* 图标容器 */}
                      <View className="relative">
                        <View
                          className={`w-8 h-8 rounded-full items-center justify-center`}
                          style={{
                            backgroundColor:
                              account?.color || theme.colors.primary,
                          }}
                        >
                          <Text className="text-white text-sm font-bold">
                            {getFirstCharToUpper(account.name)}
                          </Text>
                        </View>
                        {/* 活跃账户标识 */}
                        {account.id === activeAccountId && (
                          <View className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-800"></View>
                        )}
                      </View>

                      {/* 文字信息 */}
                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {account.name}
                          </Text>
                          {account.id === activeAccountId && (
                            <View className="px-2 py-0.5 bg-primary rounded-full">
                              <Text className="text-xs text-white font-medium">
                                当前
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {account.notes || "暂无描述"}
                        </Text>
                      </View>
                    </View>

                    {/* 右侧：金额 */}
                    <Text
                      className={`text-base font-bold ${
                        account?.balance !== null && account.balance < 0
                          ? "text-red-500" // 负数显示红色 (var(--danger))
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {account?.balance !== null && account.balance > 0
                        ? ""
                        : ""}
                      {formatMoney(account?.balance || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </SwipeableRow>
            );
          })}
        </View>
      </ScrollView>
      {/* --- 添加按钮 (Add Button) --- */}
      <TouchableOpacity
        activeOpacity={0.6}
        className="mx-4 mt-1 p-5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 items-center justify-center"
        onPress={handleAddAccount}
      >
        <Text className="text-primary font-bold text-base">+ 添加新账户</Text>
      </TouchableOpacity>
      {/* 新增/编辑账户弹窗 */}
      <AccountCreateOrEditModalWidget
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingAccount(undefined);
        }}
        onSave={handleSaveAccount}
        account={editingAccount}
      />
    </SafeAreaView>
  );
}
