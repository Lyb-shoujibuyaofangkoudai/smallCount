import { useShadowStyle } from '@/hooks/use-shadow';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  shadowSize?: 'small' | 'medium' | 'large';
}

export default function Card({ className, children, style, shadowSize = 'medium' }: CardProps) {
  const { isDarkMode } = useTheme();
  const shadowStyles = useShadowStyle(isDarkMode, shadowSize);

  return (
    <View 
      className={`bg-white dark:bg-charcoal-950 rounded-xl p-4 ${className}`}
      style={[shadowStyles.shadow, style]}
    >
      {children}
    </View>
  );
}