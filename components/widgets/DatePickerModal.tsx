import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
// 引入类型定义
import { MarkedDates } from 'react-native-calendars/src/types';

// --- 1. 本地化配置 ---
LocaleConfig.locales['zh'] = {
  monthNames: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh';

// --- 2. 颜色定义已移至主题系统 ---

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  currentDate?: string;
  minDate?: string;
  maxDate?: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  currentDate,
  minDate,
  maxDate,
}) => {
  // 获取系统深色模式状态
  const { theme } = useTheme();
  const isDark = theme.dark;

  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    if (currentDate) {
      setSelectedDay(currentDate);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDay(today);
    }
  }, [currentDate, visible]);

  const handleDayPress = (day: DateData) => {
    setSelectedDay(day.dateString);
  };

  const handleConfirm = () => {
    onConfirm(selectedDay);
    onClose();
  };

  // --- 修复1: 使用 useMemo 生成 markedDates 并指定类型 ---
  const markedDates: MarkedDates = useMemo(() => {
    return {
      [selectedDay]: {
        selected: true,
        disableTouchEvent: true,
        // 修复: 移除 selectedDotColor，如果不需要圆点仅需背景色即可。
        // 如果需要自定义选中背景色，可以使用 selectedColor: COLORS.primary
      },
    };
  }, [selectedDay]);

  // --- 修复2: 动态生成 Calendar 主题 ---
  // Calendar 组件不支持 className，必须传 HEX
  const calendarTheme = {
    backgroundColor: theme.colors.card,
    calendarBackground: theme.colors.card,
    textSectionTitleColor: theme.colors.textSecondary,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: '#ffffff',
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.text,
    textDisabledColor: theme.colors.textSecondary,
    dotColor: theme.colors.primary,
    selectedDotColor: '#ffffff',
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.text,
    indicatorColor: theme.colors.primary,
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '300' as const, // TS 强类型修正
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '300' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        {/* 
          容器样式：
          bg-white dark:bg-slate-800 -> 适配深色背景
        */}
        <View className="bg-white dark:bg-slate-800 w-full rounded-t-3xl pb-8 pt-4 shadow-2xl"
        style={{
          backgroundColor: theme.colors.card,
        }}>
          
          {/* 头部 */}
          <View className="flex-row justify-between items-center px-5 mb-4">
            {/* 左侧占位，保持布局平衡 */}
            <View className="w-6" />
            
            {/* 标题居中显示 */}
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1 text-center">
              选择日期
            </Text>
            
            {/* 右侧关闭按钮使用Ionicons */}
            <TouchableOpacity onPress={onClose} className="w-6 h-6 items-center justify-center">
              <Ionicons 
                name="close-outline" 
                size={24} 
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* 日历 */}
          <Calendar
            // 强制刷新 key，确保主题切换时组件重绘（可选，视 RN 版本而定）
            key={theme.dark ? 'dark' : 'light'}
            current={selectedDay}
            minDate={minDate}
            maxDate={maxDate}
            onDayPress={handleDayPress}
            enableSwipeMonths={true}
            markedDates={markedDates}
            theme={calendarTheme}
            style={{
                borderRadius: 10,
                height: 350,
                // 确保容器背景也是动态的
                backgroundColor: theme.colors.card 
            }}
          />

          {/* 按钮 */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-primary py-3 rounded-xl items-center active:opacity-80"
              style={{
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text className="text-white text-lg font-bold">
                确认选择
              </Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;