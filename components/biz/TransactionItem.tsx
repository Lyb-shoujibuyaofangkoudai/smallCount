import { CURRENCIES } from '@/constants/data';
import { PaymentMethod } from '@/constants/type';
import { NewTag } from '@/db/repositories/TagRepository';
import useDataStore from '@/storage/store/useDataStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TransactionItemProps {
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  paymentMethod?: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>;
  tag?: Omit<NewTag, 'id' | 'createdAt'>;
  icon?: string;
}

export default function TransactionItem({ 
  title, 
  amount, 
  date, 
  type,
  paymentMethod,
  tag,
  icon = "💰"
}: TransactionItemProps) {
  const {
    activeAccount
  } = useDataStore()
  return (
    <View className="flex-row justify-between items-center py-6 px-5 bg-white bg-gray-200 dark:bg-charcoal-800">
      <View className="flex-1 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 dark:bg-gray-800">
        <Ionicons name={tag!.icon as any} size={24} color={tag!.color as string} />
          {/* <Text className="text-lg">{icon}</Text> */}
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900 mb-1 dark:text-gray-100">{title}</Text>
          <View className="flex-row items-center flex-wrap gap-2">
            {paymentMethod && (
              <View className="px-2 py-0.5 rounded-[4px] bg-secondary">
                <Text className="text-xs text-white">{paymentMethod.name}</Text> 
              </View>
            )}
          </View>
        </View>
      </View>
      <Text className={`text-xl font-bold ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
        {type === 'income' ? '+' : '-'}{CURRENCIES[activeAccount!.currency as keyof typeof CURRENCIES]?.char || '￥'}{Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
}