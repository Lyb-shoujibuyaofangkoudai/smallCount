import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (year: number, month: number) => void;
  onRangeConfirm?: (startYear: number, startMonth: number, endYear: number, endMonth: number) => void;
  initialYear?: number;
  initialMonth?: number;
  initialStartYear?: number;
  initialStartMonth?: number;
  initialEndYear?: number;
  initialEndMonth?: number;
  minDate?: string;
  maxDate?: string;
  enableRangeSelection?: boolean;
}

const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onRangeConfirm,
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth() + 1,
  initialStartYear,
  initialStartMonth,
  initialEndYear,
  initialEndMonth,
  minDate,
  maxDate,
  enableRangeSelection = false,
}) => {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  
  // 新增：视图模式 'month' | 'year'
  const [mode, setMode] = useState<'month' | 'year'>('month');
  
  // 新增：年份选择网格的基准年份（用于分页，每次显示12个年份）
  const [yearBasis, setYearBasis] = useState(initialYear);
  
  // 新增：范围选择相关状态
  const [rangeSelectionStep, setRangeSelectionStep] = useState<'start' | 'end'>('start');
  const [startYear, setStartYear] = useState(initialStartYear || initialYear);
  const [startMonth, setStartMonth] = useState(initialStartMonth || initialMonth);
  const [endYear, setEndYear] = useState(initialEndYear || initialYear);
  const [endMonth, setEndMonth] = useState(initialEndMonth || initialMonth);

  // 获取主题颜色
  const getThemeColors = () => {
    const isDark = theme.dark || false;
    return {
      primary: theme.colors.primary || '#10b981',
      textMain: isDark ? theme.colors.text || '#f8fafc' : theme.colors.text || '#1f2937',
      textOnPrimary: '#ffffff',
      bgCard: isDark ? theme.colors.card || '#1e293b' : theme.colors.background || '#ffffff',
      border: isDark ? theme.colors.border || '#374151' : theme.colors.border || '#e5e7eb',
      bgOverlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      bgModal: isDark ? theme.colors.card || '#1e293b' : theme.colors.background || '#ffffff',
      bgHeader: isDark ? theme.colors.card || '#374151' : theme.colors.background || '#f3f4f6',
      textSecondary: isDark ? theme.colors.textSecondary || '#9ca3af' : theme.colors.textSecondary || '#6b7280',
      bgRangeStart: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
      bgRangeEnd: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
      bgRangeMiddle: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    };
  };

  const themeColors = getThemeColors();

  // 当弹窗显示时，重置状态
  useEffect(() => {
    if (visible) {
      setSelectedYear(initialYear);
      setSelectedMonth(initialMonth);
      setMode('month'); // 默认重置回月份模式
      // 计算基准年份，使当前选中的年份处于网格较中间的位置
      // 这里算法是：找到当前年份所属的12年区间的起始位置
      setYearBasis(Math.floor(initialYear / 12) * 12);
      
      // 如果是范围选择模式，初始化范围选择状态
      if (enableRangeSelection) {
        setRangeSelectionStep('start');
        if (initialStartYear && initialStartMonth) {
          setStartYear(initialStartYear);
          setStartMonth(initialStartMonth);
          setSelectedYear(initialStartYear);
          setSelectedMonth(initialStartMonth);
        }
        if (initialEndYear && initialEndMonth) {
          setEndYear(initialEndYear);
          setEndMonth(initialEndMonth);
        }
      }
    }
  }, [visible, initialYear, initialMonth, initialStartYear, initialStartMonth, initialEndYear, initialEndMonth, enableRangeSelection]);

  // 解析日期限制
  const parseDateLimit = (dateString?: string) => {
    if (!dateString) return null;
    const [year, month] = dateString.split('-').map(Number);
    return { year, month };
  };

  const minDateObj = parseDateLimit(minDate);
  const maxDateObj = parseDateLimit(maxDate);

  // 检查月份是否在允许范围内
  const isMonthAllowed = (year: number, month: number) => {
    if (minDateObj) {
      if (year < minDateObj.year) return false;
      if (year === minDateObj.year && month < minDateObj.month) return false;
    }
    if (maxDateObj) {
      if (year > maxDateObj.year) return false;
      if (year === maxDateObj.year && month > maxDateObj.month) return false;
    }
    return true;
  };

  // 检查年份是否在允许范围内
  const isYearAllowed = (year: number) => {
    if (minDateObj && year < minDateObj.year) return false;
    if (maxDateObj && year > maxDateObj.year) return false;
    return true;
  };

  // 生成月份数据 (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 生成年份数据 (12个)
  const yearsGrid = Array.from({ length: 12 }, (_, i) => yearBasis + i);

  // 检查日期是否在范围内
  const isDateInRange = (year: number, month: number) => {
    if (!enableRangeSelection) return false;
    
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);
    const currentDate = new Date(year, month - 1);
    
    return currentDate >= startDate && currentDate <= endDate;
  };

  // 检查日期是否是范围开始
  const isDateRangeStart = (year: number, month: number) => {
    return enableRangeSelection && year === startYear && month === startMonth;
  };

  // 检查日期是否是范围结束
  const isDateRangeEnd = (year: number, month: number) => {
    return enableRangeSelection && year === endYear && month === endMonth;
  };

  // --- 逻辑处理 ---

  // 头部左侧按钮点击
  const handleHeaderPrev = () => {
    if (mode === 'month') {
      const newYear = selectedYear - 1;
      if (!minDateObj || newYear >= minDateObj.year) {
        setSelectedYear(newYear);
        // 修复：切换年份时，检查新年份中当前选中的月份是否可用
        if (minDateObj && newYear === minDateObj.year && selectedMonth < minDateObj.month) {
          setSelectedMonth(minDateObj.month);
        }
        // 同时检查新年份的最大可用月份
        if (maxDateObj && newYear === maxDateObj.year && selectedMonth > maxDateObj.month) {
          setSelectedMonth(maxDateObj.month);
        }
      }
    } else {
      const newYearBasis = yearBasis - 12;
      if (!minDateObj || newYearBasis + 11 >= minDateObj.year) {
        setYearBasis(newYearBasis); // 年份模式下，向前翻12年
      }
    }
  };

  // 头部右侧按钮点击
  const handleHeaderNext = () => {
    if (mode === 'month') {
      const newYear = selectedYear + 1;
      if (!maxDateObj || newYear <= maxDateObj.year) {
        setSelectedYear(newYear);
        // 修复：切换年份时，检查新年份中当前选中的月份是否可用
        if (maxDateObj && newYear === maxDateObj.year && selectedMonth > maxDateObj.month) {
          setSelectedMonth(maxDateObj.month);
        }
        // 同时检查新年份的最小可用月份
        if (minDateObj && newYear === minDateObj.year && selectedMonth < minDateObj.month) {
          setSelectedMonth(minDateObj.month);
        }
      }
    } else {
      const newYearBasis = yearBasis + 12;
      if (!maxDateObj || newYearBasis <= maxDateObj.year) {
        setYearBasis(newYearBasis); // 年份模式下，向后翻12年
      }
    }
  };

  // 点击中间标题：切换模式
  const handleTitleClick = () => {
    if (mode === 'month') {
      // 切换到年份模式时，更新基准年份，确保当前选中的年份在视野内
      setYearBasis(Math.floor(selectedYear / 12) * 12);
      setMode('year');
    } else {
      setMode('month');
    }
  };

  // 选中具体年份
  const handleYearSelect = (year: number) => {
    if (isYearAllowed(year)) {
      setSelectedYear(year);
      // 修复：选择年份时，确保选中的月份在新年份中是可用的
      let updatedMonth = selectedMonth;
      // 检查新年份的最小可用月份
      if (minDateObj && year === minDateObj.year && updatedMonth < minDateObj.month) {
        updatedMonth = minDateObj.month;
      }
      // 检查新年份的最大可用月份
      if (maxDateObj && year === maxDateObj.year && updatedMonth > maxDateObj.month) {
        updatedMonth = maxDateObj.month;
      }
      setSelectedMonth(updatedMonth);
      setMode('month'); // 选中后自动切回月份选择
    }
  };

  // 检查左侧按钮是否可用
  const isPrevButtonEnabled = () => {
    if (mode === 'month') {
      return !minDateObj || selectedYear - 1 >= minDateObj.year;
    } else {
      return !minDateObj || yearBasis - 12 + 11 >= minDateObj.year;
    }
  };

  // 检查右侧按钮是否可用
  const isNextButtonEnabled = () => {
    if (mode === 'month') {
      return !maxDateObj || selectedYear + 1 <= maxDateObj.year;
    } else {
      return !maxDateObj || yearBasis + 12 <= maxDateObj.year;
    }
  };

  // 处理月份选择
  const handleMonthSelect = (month: number) => {
    if (!isMonthAllowed(selectedYear, month)) return;
    
    if (enableRangeSelection) {
      if (rangeSelectionStep === 'start') {
        setStartYear(selectedYear);
        setStartMonth(month);
        setSelectedYear(selectedYear);
        setSelectedMonth(month);
        setRangeSelectionStep('end');
      } else {
        // 确保结束日期不早于开始日期
        const startDate = new Date(startYear, startMonth - 1);
        const potentialEndDate = new Date(selectedYear, month - 1);
        
        if (potentialEndDate >= startDate) {
          setEndYear(selectedYear);
          setEndMonth(month);
          setSelectedYear(selectedYear);
          setSelectedMonth(month);
        } else {
          // 如果选择的结束日期早于开始日期，则交换它们
          setEndYear(startYear);
          setEndMonth(startMonth);
          setStartYear(selectedYear);
          setStartMonth(month);
          setSelectedYear(selectedYear);
          setSelectedMonth(month);
        }
      }
    } else {
      setSelectedMonth(month);
    }
  };

  // 确认选择
  const handleConfirm = () => {
    if (enableRangeSelection) {
      if (onRangeConfirm) {
        onRangeConfirm(startYear, startMonth, endYear, endMonth);
      }
    } else {
      if (onConfirm) {
        onConfirm(selectedYear, selectedMonth);
      }
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end" style={{ backgroundColor: themeColors.bgOverlay }}>
          <TouchableWithoutFeedback>
            <View className="rounded-t-xl pb-safe w-full" style={{ backgroundColor: themeColors.bgModal }}>
              <View className="p-6">
                
                {/* 1. 顶部操作栏 (取消/标题/确定) */}
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity onPress={onClose} hitSlop={10}>
                    <Text className="text-base text-gray-500 dark:text-gray-400">取消</Text>
                  </TouchableOpacity>
                  
                  <Text className="text-lg font-semibold" style={{ color: themeColors.textMain }}>
                    {enableRangeSelection 
                      ? (rangeSelectionStep === 'start' ? '选择开始月份' : '选择结束月份')
                      : (mode === 'month' ? '选择月份' : '选择年份')
                    }
                  </Text>
                  
                  <TouchableOpacity onPress={handleConfirm} hitSlop={10}>
                    <Text 
                      className="text-base font-semibold" 
                      style={{ color: themeColors.primary }}
                    >
                      确定
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 范围选择模式下显示已选择的范围 */}
                {enableRangeSelection && (
                  <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: themeColors.bgHeader }}>
                    <Text className="text-center" style={{ color: themeColors.textMain }}>
                      已选择范围: {startYear}-{startMonth.toString().padStart(2, '0')} 至 {endYear}-{endMonth.toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}

                {/* 2. 中间导航栏 (上一个/显示区/下一个) */}
                <View className="flex-row justify-between items-center mb-6 px-4">
                  <TouchableOpacity 
                    onPress={isPrevButtonEnabled() ? handleHeaderPrev : undefined}
                    className="p-2"
                    hitSlop={10}
                    disabled={!isPrevButtonEnabled()}
                  >
                    <Text className={isPrevButtonEnabled() ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}>
                       ◀
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleTitleClick} activeOpacity={0.7}>
                    <View className="flex-row items-center px-3 py-1 rounded-lg" style={{ backgroundColor: themeColors.bgHeader }}>
                      <Text className="text-xl font-semibold" style={{ color: mode === 'year' ? themeColors.primary : themeColors.textMain }}>
                        {mode === 'month' 
                          ? `${selectedYear}年` 
                          : `${yearBasis} - ${yearBasis + 11}`}
                      </Text>
                      {/* 如果在月份模式，加个小图标提示可点击 */}
                      {mode === 'month' && (
                        <Text className="text-md ml-1 text-gray-500 dark:text-gray-400">▼</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={isNextButtonEnabled() ? handleHeaderNext : undefined}
                    className="p-2"
                    hitSlop={10}
                    disabled={!isNextButtonEnabled()}
                  >
                    <Text className={isNextButtonEnabled() ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}>
                      ▶
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3. 网格区域 (根据模式渲染不同内容) */}
                <View className="flex-row flex-wrap justify-between h-[240px]"> 
                  {/* 设置固定高度防止切换时弹窗跳动，4行 * (48+12) ≈ 240 */}
                  
                  {mode === 'month' ? (
                    // --- 月份渲染 ---
                    months.map((month) => {
                      const isSelected = month === selectedMonth;
                      const isDisabled = !isMonthAllowed(selectedYear, month);
                      
                      // 范围选择相关的样式状态
                      const isRangeStart = isDateRangeStart(selectedYear, month);
                      const isRangeEnd = isDateRangeEnd(selectedYear, month);
                      const isInRange = isDateInRange(selectedYear, month);
                      
                      return (
                        <TouchableOpacity
                          key={month}
                          onPress={() => !isDisabled && handleMonthSelect(month)}
                          className="w-[31%] mb-3 py-3 rounded-xl border items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? themeColors.primary : 
                              isRangeStart ? themeColors.bgRangeStart :
                              isRangeEnd ? themeColors.bgRangeEnd :
                              isInRange ? themeColors.bgRangeMiddle :
                              isDisabled ? themeColors.bgHeader : themeColors.bgCard,
                            borderColor: isSelected ? themeColors.primary : 
                              isRangeStart || isRangeEnd ? themeColors.primary :
                              isDisabled ? themeColors.border : themeColors.border,
                            opacity: isDisabled ? 0.5 : 1,
                            borderWidth: isRangeStart || isRangeEnd ? 2 : 1,
                          }}
                          disabled={isDisabled}
                        >
                          <Text
                            className="text-base font-medium"
                            style={{
                              color: isSelected ? themeColors.textOnPrimary : 
                                isRangeStart || isRangeEnd ? themeColors.primary :
                                isDisabled ? themeColors.textSecondary : themeColors.textMain,
                            }}
                          >
                            {month}月
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    // --- 年份渲染 ---
                    yearsGrid.map((year) => {
                      const isSelected = year === selectedYear;
                      const isDisabled = !isYearAllowed(year);
                      return (
                        <TouchableOpacity
                          key={year}
                          onPress={() => handleYearSelect(year)}
                          className="w-[31%] mb-3 py-3 rounded-xl border items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? themeColors.primary : 
                              isDisabled ? themeColors.bgHeader : themeColors.bgCard,
                            borderColor: isSelected ? themeColors.primary : 
                              isDisabled ? themeColors.border : themeColors.border,
                            opacity: isDisabled ? 0.5 : 1,
                          }}
                          disabled={isDisabled}
                        >
                          <Text
                            className="text-base font-medium"
                            style={{
                              color: isSelected ? themeColors.textOnPrimary : 
                                isDisabled ? themeColors.textSecondary : themeColors.textMain,
                            }}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
              
              <View className="h-6" style={{ backgroundColor: themeColors.bgModal }} /> 
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MonthPickerModal;