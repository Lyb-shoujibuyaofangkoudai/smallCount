// components/AddTransaction/Header.tsx
import { SegmentedControl } from "@/components/widgets/SegmentedControl";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type TransactionType = "expense" | "income";

interface HeaderProps {
  onCancel: () => void;
  currentType: TransactionType;
  onChangeType: (type: TransactionType) => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onCancel,
  currentType,
  onChangeType,
  title
}) => {
  const types: TransactionType[] = ["expense", "income"];
  const labels = ["支出", "收入"];
  const { theme } = useTheme();
  const currentIndex = types.indexOf(currentType);

  const handleChange = (index: number) => {
    onChangeType(types[index]);
  };

  return (
    <View>
      {/* 第一行：顶部导航栏 (取消按钮) */}
      {/* 使用 pt-safe 确保在刘海屏下位置正确，若未配置 SafeAreaView 可用 pt-12 */}
      <View className="flex-row items-center justify-between px-4 mb-4 pt-2">
        <TouchableOpacity
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>

        {/* 标题 (可选) */}
        <Text className="text-text font-semibold text-base">{title || '记一笔'}</Text>

        {/* 右侧占位，保持标题居中 */}
        <View className="w-8" />
      </View>

      {/* 第二行：滑块组件 */}
      <View className="px-8">
        <SegmentedControl
          values={labels}
          selectedIndex={currentIndex}
          onChange={handleChange}
          containerStyle={{ backgroundColor: theme.colors.background }}
        />
      </View>
    </View>
  );
};
