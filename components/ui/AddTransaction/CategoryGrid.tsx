import { useTheme } from '@/context/ThemeContext';
import { NewTag } from '@/db/repositories/TagRepository';
import { addAlphaToColor } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { CategoryManageModal } from './CategoryManageModal'; // 引入新组件

interface CategoryGridProps {
  categories: NewTag[];
  selectedId: string;
  onSelect: (item: NewTag) => void;
  // 新增：用于更新父组件数据的回调
  onUpdateCategories: (newCategories: NewTag[]) => void;
  // 新增：当前是支出还是收入，传给 Manager 用于新建
  currentType: NewTag["type"] & string; // 'expense' | 'income'
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
    categories, 
    selectedId, 
    onSelect,
    onUpdateCategories,
    currentType
}) => {
  const [isManageModalVisible, setManageModalVisible] = useState(false);
  const { theme } = useTheme();

  // 渲染单个分类项
  const renderItem = ({ item }: { item: NewTag }) => {
    const isSelected = selectedId === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => onSelect(item)}
        className="items-center mb-6 gap-2"
        style={{ width: '20%' }}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isSelected ? '' : 'bg-card'
          }`}
          style={isSelected ? { 
            backgroundColor: addAlphaToColor(theme.colors.primary, 0.1),
            borderColor: theme.colors.primary,
            borderWidth: 2,
          } : { 
            backgroundColor: theme.colors.card
          }} 
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={item.color as string}
          />
        </View>
        <Text 
            numberOfLines={1}
            className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-textSecondary'}`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
        <View className="flex-1 border-t border-border px-2 pt-4">
          {/* 标题行：选择分类 + 设置按钮 */}
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-xs text-textSecondary">选择分类</Text>
            <TouchableOpacity
              onPress={() => setManageModalVisible(true)}
              className="flex-row items-center gap-1"
            >
              <Ionicons name="settings-sharp" size={16} color={theme.colors.textSecondary} />
              <Text className="text-xs text-textSecondary">管理</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: 20,
              flexGrow: 1,
            }}
          />
        </View>

        {/* 管理模态框 */}
        <CategoryManageModal 
            visible={isManageModalVisible}
            onClose={() => setManageModalVisible(false)}
            categories={categories}
            currentType={currentType}
            onUpdateCategories={onUpdateCategories}
        />
    </>
  );
};