import { CategoryDonutChart } from '@/components/biz/charts/CategoryDonutChart';
import { TrendChart } from '@/components/biz/charts/TrendChart';
import MonthPickerModal from '@/components/widgets/MonthSelect';
import { SegmentedControl } from '@/components/widgets/SegmentedControl';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const WEEK_DATE = {
  xAxis:['1日', '7日', '14日', '21日', '28日'],
  yAxis: [1200, 1800, 1500, 2200, 1100],
}

const MONTH_DATE = {
  xAxis:['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'],
  yAxis: [1200, 1800, 1500, 2200, 1100,200.34,300.5,400.7, 22,],
}

const YEAR_DATE = {
  xAxis:['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  yAxis: [0,0,100,300,1200, 1800, 1500, 2200, 1100,200.34,300.5,400.7],
}

// ----------------------------------------------------------------------
// 数据 (保持不变)
// ----------------------------------------------------------------------
const CHART_DATA = {
  expense: {
    total: '¥ 5,823.40',
    color: '#10b981', // Green
    data: {
      xAxis: ['1日', '7日', '14日', '21日', '28日'],
      yAxis: [1200, 1800, 1500, 2200, 1100]
    },
    ranking: [
      { icon: '🏠', name: '房租房贷', percent: 35, amount: '3,500', color: '#1f2937' },
      { icon: '🍜', name: '餐饮美食', percent: 20, amount: '2,000', color: '#10b981' },
      { icon: '🛒', name: '购物消费', percent: 15, amount: '1,500', color: '#f59e0b' },
    ],
    donut: [
      { color: '#1f2937', percentage: 35, label: '房租' },
      { color: '#10b981', percentage: 20, label: '餐饮' },
      { color: '#f59e0b', percentage: 15, label: '购物' },
      { color: '#3b82f6', percentage: 10, label: '交通' },
      { color: '#e5e7eb', percentage: 20, label: '其他' },
    ],
  },
  income: {
    total: '¥ 12,500.00',
    color: '#f59e0b', // Orange
    data: {
      xAxis: ['1日', '7日', '14日', '21日', '28日'],
      yAxis: [3000, 2500, 4000, 2000, 1000]
    },
    ranking: [
      { icon: '💰', name: '工资收入', percent: 80, amount: '10,000', color: '#f59e0b' },
      { icon: '💵', name: '兼职外快', percent: 20, amount: '2,500', color: '#8b5cf6' },
    ],
    donut: [
      { color: '#f59e0b', percentage: 80, label: '工资' },
      { color: '#8b5cf6', percentage: 20, label: '兼职' },
    ],
  },
};

// ----------------------------------------------------------------------
// 主页面
// ----------------------------------------------------------------------
export default function StatsScreen() {
  const [periodIndex, setPeriodIndex] = useState<number>(1); // month
  const [typeIndex, setTypeIndex] = useState<number>(0); // expense
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  
  // 月份选择状态
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const periodValues = ['week', 'month', 'year'] as const;
  const typeValues = ['expense', 'income'] as const;
  
  const period = periodValues[periodIndex];
  const type = typeValues[typeIndex];
  const currentData = CHART_DATA[type];
  const isExpense = type === 'expense';

  // 月份选择弹窗处理函数
  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setMonthPickerVisible(false);
  };

  const handleOpenMonthPicker = () => {
    setMonthPickerVisible(true);
  };

  return (
    <View className="flex-1 bg-background pt-12">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 头部控制区 */}
        <View className="flex-row justify-between items-center mb-6">
          {/* 周期切换 Segment */}
          <View className="w-32">
            <SegmentedControl
              values={['月', '年']}
              selectedIndex={periodIndex}
              onChange={setPeriodIndex}
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
              {selectedYear}年{selectedMonth}月
            </Text>
            <Text className="ml-1 text-gray-500 dark:text-gray-400 text-xs">▼</Text>
          </TouchableOpacity>

          {/* 收支切换 Pills */}
          <View className="w-32">
            <SegmentedControl
              values={['支出', '收入']}
              selectedIndex={typeIndex}
              onChange={setTypeIndex}
              containerClassName="h-9"
            />
          </View>
        </View>

        {/* 总览卡片 */}
        <View className="items-center mb-6">
          <Text className="text-gray-500 text-xs mb-1">
            {selectedMonth}月 总{isExpense ? '支出' : '收入'}
          </Text>
          <Text className="text-text text-3xl font-bold mb-1">
            {currentData.total}
          </Text>
          <View className="flex-row items-center bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs">
            <Text className="text-red-500 text-[10px] mr-1">▲ 12%</Text>
            <Text className="text-gray-500 text-[10px]">对比上月</Text>
          </View>
        </View>

        {/* 1. 趋势图表 */}
        <TrendChart
          color={currentData.color}
          data={currentData.data}
          title={`${selectedMonth}月${isExpense ? '支出' : '收入'}趋势`}
          height={200}
        />

        {/* 2. 圆环结构图 */}
        <CategoryDonutChart data={currentData.donut} />

        {/* 3. 排行榜列表 */}
        <Text className="text-gray-500 font-bold text-sm mb-3 pl-1">
          {isExpense ? '支出排行榜' : '收入来源'}
        </Text>

        <View className="bg-card rounded-2xl overflow-hidden shadow-sm">
          {currentData.ranking.map((item, index) => (
            <View
              key={index}
              className={`p-4 flex-row items-center border-b border-gray-100 dark:border-gray-800 ${
                index === currentData.ranking.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3">
                <Text className="text-lg">{item.icon}</Text>
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
          ))}
        </View>
      </ScrollView>

      {/* 月份选择弹窗 */}
      <MonthPickerModal
        visible={monthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        onConfirm={handleMonthSelect}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
      />
    </View>
  );
}