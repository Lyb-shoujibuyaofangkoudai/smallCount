// components/AddTransaction/CategoryGrid.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  selectedId: string;
  onSelect: (item: CategoryItem) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, selectedId, onSelect }) => {
  const renderItem = ({ item }: { item: CategoryItem }) => {
    const isSelected = selectedId === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => onSelect(item)}
        className="w-[20%] items-center mb-6 gap-2"
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center transition-all ${
            isSelected ? 'bg-primary/20 border-2 border-primary' : 'bg-card'
          }`}
          style={isSelected ? { backgroundColor: 'var(--color-background)' } : {}} // Fallback logic if needed
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={isSelected ? 'var(--color-primary)' : 'var(--color-text)'}
          />
        </View>
        <Text className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-textSecondary'}`}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background border-t border-border px-2 pt-4">
      <Text className="text-xs text-textSecondary px-4 mb-4">选择分类</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};