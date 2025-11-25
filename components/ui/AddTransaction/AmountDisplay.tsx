// components/AddTransaction/AmountDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface AmountDisplayProps {
  amount: string;
  categoryName: string;
  categoryIcon: any; // Ionicons name
  categoryColor: string;
  accountName?: string;
  note?: string;
  onNoteChange?: (note: string) => void;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  categoryName,
  categoryIcon,
  categoryColor,
  accountName,
  note = '',
  onNoteChange,
}) => {
  return (
    <View className="px-6 py-6">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-8 h-8 rounded-full bg-card items-center justify-center border border-border">
          <Ionicons name={categoryIcon} size={16} color={categoryColor} />
        </View>
        <Text className="text-textSecondary text-sm">
          {categoryName} {accountName ? `-${accountName}` : ''}
        </Text>
      </View>
      <Text className="text-5xl font-bold text-text">
        ¥ {amount || '0.00'}
      </Text>
      {/* 备注 */}
      <View className="mt-4">
        <TextInput
          className="bg-card border border-border rounded-lg px-4 py-3 text-text text-base"
          placeholder="📝 添加备注..."
          placeholderTextColor="#9CA3AF"
          value={note}
          onChangeText={onNoteChange}
          multiline={true}
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};