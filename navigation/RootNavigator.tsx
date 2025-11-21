import { useTheme } from '@/context/ThemeContext';
import { Theme as NavigationTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { vars } from 'nativewind'; // NativeWind 提供的变量注入工具
import React from 'react';
import { View } from 'react-native';

export const RootNavigator = () => {
  const { theme } = useTheme();

  // 1. 构建 React Navigation 需要的主题对象
  const navTheme: NavigationTheme = {
    dark: theme.dark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800' as const,
      },
    },
  };

  // 2. 构建传递给 NativeWind 的 CSS 变量对象
  // 键名必须与 tailwind.config.js 中 var(--xxx) 对应
  const nativeWindVars = vars({
    '--color-primary': theme.colors.primary,
    '--color-background': theme.colors.background,
    '--color-card': theme.colors.card,
    '--color-text': theme.colors.text,
    '--color-border': theme.colors.border,
    '--color-notification': theme.colors.notification,
    '--color-secondary': theme.colors.secondary,
  });

  return (
    // style={nativeWindVars} 将变量注入到根节点，所有子组件的 Tailwind 类都能读取到
    <View style={[nativeWindVars, { flex: 1 }]}>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </ThemeProvider>
    </View>
  );
};