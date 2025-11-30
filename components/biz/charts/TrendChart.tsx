import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface TrendChartProps {
  color: string;
  linePath: string;
  areaPath: string;
  labels: string[];
}

export const TrendChart = ({ color, linePath, areaPath, labels }: TrendChartProps) => {
  return (
    <View className="w-full bg-card rounded-2xl p-4 mb-4 shadow-sm">
      <Text className="text-text font-bold text-sm mb-4 pl-1">每日趋势</Text>
      
      {/* 图表容器 */}
      <View className="h-44 w-full">
        <Svg height="100%" width="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.3" />
              <Stop offset="1" stopColor={color} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* 填充区域 */}
          <Path 
            d={areaPath} 
            fill="url(#chartGradient)" 
            opacity={1} 
          />
          
          {/* 线条 */}
          <Path 
            d={linePath} 
            stroke={color} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </Svg>

        {/* X轴标签 */}
        <View className="flex-row justify-between px-2 -mt-4">
          {labels.map((label, index) => (
            <Text key={index} className="text-gray-400 text-[10px]">
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};