import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

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
  // 使用Reanimated共享值来控制滑块位置
  const sliderPosition = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // 格式化日期显示
  const formatDate = selectedDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  // 滑块动画样式
  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderPosition.value }],
    };
  });

  // 监听activeTab变化，更新滑块位置
  useEffect(() => {
    if (containerWidth > 0) {
      // 计算每个按钮的宽度（容器宽度减去padding）
      const buttonWidth = (containerWidth - 8) / 2; // 8是容器的padding
      const targetPosition = activeTab === 'details' ? 4 : buttonWidth + 4;
      sliderPosition.value = withTiming(targetPosition, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [activeTab, containerWidth]);

  return (
    <>
      {/* 头部 */}
      <View
        className="px-6 py-4 bg-transparent"
      >
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
      <View className="px-2 bg-transparent">
        <View 
          className="flex-row items-center justify-between bg-gray-200 dark:bg-charcoal-800 rounded-lg py-3 px-1 relative"
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >
          {/* 滑块背景 - 根据平台使用不同的动画方案 */}
          {Platform.OS === 'web' ? (
            <View 
              className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-white dark:bg-charcoal-900 shadow-sm transition-all duration-300 ease-in-out ${
                activeTab === 'details' ? 'left-1' : 'left-[calc(50%-4px)]'
              }`}
            />
          ) : (
            <Animated.View 
              style={sliderStyle}
              className="absolute top-1 bottom-1 w-1/2 rounded-md bg-white dark:bg-charcoal-900 shadow-sm"
            />
          )}
          <TouchableOpacity
            onPress={() => onTabChange('details')}
            className="flex-1 py-2 px-4 rounded-md items-center z-10"
          >
            <Text className={`text-sm font-semibold ${
              activeTab === 'details'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              明细列表
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onTabChange('calendar')}
            className="flex-1 py-2 px-4 rounded-md items-center z-10"
          >
            <Text className={`text-sm font-semibold ${
              activeTab === 'calendar'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              日历视图
            </Text>
          </TouchableOpacity>
          
          
        </View>
      </View>
    </>
  );
}