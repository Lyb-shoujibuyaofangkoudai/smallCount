import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/theme/colors";
import React, { useEffect, useState } from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { DateData, MarkedDates, Theme } from "react-native-calendars/src/types";

LocaleConfig.locales["zh"] = {
  monthNames: [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ],
  monthNamesShort: [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ],
  dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
  today: "今天",
};

LocaleConfig.defaultLocale = "zh";

// 自定义日期组件
const CustomDay = ({
  date,
  state,
  onPress,
  onLongPress,
  theme,
  transactionsData,
  isDark,
}: any) => {
  // 直接使用 state 参数，不维护内部状态，避免状态不同步
  const isSelected = state === "selected";
  
  // 获取主题颜色
  const { theme: currentTheme } = useTheme();

  // 获取某日的支出和收入数据
  const getDayTransactions = (dateString: string) => {
    // 从传入的交易数据中获取指定日期的收支信息
    const dayData = transactionsData?.[dateString];

    if (dayData) {
      return {
        expense: dayData.expense || 0,
        income: dayData.income || 0,
      };
    }

    // 如果没有数据，返回0
    return { expense: 0, income: 0 };
  };

  const { expense, income } = getDayTransactions(date?.dateString || "");

  // 格式化金额显示
  const formatAmount = (amount: number, isExpense: boolean) => {
    
  };

  // 判断背景色逻辑 - 支持亮暗主题和选择状态
  const getBackgroundColor = () => {
    // 选中状态优先级最高
    if (isSelected || state === "selected") {
      return theme?.selectedDayBackgroundColor || currentTheme.colors.primary;
    }

    // 今日状态次之
    if (state === "today") {
      return isDark ? currentTheme.colors.primary + "33" : currentTheme.colors.border; // 深色模式用半透明主题色，浅色模式用边框色
    }

    // 本月日期
    if (state === "normal" || !state) {
      return isDark ? currentTheme.colors.card + "33" : currentTheme.colors.background; // 深色模式用半透明卡片色，浅色模式用背景色
    }

    // 非本月日期（disabled状态或其他）
    return isDark ? currentTheme.colors.card : currentTheme.colors.background; // 深色模式用卡片色，浅色模式用背景色
  };

  // 判断文字颜色 - 支持亮暗主题和选择状态
  const getTextColor = () => {
    // 选中状态文字颜色
    if (isSelected || state === "selected") {
      return theme?.selectedDayTextColor || colors.white;
    }

    // 今日状态文字颜色
    if (state === "today") {
      return isDark ? currentTheme.colors.primary : currentTheme.colors.primary; // 使用主题色
    }

    // 禁用状态文字颜色
    if (state === "disabled") {
      return isDark ? currentTheme.colors.border : currentTheme.colors.border; // 使用边框色
    }

    // 正常状态文字颜色
    return isDark ? currentTheme.colors.text : currentTheme.colors.text; // 使用文字色
  };

  return (
    <TouchableOpacity
      className="relative flex-col items-center py-1"
      style={{
        width: 40,
        backgroundColor: getBackgroundColor(),
        borderRadius: 5,
        opacity: state === "disabled" ? 0.5 : 1,
        borderColor: isSelected ? colors.success[600] : "transparent",
      }}
      onPress={() => {
        // 触发选择事件
        onPress?.(date);
      }}
      onLongPress={() => onLongPress?.(date)}
      disabled={state === "disabled"}
    >
      {isSelected && (
        <View
          className="absolute top-0 left-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.success[600] }}
        />
      )}
      {/* 日期数字 */}
      <Text
        style={{
          color: getTextColor(),
          fontSize: 18,
          fontWeight: state === "today" || isSelected ? "bold" : "normal",
        }}
      >
        {date?.day}
      </Text>

      {/* 收入和支出显示 - 上下结构 */}
      <View style={{ alignItems: "center" }}>
        {/* 收入 */}
        <Text
          style={{
            color: isSelected
              ? colors.white // 选中状态统一使用白色
              : income > 0
              ? currentTheme.colors.secondary // 使用主题的次要色
              : currentTheme.colors.border, // 使用边框色
            fontSize: 8,
            fontWeight: "500",
            marginBottom: 1,
          }}
        >
          {income > 0 ? `+${income.toFixed(2)}` : "+0"}
        </Text>

        {/* 支出 */}
        <Text
          style={{
            color: isSelected
              ? colors.white // 选中状态统一使用白色
              : expense > 0
              ? currentTheme.colors.notification // 使用主题的通知色
              : currentTheme.colors.border, // 使用边框色
            fontSize: 8,
            fontWeight: "500",
          }}
        >
          {expense > 0 ? `-${expense.toFixed(2)}` : "-0"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface CalendarWidgetProps {
  // 自定义交易数据
  transactionsData?: {
    [date: string]: {
      expense: number;
      income: number;
    };
  };

  // 多日期选择相关
  selectedDates?: string[]; // 外部传入的选中日期
  onSelectedDatesChange?: (dates: string[]) => void; // 选中日期变化时的回调

  // Calendar 核心属性
  current?: string;
  initialDate?: string;
  minDate?: string;
  maxDate?: string;
  allowSelectionOutOfRange?: boolean;
  markedDates?: MarkedDates;
  hideExtraDays?: boolean;
  showSixWeeks?: boolean;
  disableMonthChange?: boolean;
  enableSwipeMonths?: boolean;
  disabledByDefault?: boolean;
  disabledByWeekDays?: number[];

  // 样式相关
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  theme?: Theme;
  customHeader?: any;

  // 事件回调
  onDayPress?: (date: DateData) => void;
  onDayLongPress?: (date: DateData) => void;
  onMonthChange?: (date: DateData) => void;
  onVisibleMonthsChange?: (months: DateData[]) => void;

  // 其他
  testID?: string;
}

export default function CalendarWidget({
  transactionsData = {},
  // 多日期选择相关
  selectedDates: externalSelectedDates,
  onSelectedDatesChange,
  // Calendar 默认属性
  current = new Date().toISOString().split("T")[0], // 默认使用当前日期
  initialDate,
  minDate,
  maxDate,
  allowSelectionOutOfRange,
  markedDates,
  hideExtraDays,
  showSixWeeks,
  disableMonthChange,
  enableSwipeMonths = true,
  disabledByDefault,
  disabledByWeekDays,
  style,
  headerStyle,
  theme,
  customHeader,
  onDayPress,
  onDayLongPress,
  onMonthChange,
  onVisibleMonthsChange,
  testID,
}: CalendarWidgetProps) {
  const { isDarkMode, theme: currentTheme } = useTheme();

  // 内部管理选中状态 - 改为支持多日期选择，支持外部控制
  const [internalSelectedDates, setInternalSelectedDates] = useState<
    Set<string>
  >(new Set(externalSelectedDates || []));

  // 使用外部传入的选中日期或内部状态
  const selectedDates = externalSelectedDates
    ? new Set(externalSelectedDates)
    : internalSelectedDates;

  // 更新选中状态的统一方法
  const updateSelectedDates = (newDates: Set<string>) => {
    if (externalSelectedDates !== undefined) {
      // 如果有外部控制，只触发回调
      onSelectedDatesChange?.(Array.from(newDates));
    } else {
      // 否则更新内部状态
      setInternalSelectedDates(newDates);
    }
  };

  // 合并外部传入的 markedDates 和内部选中的日期
  const getMarkedDates = () => {
    const baseMarkedDates = markedDates || {};

    // 如果有选中的日期，添加选中样式
    if (selectedDates.size > 0) {
      const markedDatesWithSelection = { ...baseMarkedDates };

      // 为每个选中的日期添加选中样式
      selectedDates.forEach((dateString) => {
        markedDatesWithSelection[dateString] = {
          selected: true,
          selectedColor: colors.primary[600],
          selectedTextColor: colors.white,
          ...(baseMarkedDates[dateString] || {}),
        };
      });

      return markedDatesWithSelection;
    }

    return baseMarkedDates;
  };

  // 事件处理方法
  const handleDayPress = (date: DateData) => {
    console.log("CalendarWidget: onDayPress triggered", date);

    // 更新选中状态 - 支持多日期选择
    const newSelectedDates = new Set(selectedDates);
    if (newSelectedDates.has(date.dateString)) {
      // 如果已选中，则取消选中
      newSelectedDates.delete(date.dateString);
    } else {
      // 如果未选中，则添加选中
      newSelectedDates.add(date.dateString);
    }

    // 使用统一的更新方法
    updateSelectedDates(newSelectedDates);

    // 触发外部回调
    onDayPress?.(date);
  };

  const handleDayLongPress = (date: DateData) => {
    console.log("CalendarWidget: onDayLongPress triggered", date);
    onDayLongPress?.(date);
  };

  const handleMonthChange = (date: DateData) => {
    console.log("CalendarWidget: onMonthChange triggered", date);
    onMonthChange?.(date);
  };

  const handleVisibleMonthsChange = (months: DateData[]) => {
    console.log("CalendarWidget: onVisibleMonthsChange triggered", months);
    onVisibleMonthsChange?.(months);
  };

  // 创建一个包装组件来传递 transactionsData、主题配置和选中状态
  const DayComponentWithProps = (props: any) => {
    // 检查当前日期是否被选中 - 支持多日期选择
    const isDateSelected = selectedDates.has(props.date?.dateString);

    // 如果选中，修改 state 参数
    const enhancedProps = {
      ...props,
      state: isDateSelected ? "selected" : props.state,
      transactionsData,
      isDarkMode, // 从主组件传递主题状态
    };

    return <CustomDay {...enhancedProps} />;
  };
  // 默认头部样式 - 支持亮暗主题
  const defaultHeaderStyle: StyleProp<ViewStyle> = {
    backgroundColor: currentTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: currentTheme.colors.border,
    paddingBottom: 8,
  };

  // 默认容器样式 - 支持亮暗主题
  const defaultStyle: StyleProp<ViewStyle> = {
    backgroundColor: currentTheme.colors.card,
  };

  // 合并默认主题和传入的主题 - 支持亮暗主题
  const defaultTheme = {
    backgroundColor: currentTheme.colors.card,
    calendarBackground: currentTheme.colors.card,
    textSectionTitleColor: currentTheme.colors.border,
    selectedDayBackgroundColor: currentTheme.colors.primary,
    selectedDayTextColor: colors.white,
    todayTextColor: currentTheme.colors.primary,
    dayTextColor: currentTheme.colors.text,
    textDisabledColor: currentTheme.colors.border,
    arrowColor: currentTheme.colors.text,
    monthTextColor: currentTheme.colors.text,
    textDayFontFamily: "System",
    textMonthFontFamily: "System",
    textDayHeaderFontFamily: "System",
  };

  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey(Date.now());
  }, [isDarkMode]);

  return (
    <Calendar
      // 修复切换主题后theme不生效问题，强制刷新，确保切换主题时会重新生效
      key={key}
      // 基础属性
      current={current}
      initialDate={initialDate}
      minDate={minDate}
      maxDate={maxDate}
      allowSelectionOutOfRange={allowSelectionOutOfRange}
      markedDates={getMarkedDates()}
      hideExtraDays={hideExtraDays}
      showSixWeeks={showSixWeeks}
      disableMonthChange={disableMonthChange}
      enableSwipeMonths={enableSwipeMonths}
      disabledByDefault={disabledByDefault}
      disabledByWeekDays={disabledByWeekDays}
      // 样式属性
      style={style ? [defaultStyle, style] : defaultStyle}
      headerStyle={
        headerStyle ? [defaultHeaderStyle, headerStyle] : defaultHeaderStyle
      }
      theme={theme ? { ...defaultTheme, ...theme } : defaultTheme}
      customHeader={customHeader}
      // 自定义日期组件
      dayComponent={DayComponentWithProps}
      // 事件回调
      onDayPress={handleDayPress}
      onDayLongPress={handleDayLongPress}
      onMonthChange={handleMonthChange}
      onVisibleMonthsChange={handleVisibleMonthsChange}
    />
  );
}
