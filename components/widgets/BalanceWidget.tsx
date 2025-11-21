import { Text, View } from 'react-native';

interface BalanceWidgetProps {
  balance: number;
  income: number;
  expense: number;
}

export default function BalanceWidget({ balance, income, expense }: BalanceWidgetProps) {
  return (
    <View className="bg-primary rounded-xl p-5 my-4">
      <View className="items-start mb-4">
        <Text className="text-md font-bold text-white dark:text-gray-100 opacity-80">本月结余 (11月)</Text>
        <Text className="text-[32px] font-bold text-white dark:text-gray-100 mt-1">+ {balance.toFixed(2)}</Text>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-md font-medium text-white dark:text-gray-100 opacity-80">收入</Text>
          <Text className="text-2xl font-semibold text-white dark:text-gray-100">{income.toFixed(2)}</Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-md font-medium text-white dark:text-gray-100 opacity-80">支出</Text>
          <Text className="text-2xl font-semibold text-white dark:text-gray-100">{expense.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}