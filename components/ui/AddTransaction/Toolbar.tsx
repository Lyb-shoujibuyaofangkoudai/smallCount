// components/AddTransaction/Toolbar.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ToolbarProps {
  dateStr: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ dateStr }) => {
  return (
    <View className="flex-row gap-3 px-4 py-2 bg-background border-b border-border">
      <TouchableOpacity className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border">
        <Text className="text-xs text-textSecondary">📅 {dateStr}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border flex-1">
        <Text className="text-xs text-textSecondary">📝 添加备注...</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border">
        <Text className="text-xs text-textSecondary">📷 票据</Text>
      </TouchableOpacity>
    </View>
  );
};