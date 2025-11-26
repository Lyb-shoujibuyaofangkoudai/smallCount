import AccountCreateModalWidget from "@/components/widgets/AccountCreateModalWidget";
import SwipeableRow, { SwipeAction } from "@/components/widgets/SwipeableRow";
import { useTheme } from "@/context/ThemeContext";
import useDataStore from "@/storage/store/useDataStore";
import { getFirstCharToUpper } from "@/utils/utils";
import Big from "big.js";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountsScreen() {
  const {theme} = useTheme();
  const [totalBalance, setTotalBalance] = useState(0);
  const [debtBalance, setDebtBalance] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    accounts: acList,
    addAccount
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
  const handleDelete = (id: string) => {
    console.log("Delete item:", id);
    // 这里添加删除逻辑
  };

  // 处理编辑操作
  const handleEdit = (id: string) => {
    console.log("Edit item:", id);
  };

  // 处理添加账户
  const handleAddAccount = () => {
    setIsModalVisible(true);
  };

  // 处理保存账户
  const handleSaveAccount = async (accountData: any) => {
    try {
      await addAccount(accountData);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }} // 底部留白给 TabBar
        showsVerticalScrollIndicator={false}
      >
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
              {
                label: "删除",
                onPress: () => handleDelete(account.id),
                className: "bg-red-500", // 红色背景
                width: 80,
              },
            ];

            return (
              <SwipeableRow
                key={account.id}
                actions={rightActions}
                className="mx-4 mb-1 mb-2 rounded-lg overflow-hidden" // 外层容器样式
              >
                {/* 卡片本体 */}
                <View className="bg-card flex-row justify-between items-center p-5  shadow-sm  dark:border-gray-800">
                  {/* 左侧：图标 + 信息 */}
                  <View className="flex-row items-center gap-3">
                    {/* 图标容器 */}
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

                    {/* 文字信息 */}
                    <View>
                      <Text className="text-base font-bold text-gray-900 dark:text-white">
                        {account.name}
                      </Text>
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
                    {account?.balance !== null && account.balance > 0 ? "" : ""}
                    {formatMoney(account?.balance || 0)}
                  </Text>
                </View>
              </SwipeableRow>
            );
          })}

          {/* --- 添加按钮 (Add Button) --- */}
          <TouchableOpacity
            activeOpacity={0.6}
            className="mx-4 mt-1 p-5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 items-center justify-center"
            onPress={handleAddAccount}
          >
            <Text className="text-primary font-bold text-base">
              + 添加新账户
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 新增账户弹窗 */}
      <AccountCreateModalWidget
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveAccount}
      />
    </SafeAreaView>
  );
}
