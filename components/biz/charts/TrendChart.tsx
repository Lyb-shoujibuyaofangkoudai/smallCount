import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface TrendChartProps {
  color: string;
  data: {
    xAxis: string[];
    yAxis: number[];
  };
  title?: string;
  height?: number;
}

export const TrendChart = ({ 
  color, 
  data, 
  title = "每日趋势",
  height = 176
}: TrendChartProps) => {
  const { xAxis, yAxis } = data;
  
  // 计算图表数据
  const calculateChartPaths = () => {
    if (!yAxis.length) return { linePath: '', areaPath: '' };
    
    const chartWidth = 300;
    const chartHeight = 100;
    const padding = 10;
    const effectiveWidth = chartWidth - padding * 2;
    const effectiveHeight = chartHeight - padding * 2;
    
    const maxValue = Math.max(...yAxis);
    const minValue = Math.min(...yAxis);
    const valueRange = maxValue - minValue || 1;
    
    const points = yAxis.map((value, index) => {
      const x = padding + (index / (yAxis.length - 1)) * effectiveWidth;
      const y = chartHeight - padding - ((value - minValue) / valueRange) * effectiveHeight;
      return { x, y };
    });
    
    // 生成线条路径
    const linePath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
    ).join(' ');
    
    // 生成区域路径（闭合路径）
    const areaPath = [
      `M${points[0].x},${chartHeight - padding}`,
      ...points.map(point => `L${point.x},${point.y}`),
      `L${points[points.length - 1].x},${chartHeight - padding}`,
      'Z'
    ].join(' ');
    
    return { linePath, areaPath };
  };
  
  const { linePath, areaPath } = calculateChartPaths();
  
  return (
    <View className="w-full bg-card rounded-2xl p-4 mb-4 shadow-sm">
      <Text className="text-text font-bold text-sm mb-4 pl-1">{title}</Text>
      
      {/* 图表容器 */}
      <View style={{ height: height }} className="w-full">
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
          
          {/* 数据点 */}
          {yAxis.map((value, index) => {
            const x = 10 + (index / (yAxis.length - 1)) * 280;
            const y = 100 - 10 - ((value - Math.min(...yAxis)) / (Math.max(...yAxis) - Math.min(...yAxis) || 1)) * 80;
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </Svg>

        {/* 数据点数值显示 */}
        <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {yAxis.map((value, index) => {
            const xPercent = index / (yAxis.length - 1);
            const xPosition = xPercent * 100;
            const y = 100 - 10 - ((value - Math.min(...yAxis)) / (Math.max(...yAxis) - Math.min(...yAxis) || 1)) * 80;
            const yPosition = (y / 100) * 100;
            
            return (
              <View
                key={index}
                className="absolute items-center"
                style={{
                  left: `${xPosition}%`,
                  top: `${yPosition - 15}%`,
                  transform: [{ translateX: -20 }]
                }}
              >
                <View className="bg-gray-800 rounded px-2 py-1">
                  <Text className="text-white text-xs font-medium">
                    {value}
                  </Text>
                </View>
                <View 
                  className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"
                  style={{ marginTop: -1 }}
                />
              </View>
            );
          })}
        </View>

        {/* X轴标签 */}
        <View className="flex-row justify-between px-2 -mt-4">
          {xAxis.map((label, index) => (
            <Text key={index} className="text-gray-400 text-[10px]">
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};