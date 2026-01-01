import { CategoryDonutChart } from "@/components/biz/charts/CategoryDonutChart";
import { TrendChart } from "@/components/biz/charts/TrendChart";
import MonthPickerModal from "@/components/widgets/MonthSelect";
import { SegmentedControl } from "@/components/widgets/SegmentedControl";
import useDataStore from "@/storage/store/useDataStore";
import { useStatsStore } from "@/storage/store/useStatsStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function StatsScreen() {
  const [monthPickerVisible, setMonthPickerVisible] = React.useState(false);

  const { activeAccountId } = useDataStore((state) => state);
  const { filter, chartData, isLoading, setFilter, loadStatsData, comparisonData } = useStatsStore();

  // 转换索引和值
  const periodValues = ["week", "month"] as const;
  const typeValues = ["expense", "income"] as const;

  const periodIndex = periodValues.indexOf(filter.period);
  const typeIndex = typeValues.indexOf(filter.type);
  const currentData = chartData[filter.type];
  const isExpense = filter.type === "expense";

  // 组件加载时加载数据
  useFocusEffect(() => {
    loadStatsData(activeAccountId, filter);
  });

  // 当filter改变时重新加载数据
  useEffect(() => {
    loadStatsData(activeAccountId, filter);
  }, [filter]);

  // 月份选择弹窗处理函数
    const handleMonthSelect = (year: number, month: number) => {
      // 更新filter保留原有设置，只修改年月
      setFilter({ year, month });
      // 关闭弹窗
      setMonthPickerVisible(false);
      // 确保activeAccountId存在再加载数据
      if (activeAccountId) {
        // 传入正确的参数调用loadStatsData
        loadStatsData(activeAccountId, {
          ...filter,
          year,
          month,
          // 确保使用当前选中的类型
          type: filter.type
        });
      }
    };

  const handleOpenMonthPicker = () => {
    setMonthPickerVisible(true);
  };

  // 处理周期切换
  const handlePeriodChange = (index: number) => {
    setFilter({ period: periodValues[index] });
  };

  // 处理类型切换
  const handleTypeChange = (index: number) => {
    setFilter({ type: typeValues[index] });
  };

  return (
    <View className="flex-1 bg-background pt-12">
      {/* 头部控制区 */}
      <View className="flex-row justify-between items-center mb-6 px-4">
        {/* 周期切换 Segment */}
        <View className="w-32">
          <SegmentedControl
            values={["每周", "每月"]}
            selectedIndex={periodIndex}
            onChange={handlePeriodChange}
            containerClassName="h-9"
          />
        </View>

        {/* 日期选择区域 */}
        <TouchableOpacity
          onPress={handleOpenMonthPicker}
          className="w-32 h-9 bg-card rounded-lg flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-text dark:text-white">
            {filter.year}年{filter.month}月
          </Text>
          <Text className="ml-1 text-gray-500 dark:text-gray-400 text-xs">
            ▼
          </Text>
        </TouchableOpacity>

        {/* 收支切换 Pills */}
        <View className="w-32">
          <SegmentedControl
            values={["支出", "收入"]}
            selectedIndex={typeIndex}
            onChange={handleTypeChange}
            containerClassName="h-9"
          />
        </View>
      </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-2 text-gray-500">加载中...</Text>
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 总览卡片 */}
        <View className="items-center mb-6">
          <Text className="text-gray-500 text-xs mb-1">
            {filter.period === "month" ? `${filter.year}年` : filter.period === "week" ? `${filter.year}年${filter.month}月` : ""}总{isExpense ? "支出" : "收入"}
          </Text>
          <Text className="text-text text-3xl font-bold mb-1">
            ¥{currentData.total || "0.00"}
          </Text>
          <View className="flex-row items-center bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs">
            <Text className={`text-[10px] mr-1 ${comparisonData && comparisonData.percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {comparisonData ? (
                comparisonData.percentageChange > 0 ? 
                  `▲ ${Math.abs(comparisonData.percentageChange).toFixed(2)}%` : 
                  `▼ ${Math.abs(comparisonData.percentageChange).toFixed(2)}%`
              ) : '▲ 0%'}
            </Text>
            <Text className="text-gray-500 text-[10px]">
              {
                filter.period === "week" ? "对比上月" : filter.period === "month" ? "对比上年" : ""
              }
            </Text>
          </View>
        </View>

        {/* 1. 趋势图表 */}
        <TrendChart
          color={currentData.color || (isExpense ? "#10b981" : "#f59e0b")}
          data={currentData.data} // 暂时使用默认数据，直到store提供实际数据
          title={filter.period === "week" 
            ? `${filter.month}月周${isExpense ? "支出" : "收入"}趋势` 
            : `${filter.year}年每月总${isExpense ? "支出" : "收入"}趋势`
          }
          height={200}
        />

        {/* 2. 圆环结构图 */}
        {currentData.donut.length > 0 ? (
          <CategoryDonutChart data={currentData.donut} />
        ) : (
          <View className="w-full bg-card rounded-2xl p-4 mb-4 shadow-sm items-center justify-center py-8">
            <Text className="text-gray-400 text-sm">暂无{isExpense ? "支出" : "收入"}分类数据</Text>
          </View>
        )}

        {/* 3. 排行榜列表 */}
        <Text className="text-gray-500 font-bold text-sm mb-3 pl-1">
          {isExpense ? "支出排行榜" : "收入来源"}
        </Text>

        <View className="bg-card rounded-2xl overflow-hidden shadow-sm">
          {currentData.ranking.length ? (
            currentData.ranking.map((item, index) => (
              <View
                key={index}
                className={`p-4 flex-row items-center border-b border-gray-100 dark:border-gray-800 ${
                  index === currentData.ranking.length - 1 ? "border-b-0" : ""
                }`}
              >
                <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3">
                   <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>

                <View className="flex-1 mr-3">
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-text font-medium text-sm">
                      {item.name}
                    </Text>
                    <Text className="text-text font-semibold text-sm">
                      {item.percent}%
                    </Text>
                  </View>
                  <View className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <View
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-full"
                    />
                  </View>
                </View>

                <Text className="text-text font-semibold text-base">
                  {item.amount}
                </Text>
              </View>
            ))
          ) : (
            <View className="p-4 flex-row items-center">
              <Text className="text-text font-medium text-sm">暂无数据</Text>
            </View>
          )}
        </View>
      </ScrollView>
      )}
      
      {/* 月份选择弹窗 */}
      <MonthPickerModal
        visible={monthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        onConfirm={handleMonthSelect}
        initialYear={filter.year}
        initialMonth={filter.month}
      />
    </View>
  );
}
