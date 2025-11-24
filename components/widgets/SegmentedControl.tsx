// components/ui/SegmentedControl.tsx
import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useState } from 'react';
import {
    LayoutChangeEvent,
    Platform,
    Pressable,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface SegmentedControlProps<T = string> {
  values: T[];
  selectedIndex: number;
  onChange: (index: number) => void;
  renderItem?: (item: T, isActive: boolean, index: number) => React.ReactNode;
  containerStyle?: ViewStyle;
}

export const SegmentedControl = <T extends any>({
  values,
  selectedIndex,
  onChange,
  renderItem,
  containerStyle,
}: SegmentedControlProps<T>) => {
    const { isDarkMode,theme } = useTheme();
    console.log('theme', theme);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const tabWidth = containerWidth / values.length;

  const springConfig = {
    damping: 25,
    stiffness: 150,
    mass: 0.5,
    overshootClamping: true,
  };

  useEffect(() => {
    if (containerWidth > 0) {
      const targetX = selectedIndex * tabWidth;
      translateX.value = withSpring(targetX, springConfig);
    }
  }, [selectedIndex, containerWidth, tabWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
      // 立即设置初始位置，而不是等待动画
      translateX.value = selectedIndex * (width / values.length);
    }
  };

  // 关键修复 1: 显式指定 left, top, height, width 等布局属性
  // 确保在 Web 端动画样式能正确覆盖 DOM 默认行为
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth > 0 ? tabWidth - 4 : 0, // padding total 4px
    position: 'absolute', // 强制声明 absolute
    left: 2, // 对应 p-0.5 (2px)
    top: 2,  // 对应 p-0.5 (2px)
    bottom: 2, // 对应 p-0.5 (2px)
    opacity: containerWidth > 0 ? 1 : 0, // 修复：容器宽度为0时隐藏滑块
  }));

  return (
    <View
      // 关键修复 2: 容器强制 relative，确保 absolute 子元素相对于此容器定位
      className="flex-row bg-gray-200 dark:bg-charcoal-800 h-10 rounded-xl w-full"
      style={[{ position: 'relative', padding: 2 }, containerStyle]}
      onLayout={handleLayout}
    >
      {/* 背景滑块 (Indicator) */}
      {/* 修复：始终渲染滑块，但通过opacity控制显示 */}
      <Animated.View
        className="bg-white dark:bg-charcoal-900 rounded-[10px] shadow-sm"
        style={[
          animatedStyle,
          // Web 端特有样式修复
          Platform.OS === 'web' && { 
            boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
            zIndex: 1, // 确保在背景之上，但在文字之下
            backgroundColor: isDarkMode ? theme.baseColors.charcoal[900] : theme.baseColors.white, // 背景透明，文字可见
            borderRadius: 10, 
          },
        ]}
      />

      {/* 选项层 (Tabs) */}
      {values.map((item, index) => {
        const isActive = selectedIndex === index;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(index)}
            className="flex-1 basis-0 items-center justify-center z-10"
            style={Platform.OS === 'web' ? { cursor: 'pointer', userSelect: 'none' } : undefined}
          >
            {renderItem ? (
              renderItem(item, isActive, index)
            ) : (
              <Text
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-text dark:text-white font-semibold'
                    : 'text-textSecondary dark:text-neutral-400'
                }`}
                numberOfLines={1}
              >
                {item as string}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};