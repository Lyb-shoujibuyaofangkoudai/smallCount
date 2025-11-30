import { CategoryDonutChart } from '@/components/biz/charts/CategoryDonutChart';
import { TrendChart } from '@/components/biz/charts/TrendChart';
import { SegmentedControl } from '@/components/widgets/SegmentedControl';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';



// ----------------------------------------------------------------------
// 数据 (保持不变)
// ----------------------------------------------------------------------
const CHART_DATA = {
  expense: {
    total: '¥ 5,823.40',
    color: '#10b981', // Green
    linePath: 'M0,80 Q30,70 60,40 T120,50 T180,30 T240,60 T300,40',
    areaPath: 'M0,80 Q30,70 60,40 T120,50 T180,30 T240,60 T300,40 V100 H0 Z',
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
    linePath: 'M0,60 Q40,50 80,30 T160,20 T240,40 T300,10',
    areaPath: 'M0,60 Q40,50 80,30 T160,20 T240,40 T300,10 V100 H0 Z',
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

  const periodValues = ['week', 'month', 'year'] as const;
  const typeValues = ['expense', 'income'] as const;
  
  const period = periodValues[periodIndex];
  const type = typeValues[typeIndex];
  const currentData = CHART_DATA[type];
  const isExpense = type === 'expense';

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
          <View className="w-48">
            <SegmentedControl
              values={['周', '月', '年']}
              selectedIndex={periodIndex}
              onChange={setPeriodIndex}
              containerClassName="h-9"
            />
          </View>

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
            11月 总{isExpense ? '支出' : '收入'}
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
          linePath={currentData.linePath}
          areaPath={currentData.areaPath}
          labels={['1日', '7日', '14日', '21日', '28日']}
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
    </View>
  );
}