// components/AddTransaction/NumberPad.tsx
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface NumberPadProps {
  onPressNum: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onSelectAccount?: () => void;
  selectedAccountName?: string;
  type?: "expense" | "income" | "transfer";
  isSubmitting?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({ 
  onPressNum, 
  onDelete, 
  onSubmit,
  onSelectAccount,
  selectedAccountName = 'default',
  type,
  isSubmitting = true
}) => {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del'];
  
  return (
    <View className="h-[260px] flex-row bg-background relative">
      {/* 左侧数字区 */}
      <View className="flex-1 flex-row flex-wrap">
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            className="w-1/3 h-[65px] bg-card items-center justify-center active:bg-border"
            disabled={isSubmitting}
            onPress={() => (key === 'del' ? onDelete() : onPressNum(key))}
          >
            {key === 'del' ? (
              <Text className="text-xl font-medium text-text">⌫</Text>
            ) : (
              <Text className="text-2xl font-medium text-text">{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 右侧功能区 */}
      <View className="w-1/4 flex-col">
        {/* 账户选择键 */}
        {type !== "transfer" && (
          <TouchableOpacity 
            className="flex-1 bg-background items-center justify-center active:bg-border"
            disabled={isSubmitting}
            onPress={onSelectAccount}
          >
            <Text className="text-sm font-medium text-text">账户</Text>
            <Text className="text-[10px] text-textSecondary mt-1">
              {selectedAccountName}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* 完成键 */}
        <TouchableOpacity 
          className="flex-[3] bg-primary items-center justify-center"
          disabled={isSubmitting}
          onPress={onSubmit}
        >
          <Text className="text-lg font-bold text-white">完成</Text>
        </TouchableOpacity>
      </View>

      {/* TODO: 这里会无效 Loading 遮罩层 */}
      {isSubmitting && (
        <TouchableOpacity 
          className="absolute inset-0 bg-black/30 items-center justify-center"
          disabled={true}
        >
          <ActivityIndicator color="white" size="large" />
        </TouchableOpacity>
      )}
    </View>
  );
}; 