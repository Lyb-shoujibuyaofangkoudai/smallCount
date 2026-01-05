import { CURRENCIES } from '@/constants/data';
import { PaymentMethod } from '@/constants/type';
import { NewTag } from '@/db/repositories/TagRepository';
import useDataStore from '@/storage/store/useDataStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export interface TransactionItemData {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  paymentMethod?: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>;
  tag?: Omit<NewTag, 'id' | 'createdAt'>;
  icon?: string;
  fromAccountId?: string;
  transferAccountId?: string;
}

interface TransactionItemProps {
  data: TransactionItemData;
}

export default function TransactionItem({ data }: TransactionItemProps) {
  const {
    activeAccount
  } = useDataStore()

  const {  amount, type, paymentMethod, tag, fromAccountId } = data;

  const isIncome = type === 'income' || (type === 'transfer' && fromAccountId !== activeAccount?.id);
  const amountColor = isIncome ? 'text-green-500' : 'text-red-500';

  return (
    <View className="flex-row justify-between items-center py-6 px-5 bg-white bg-gray-200 dark:bg-charcoal-800">
      <View className="flex-1 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 dark:bg-gray-800">
          <Ionicons name={tag!.icon as any} size={24} color={tag!.color as string} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900 mb-1 dark:text-gray-100">{tag!.name}</Text>
          <View className="flex-row items-center flex-wrap gap-2">
            {paymentMethod && (
              <View className="px-2 py-0.5 rounded-[4px] bg-secondary">
                <Text className="text-xs text-white">{paymentMethod.name}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text className={`text-xl font-bold ${amountColor}`}>
        {isIncome ? '+' : '-'}{CURRENCIES[activeAccount!.currency as keyof typeof CURRENCIES]?.char || '￥'}{Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
}