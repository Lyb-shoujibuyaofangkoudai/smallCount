import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

export interface SwipeAction {
  label: string;
  onPress: () => void;
  className?: string; // 背景颜色等 Tailwind 类
  textClassName?: string; // 文字样式 Tailwind 类
  width?: number; // 按钮宽度，默认 80
}

interface Props {
  children: React.ReactNode;
  actions?: SwipeAction[];
  threshold?: number;
  style?: any; // 支持自定义样式
  className?: string; // 支持Tailwind CSS类名
}

// 单个按钮组件
const ActionButton = ({
  action,
  index,
  progress,
  totalCount,
}: {
  action: SwipeAction;
  index: number;
  progress: SharedValue<number>;
  totalCount: number;
}) => {
  const btnWidth = action.width || 80;
  
  // 使用 Reanimated 实现视差动画
  const animatedStyle = useAnimatedStyle(() => {
    // 这里的 progress.value 是从 0 (关闭) 到 1 (打开)
    const trans = interpolate(
      progress.value,
      [0, 1],
      [btnWidth * (totalCount - index), 0]
    );

    return {
      transform: [{ translateX: trans }],
    };
  });

  return (
    <Reanimated.View style={[{ width: btnWidth }, animatedStyle]}>
      {/* 
        修复点：使用 TouchableOpacity 替代 RectButton
        NativeWind 自动支持 React Native 原生组件的 className
      */}
      <TouchableOpacity
        activeOpacity={0.7}
        className={`flex-1 justify-center items-center ${action.className || 'bg-gray-400'}`}
        onPress={action.onPress}
      >
        <Text className={`text-base font-medium ${action.textClassName || 'text-white'}`}>
          {action.label}
        </Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const SwipeableRow: React.FC<Props> = ({ children, actions = [], threshold = 60, style, className }) => {
  // 注意：ReanimatedSwipeable 的 ref 类型定义比较宽泛，这里用 any 或者查阅特定类型
  const swipeableRef = useRef<any>(null);

  const close = () => {
    swipeableRef.current?.close();
  };

  // renderRightActions 接收 SharedValue
  const renderRightActions = (
    progress: SharedValue<number>, 
    _drag: SharedValue<number>
  ) => {
    if (actions.length === 0) return null;

    return (
      <View className="flex-row h-full rounded-lg">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            action={{
              ...action,
              onPress: () => {
                close();
                action.onPress();
              }
            }}
            index={index}
            progress={progress}
            totalCount={actions.length}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={style} className={className}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        enableTrackpadTwoFingerGesture // 支持 Web 触摸板
        rightThreshold={threshold}
        renderRightActions={renderRightActions}
        overshootRight={false} // 禁止右侧拉过头
        containerStyle={{ overflow: 'visible' }} // 修复 Web 端可能的裁剪问题
      >
        {children}
      </Swipeable>
    </View>
  );
};

export default SwipeableRow;