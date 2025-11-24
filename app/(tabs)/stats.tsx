// import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardHeader from "@/components/ui/DashboardHeader";
import React, { useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsPage() {
  // 状态管理
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'details'>('details');

  // 日期选择处理
  const handleDatePress = () => {
    // 这里可以添加日期选择器的逻辑
    console.log('打开日期选择器');
  };

  // Tab切换处理
  const handleTabChange = (tab: 'calendar' | 'details') => {
    setActiveTab(tab);
    console.log('切换到标签:', tab);
  };

  return (
    <SafeAreaView className="flex-1">
      <DashboardHeader
        selectedDate={selectedDate}
        onDatePress={handleDatePress}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <Text className="text-2xl font-bold text-blue-900 p-4">统计页面</Text>
      <Text className="p-4">当前选中的标签: {activeTab}</Text>
      <Text className="p-4">当前日期: {selectedDate.toLocaleDateString('zh-CN')}</Text>
    </SafeAreaView>
  );
}
