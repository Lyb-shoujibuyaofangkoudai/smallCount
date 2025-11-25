import { PAYMENT_METHODS } from '@/constants/data';
import { PaymentMethod } from '@/constants/type';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons'; // 替换为 Ionicons
import React from 'react';
import { FlatList, Modal, Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";



interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  selectedId?: string; // 当前选中的支付方式ID
  data?: PaymentMethod[];
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedId,
  data = PAYMENT_METHODS
}) => {
    const {
        theme
    } = useTheme()
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 渲染单个列表项
  const renderItem = ({ item }: { item: PaymentMethod }) => {
    const isSelected = selectedId === item.id;
    
      
    // 选中时文字用 primary，未选中跟随主题
    const textColorClass = isSelected
      ? 'text-primary font-bold'
      : 'text-cardForeground dark:text-cardForeground-dark font-medium';

    return (
      <Pressable
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        className={`
          flex-row items-center justify-between p-4 rounded-xl mb-2
          active:bg-gray-100 dark:active:bg-slate-700
          ${isSelected ? 'bg-blue-50 dark:bg-slate-700/60' : ''}
        `}
      >
        <View className="flex-row items-center">
          {/* 图标容器：增加背景色让图标更突出 */}
          <View className={`
            w-10 h-10 rounded-full items-center justify-center mr-4 
            ${isSelected ? 'bg-blue-100 dark:bg-slate-600' : 'bg-gray-100 dark:bg-slate-700'}
          `}>
            <Ionicons 
              name={item.icon} 
              size={22} 
              color={theme.colors.primary} 
            />
          </View>
          
          {/* 支付名称 */}
          <Text className={`text-base ${textColorClass}`}>
            {item.name}
          </Text>
        </View>

        {/* 选中状态打钩 (Ionicons) */}
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide" // 从底部滑入
      onRequestClose={onClose}
    >
      {/* 背景遮罩 */}
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        {/* 内容区域 */}
        <View className="bg-card dark:bg-card-dark w-full rounded-t-3xl shadow-2xl h-[55%]" style={{
            backgroundColor: theme.colors.card
        }}>
          
          {/* 顶部把手区域 */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 opacity-80" />
            
            <View className="w-full flex-row justify-between items-center px-5 border-b border-gray-100 dark:border-slate-700 pb-3">
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                选择支付方式
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </Pressable>
            </View>
          </View>

          {/* 列表区域 */}
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
        
        {/* 底部安全区填充 */}
        <SafeAreaView className="bg-card dark:bg-card-dark" />
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;