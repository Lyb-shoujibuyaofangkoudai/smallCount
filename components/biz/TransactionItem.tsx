import React from 'react';
import { Text, View } from 'react-native';

interface TransactionItemProps {
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  paymentMethod?: string;
  icon?: string;
}

export default function TransactionItem({ 
  title, 
  amount, 
  category, 
  date, 
  type,
  paymentMethod,
  icon = "💰"
}: TransactionItemProps) {
  return (
    <View className="flex-row justify-between items-center py-3 px-4 bg-white rounded-xl mb-2 dark:bg-black">
      <View className="flex-1 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 dark:bg-gray-800">
          <Text className="text-lg">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900 mb-1 dark:text-gray-100">{title}</Text>
          <View className="flex-row items-center">
            {paymentMethod && (
              <View className="bg-gray-100 px-2 py-0.5 rounded-full dark:bg-gray-800">
                <Text className="text-xs text-gray-400 dark:text-gray-500">{paymentMethod}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text className={`text-xl font-bold ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
        {type === 'income' ? '+' : '-'}¥{Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
}