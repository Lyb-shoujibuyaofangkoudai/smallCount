// components/AddTransaction/AmountDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface AmountDisplayProps {
  amount: string;
  categoryName: string;
  categoryIcon: any; // Ionicons name
  categoryColor: string;
  accountName: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  categoryName,
  categoryIcon,
  categoryColor,
  accountName,
}) => {
  return (
    <View className="px-6 py-6 bg-background">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-8 h-8 rounded-full bg-card items-center justify-center border border-border">
          <Ionicons name={categoryIcon} size={16} color={categoryColor} />
        </View>
        <Text className="text-textSecondary text-sm">
          {categoryName} - {accountName}
        </Text>
      </View>
      <Text className="text-5xl font-bold text-text">
        ¥ {amount || '0.00'}
      </Text>
    </View>
  );
};