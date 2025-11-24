import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SegmentedControl } from "../widgets/SegmentedControl";

interface DashboardHeaderProps {
  selectedDate: Date;
  onDatePress: () => void;
  activeTab: 'calendar' | 'details';
  onTabChange: (tab: 'calendar' | 'details') => void;
}

export default function DashboardHeader({ 
  selectedDate, 
  onDatePress, 
  activeTab, 
  onTabChange 
}: DashboardHeaderProps) {
  // 格式化日期显示
  const formatDate = selectedDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  // Tab选项 - 使用普通数组而不是只读数组
  const tabValues = ['details', 'calendar'];
  const tabLabels = ['明细列表', '日历视图'];
  
  // 获取当前选中的索引
  const selectedIndex = tabValues.indexOf(activeTab);

  // Tab切换处理
  const handleTabChange = (index: number) => {
    onTabChange(tabValues[index] as 'calendar' | 'details');
  };

  // 自定义渲染Tab项
  const renderTabItem = (item: string, isActive: boolean, index: number) => (
    <Text className={`text-sm font-semibold ${
      isActive
        ? 'text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400'
    }`}>
      {tabLabels[index]}
    </Text>
  );

  return (
    <View className="py-2">
      {/* 头部 */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center">
          {/* 日期选择器 */}
          <TouchableOpacity 
            onPress={onDatePress}
            className="flex-row items-center"
          >
            <Text className="text-xl font-bold text-black dark:text-charcoal-100 mr-2">
              {formatDate}
            </Text>
            {/* 下拉箭头图标 */}
            <Text className="text-black dark:text-charcoal-100 text-sm">
              ▼
            </Text>
          </TouchableOpacity>

          {/* 搜索图标 */}
          <TouchableOpacity className="p-2">
            <Text className="text-black dark:text-charcoal-100 text-lg">
              🔍
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab切换栏 */}
      <View className="px-4">
        <SegmentedControl
          values={tabValues}
          selectedIndex={selectedIndex}
          onChange={handleTabChange}
          renderItem={renderTabItem}
          containerStyle={{
            borderRadius: 10,
            height: 50,
          }}
        />
      </View>
    </View>
  );
}