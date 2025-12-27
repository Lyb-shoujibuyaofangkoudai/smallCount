import { CURRENCIES } from '@/constants/data';
import { useTheme } from '@/context/ThemeContext';
import useDataStore from '@/storage/store/useDataStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function CalendarDayIEDetail() {
  const { isDarkMode, theme: currentTheme } = useTheme();
  const {
    transactionsForDate,
    selectedDate,
    activeAccount,
    transactionsLoading,
    transactionsError,
  } = useDataStore();

  const dateKey = useMemo(() => {
    if (!selectedDate) return '';
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const dayTransactions = useMemo(() => {
    const found = transactionsForDate.find((item) => item.title === dateKey);
    return found?.data || [];
  }, [transactionsForDate, dateKey]);

  const incomeTransactions = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'income');
  }, [dayTransactions]);

  const expenseTransactions = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'expense');
  }, [dayTransactions]);

  const currencySymbol = useMemo(() => {
    const currency = activeAccount?.currency || 'CNY';
    return CURRENCIES[currency]?.char || '¥';
  }, [activeAccount]);

  const renderTransactionItem = (transaction: any) => {
    const isExpense = transaction.type === 'expense';
    const tag = transaction.tag;

    return (
      <View
        key={transaction.id}
        className="flex-row justify-between items-center py-3 px-4 border-b"
        style={{
          borderColor: currentTheme.colors.border,
        }}
      >
        <View className="flex-1 flex-row items-center">
          <View
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: isDarkMode ? currentTheme.colors.card : '#f3f4f6' }}
          >
            {tag?.icon ? (
              <Ionicons name={tag.icon as any} size={20} color={tag.color || currentTheme.colors.primary} />
            ) : (
              <Text className="text-lg">{isExpense ? '💳' : '💰'}</Text>
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
               {tag.name}
            </Text>
            {transaction.paymentMethod && (
              <View className="flex-row items-center gap-2">
                <View
                  className="px-2 py-0.5 rounded-[4px]"
                  style={{ backgroundColor: currentTheme.colors.secondary + '33' }}
                >
                  <Text
                    className="text-xs"
                    style={{ color: currentTheme.colors.secondary }}
                  >
                    {transaction.paymentMethod.name}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <Text
          className="text-lg font-bold"
          style={{
            color: isExpense ? currentTheme.colors.notification : currentTheme.colors.success,
          }}
        >
          {isExpense ? '-' : '+'}{currencySymbol}{transaction.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  if (transactionsLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text
          className="mt-4 text-base"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          加载中...
        </Text>
      </View>
    );
  }

  if (transactionsError) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <Ionicons name="alert-circle-outline" size={48} color={currentTheme.colors.notification} />
        <Text
          className="mt-4 text-base text-center"
          style={{ color: currentTheme.colors.text }}
        >
          {transactionsError}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <ScrollView className="flex-1">
        {dayTransactions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="document-outline" size={64} color={currentTheme.colors.textSecondary} />
            <Text
              className="mt-4 text-base"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              本日暂无收支记录
            </Text>
          </View>
        ) : (
          <>
            {incomeTransactions.length > 0 && (
              <View
                className="mb-4"
                style={{ backgroundColor: currentTheme.colors.card }}
              >
                <View
                  className="px-4 py-3 border-b"
                  style={{ borderColor: currentTheme.colors.border }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: currentTheme.colors.success }}
                  >
                    收入
                  </Text>
                </View>
                {incomeTransactions.map(renderTransactionItem)}
              </View>
            )}

            {expenseTransactions.length > 0 && (
              <View
                className="mb-4"
                style={{ backgroundColor: currentTheme.colors.card }}
              >
                <View
                  className="px-4 py-3 border-b"
                  style={{ borderColor: currentTheme.colors.border }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: currentTheme.colors.notification }}
                  >
                    支出
                  </Text>
                </View>
                {expenseTransactions.map(renderTransactionItem)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
