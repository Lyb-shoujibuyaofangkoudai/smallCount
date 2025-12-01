import React from 'react';
import { View } from 'react-native';
import { TrendChart } from './TrendChart';

// 示例数据
const exampleData1 = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  yAxis: [120, 190, 300, 500, 200, 300]
};

const exampleData2 = {
  xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  yAxis: [65, 59, 80, 81, 56, 55, 40]
};

export const TrendChartExample = () => {
  return (
    <View className="p-4">
      {/* 示例1：月度趋势 */}
      <TrendChart 
        color="#4F46E5" 
        data={exampleData1}
        title="月度支出趋势"
        height={200}
      />
      
      {/* 示例2：周度趋势 */}
      <TrendChart 
        color="#10B981" 
        data={exampleData2}
        title="周度收入趋势"
        height={150}
      />
      
      {/* 示例3：空数据 */}
      <TrendChart 
        color="#EF4444" 
        data={{xAxis: [], yAxis: []}}
        title="暂无数据"
      />
    </View>
  );
};