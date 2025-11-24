// components/AddTransaction/Header.tsx
import { SegmentedControl } from '@/components/widgets/SegmentedControl';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type TransactionType = 'expense' | 'income' | 'transfer';

interface HeaderProps {
  onCancel: () => void;
  currentType: TransactionType;
  onChangeType: (type: TransactionType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onCancel, currentType, onChangeType }) => {
  const types: TransactionType[] = ['expense', 'income', 'transfer'];
  const labels = ['支出', '收入', '转账'];

  const currentIndex = types.indexOf(currentType);

  const handleChange = (index: number) => {
    onChangeType(types[index]);
  };

  return (
    <View className="bg-background pt-safe pb-4"> 
      {/* 第一行：顶部导航栏 (取消按钮) */}
      {/* 使用 pt-safe 确保在刘海屏下位置正确，若未配置 SafeAreaView 可用 pt-12 */}
      <View className="flex-row items-center justify-between px-4 mb-4 pt-2">
        <TouchableOpacity 
          onPress={onCancel} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-textSecondary text-base">取消</Text>
        </TouchableOpacity>
        
        {/* 标题 (可选) */}
        <Text className="text-text font-semibold text-base">记一笔</Text>

        {/* 右侧占位，保持标题居中 */}
        <View className="w-8" />
      </View>

      {/* 第二行：滑块组件 */}
      <View className="px-8">
        <SegmentedControl 
          values={labels}
          selectedIndex={currentIndex}
          onChange={handleChange}
        />
      </View>
    </View>
  );
};