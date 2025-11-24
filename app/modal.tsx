// app/add-transaction.tsx (或者你的页面路径)
import { AmountDisplay } from '@/components/ui/AddTransaction/AmountDisplay';
import { CategoryGrid } from '@/components/ui/AddTransaction/CategoryGrid';
import { Header } from '@/components/ui/AddTransaction/Header';
import { NumberPad } from '@/components/ui/AddTransaction/NumberPad';
import { Toolbar } from '@/components/ui/AddTransaction/Toolbar';
import { expenses, incomes } from '@/constants/data';
import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTransactionScreen() {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(expenses[0]);

  // 根据类型切换显示的数据源
  const currentCategories = type === 'income' ? incomes : expenses;

  // 处理数字键盘输入
  const handlePressNum = (num: string) => {
    // 防止多个小数点
    if (num === '.' && amount.includes('.')) return;
    // 限制小数点后两位
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    console.log('Submitted:', {
      type,
      category: selectedCategory.name,
      amount: parseFloat(amount || '0'),
      date: new Date(),
    });
    // 这里添加导航返回或保存逻辑
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Header */}
      <Header 
        currentType={type} 
        onChangeType={(newType) => {
          setType(newType);
          // 切换类型时重置选中分类为该类型的第一个
          setSelectedCategory(newType === 'income' ? incomes[0] : expenses[0]);
        }}
        onCancel={() => console.log('Close Modal')}
      />

      {/* 2. Amount Display */}
      <AmountDisplay
        amount={amount}
        categoryName={selectedCategory.name}
        categoryIcon={selectedCategory.icon}
        categoryColor={selectedCategory.color}
        accountName="微信零钱" 
      />

      {/* 分割线 */}
      <View className="h-[1px] bg-border mx-6" />

      {/* 3. Category Grid (Scrollable Area) */}
      <CategoryGrid 
        categories={currentCategories}
        selectedId={selectedCategory.id}
        onSelect={setSelectedCategory}
      />

      {/* 4. Toolbar */}
      <Toolbar dateStr="11月20日" />

      {/* 5. Number Pad (Fixed at bottom) */}
      <View className="pb-safe">
        <NumberPad 
          onPressNum={handlePressNum} 
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}