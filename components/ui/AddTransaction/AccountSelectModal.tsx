import { CURRENCIES } from '@/constants/data';
import { useTheme } from '@/context/ThemeContext';
import { Account } from '@/db/repositories/AccountRepository';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

interface AccountSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (account: Account) => void;
  selectedId?: string; // 当前选中的账户ID
  data?: Account[]; // 账户数据
}

const AccountSelectModal: React.FC<AccountSelectModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedId,
  data = []
}) => {
  const {
    theme
  } = useTheme()
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 获取账户类型对应的图标
  const getAccountIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'cash':
        return 'cash-outline' as keyof typeof Ionicons.glyphMap;
      case 'bank':
        return 'business-outline' as keyof typeof Ionicons.glyphMap;
      case 'credit_card':
        return 'card-outline' as keyof typeof Ionicons.glyphMap;
      case 'digital_wallet':
        return 'phone-portrait-outline' as keyof typeof Ionicons.glyphMap;
      case 'investment':
        return 'trending-up-outline' as keyof typeof Ionicons.glyphMap;
      case 'loan':
        return 'loan-outline' as keyof typeof Ionicons.glyphMap;
      default:
        return 'wallet-outline' as keyof typeof Ionicons.glyphMap;
    }
  };

  // 获取账户类型的中文名称
  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'cash':
        return '现金';
      case 'bank':
        return '银行账户';
      case 'credit_card':
        return '信用卡';
      case 'digital_wallet':
        return '数字钱包';
      case 'investment':
        return '投资账户';
      case 'loan':
        return '贷款账户';
      default:
        return '其他账户';
    }
  };

  // 渲染单个列表项
  const renderItem = ({ item }: { item: Account }) => {
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
        <View className="flex-row items-center flex-1 mr-4">
          {/* 图标容器：增加背景色让图标更突出 */}
          <View className={`
            w-10 h-10 rounded-full items-center justify-center mr-4 
            ${isSelected ? 'bg-blue-100 dark:bg-slate-600' : 'bg-gray-100 dark:bg-slate-700'}
          `}>
            <Ionicons 
              name={getAccountIcon(item.type)} 
              size={22} 
              color={theme.colors.primary} 
            />
          </View>
          
          {/* 账户信息 */}
          <View className="flex-1">
            {/* 账户名称 */}
            <Text className={`text-base ${textColorClass}`}>
              {item.name}
            </Text>
            {/* 账户类型和余额 */}
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                总资产：{item?.currency && CURRENCIES[item.currency as keyof typeof CURRENCIES]?.char || '￥'}{item.balance || '0.00'}
              </Text>
            </View>
          </View>
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
        <View className="bg-card dark:bg-card-dark w-full rounded-t-3xl shadow-2xl h-[65%]" style={{
            backgroundColor: theme.colors.card
        }}>
          
          {/* 顶部把手区域 */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 opacity-80" />
            
            <View className="w-full flex-row justify-between items-center px-5 border-b border-gray-100 dark:border-slate-700 pb-3">
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                选择账户
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </Pressable>
            </View>
          </View>

          {/* 列表区域 */}
          {data.length > 0 ? (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="wallet-outline" size={48} color={theme.colors.border} />
              <Text className="text-lg text-muted dark:text-muted-dark mt-4">
                暂无账户
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                请先添加账户
              </Text>
            </View>
          )}
        </View>
        
        {/* 底部安全区填充 */}
        <SafeAreaView className="bg-card dark:bg-card-dark" />
      </View>
    </Modal>
  );
};

export default AccountSelectModal;