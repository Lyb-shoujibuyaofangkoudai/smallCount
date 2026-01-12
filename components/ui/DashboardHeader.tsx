import React, { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SegmentedControl } from "../widgets/SegmentedControl";

interface DashboardHeaderProps {
  selectedDate: Date;
  onDatePress: () => void;
  activeTab: 'calendar' | 'details';
  onTabChange: (tab: 'calendar' | 'details') => void;
  onViewCurrentMonth?: () => void;
  isViewingCurrentMonth?: boolean;
}

export default function DashboardHeader({ 
  selectedDate, 
  onDatePress, 
  activeTab, 
  onTabChange,
  onViewCurrentMonth,
  isViewingCurrentMonth = false
}: DashboardHeaderProps) {
  const [isPressed, setIsPressed] = useState(false);

  const formatDate = selectedDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  const tabValues = ['details', 'calendar'];
  const tabLabels = ['明细列表', '日历视图'];
  
  const selectedIndex = tabValues.indexOf(activeTab);

  const handleTabChange = (index: number) => {
    onTabChange(tabValues[index] as 'calendar' | 'details');
  };

  const renderTabItem = (item: string, isActive: boolean, index: number) => (
    <Text className={`text-sm font-semibold ${
      isActive
        ? 'text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400'
    }`}>
      {tabLabels[index]}
    </Text>
  );

  const handleViewCurrentMonth = useCallback(() => {
    onViewCurrentMonth?.();
  }, [onViewCurrentMonth]);

  const isCurrentMonth = useCallback(() => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() && 
           selectedDate.getMonth() === now.getMonth();
  }, [selectedDate]);

  const getMonthButtonStyle = () => {
    if (isViewingCurrentMonth) {
      return 'bg-primary/10 dark:bg-primary/20';
    }
    return 'bg-transparent';
  };

  const getMonthTextStyle = () => {
    if (isViewingCurrentMonth) {
      return 'text-primary dark:text-primary-light';
    }
    return 'text-text dark:text-charcoal-100';
  };

  return (
    <View className="py-2">
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={onDatePress}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="text-xl font-bold text-black dark:text-charcoal-100 mr-2">
              {formatDate}
            </Text>
            <Text className="text-black dark:text-charcoal-100 text-sm">
              ▼
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`px-4 py-2 rounded-lg ${getMonthButtonStyle()}`}
            onPress={handleViewCurrentMonth}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            activeOpacity={0.7}
          >
            <Text className={`text-lg font-bold ${getMonthTextStyle()}`}>
              本月
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