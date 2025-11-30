import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DonutData {
  color: string;
  percentage: number; // 0-100
  label: string;
}

interface CategoryDonutChartProps {
  data: DonutData[];
}

export const CategoryDonutChart = ({ data }: CategoryDonutChartProps) => {
  const radius = 50;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + strokeWidth;
  
  let currentAngle = 0;

  return (
    <View className="w-full bg-card rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-text font-bold text-sm pl-1">分类构成</Text>
        <Text className="text-primary text-xs">查看全部 {'>'}</Text>
      </View>

      <View className="flex-row items-center">
        {/* 左侧圆环 */}
        <View className="w-[120px] h-[120px] items-center justify-center">
          <Svg width={halfCircle * 2} height={halfCircle * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
            <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
              {/* 背景圆 */}
              <Circle
                cx={halfCircle}
                cy={halfCircle}
                r={radius}
                stroke="#e5e7eb" // 默认灰色底
                strokeWidth={strokeWidth}
                fill="none"
              />
              
              {/* 数据段 */}
              {data.map((item, index) => {
                const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                const angle = currentAngle;
                currentAngle += (item.percentage / 100) * 360;

                return (
                  <Circle
                    key={index}
                    cx={halfCircle}
                    cy={halfCircle}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    rotation={angle}
                    origin={`${halfCircle}, ${halfCircle}`}
                    strokeLinecap="butt"
                  />
                );
              })}
            </G>
          </Svg>
          
          {/* 中间文字 */}
          <View className="absolute items-center justify-center">
            <Text className="text-text font-bold text-lg">Top 5</Text>
            <Text className="text-gray-400 text-[10px]">类别</Text>
          </View>
        </View>

        {/* 右侧图例 */}
        <View className="flex-1 pl-6">
          <View className="flex-row flex-wrap gap-y-3">
            {data.map((item, index) => (
              <View key={index} className="w-[48%] flex-row items-center mr-1">
                <View 
                  style={{ backgroundColor: item.color }} 
                  className="w-2 h-2 rounded-full mr-2" 
                />
                <Text className="text-gray-500 text-xs">
                  {item.label} {item.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};