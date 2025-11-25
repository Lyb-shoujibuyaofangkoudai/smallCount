import { DatabaseProvider } from "@/context/DbContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Theme as NavigationTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { vars } from "nativewind"; // NativeWind 提供的变量注入工具
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
        fontFamily: "System",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "800" as const,
      },
    },
  };

  // 2. 构建传递给 NativeWind 的 CSS 变量对象
  // 键名必须与 tailwind.config.js 中 var(--xxx) 对应
  const nativeWindVars = vars({
    "--color-primary": theme.colors.primary,
    "--color-background": theme.colors.background,
    "--color-card": theme.colors.card,
    "--color-text": theme.colors.text,
    "--color-text-secondary": theme.colors.textSecondary,
    "--color-border": theme.colors.border,
    "--color-notification": theme.colors.notification,
    "--color-secondary": theme.colors.secondary,
    "--color-success": theme.colors.success,
    "--color-warning": theme.colors.warning,
  });


  return (
    // style={nativeWindVars} 将变量注入到根节点，所有子组件的 Tailwind 类都能读取到
    <GestureHandlerRootView className="bg-gray-200 dark:bg-black">
      {/* 注意 taiwindcss这块的变量样式不要放在第三方组件中，否则可能会导致样式失效 */}
      <View style={[nativeWindVars, { flex: 1 }]}>
        <ThemeProvider value={navTheme}>
          <DatabaseProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal", headerShown: false }}
              />
            </Stack>
          </DatabaseProvider>
        </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
};
