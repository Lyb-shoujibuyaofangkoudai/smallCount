1. 配置 Tailwind 以使用 CSS 变量
首先，你需要修改 tailwind.config.js。不要直接写死颜色（如 #000），而是让 Tailwind 引用 CSS 变量。
注意：为了支持 Tailwind 的透明度修饰符（如 bg-primary/50），建议变量存储 RGB 通道值（不带 rgb() 括号），或者如果不需要透明度支持，直接存储 Hex 字符串。这里为了简单通用，我们使用直接引用变量的方式。
tailwind.config.js
```JavaScript
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 定义语义化的颜色名称，指向 CSS 变量
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        text: 'var(--color-text)',
        border: 'var(--color-border)',
        notification: 'var(--color-notification)',
        // 你可以添加更多自定义颜色
        secondary: 'var(--color-secondary)',
      },
    },
  },
  plugins: [],
};
```

2. 定义你的多主题配置
创建一个文件来定义你的主题调色板。为了兼容 React Navigation，我们需要确保涵盖它所需的基础颜色。
src/theme/themes.ts

```TypeScript
export type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset';

// 定义与 React Navigation 结构兼容的颜色
// 同时添加我们自定义的 Tailwind 颜色
export const themes = {
  light: {
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#F2F2F2',
      card: '#FFFFFF',
      text: '#1C1C1E',
      border: '#D8D8D8',
      notification: '#FF3B30',
      secondary: '#5AC8FA', // 自定义颜色
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#0A84FF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#272729',
      notification: '#FF453A',
      secondary: '#64D2FF',
    },
  },
  ocean: {
    dark: true,
    colors: {
      primary: '#00ADB5',
      background: '#222831',
      card: '#393E46',
      text: '#EEEEEE',
      border: '#393E46',
      notification: '#00ADB5',
      secondary: '#00FFF5',
    },
  },
  sunset: {
    dark: false,
    colors: {
      primary: '#FF5722',
      background: '#FFF3E0',
      card: '#FFFFFF',
      text: '#BF360C',
      border: '#FFCCBC',
      notification: '#FF7043',
      secondary: '#FFAB91',
    },
  },
};
```
3. 创建主题上下文 (Theme Context)
我们需要一个 Context 来管理当前选中的主题，并提供切换方法。
src/context/ThemeContext.tsx

```TypeScript
import React, { createContext, useContext, useState, useMemo } from 'react';
import { themes, ThemeName } from '../theme/themes';

type ThemeContextType = {
  themeName: ThemeName;
  theme: typeof themes['light']; // 当前主题对象
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');

  const theme = useMemo(() => themes[themeName], [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, theme, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

4. 核心集成：连接 NativeWind 和 React Navigation
这是最关键的一步。我们需要创建一个包装组件，它既负责给 React Navigation 传递 theme 对象，又负责给 NativeWind (Tailwind) 注入 CSS 变量。
src/navigation/RootNavigator.tsx (或者你的 App 入口文件)

```TypeScript
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { vars } from 'nativewind'; // NativeWind 提供的变量注入工具
import { useTheme } from '../context/ThemeContext';

// 假设你有具体的导航栈
import { MainStack } from './MainStack'; 

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
      <NavigationContainer theme={navTheme}>
        <MainStack />
      </NavigationContainer>
    </View>
  );
};
```

5. 在 App.tsx 中包裹 Provider
App.tsx
```TypeScript
import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
```

6. 在组件中使用 (使用效果)
现在，你可以在组件中直接使用 Tailwind 类名，它们会根据当前主题自动变色。同时，React Navigation 的 Header 和 TabBar 也会自动变色。
src/screens/HomeScreen.tsx
```TypeScript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const HomeScreen = () => {
  const { setTheme, themeName } = useTheme();

  return (
    // bg-background 和 text-text 会自动映射到当前 CSS 变量
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-text text-2xl font-bold mb-4">
        当前主题: {themeName.toUpperCase()}
      </Text>
      
      <View className="p-4 bg-card rounded-lg border border-border mb-4">
        <Text className="text-primary">这是一张卡片 (bg-card)</Text>
        <Text className="text-secondary mt-2">二级颜色文本 (text-secondary)</Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded"
          onPress={() => setTheme('light')}
        >
          <Text className="text-white">Light</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-gray-800 px-4 py-2 rounded"
          onPress={() => setTheme('dark')}
        >
          <Text className="text-white">Dark</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-teal-600 px-4 py-2 rounded"
          onPress={() => setTheme('ocean')}
        >
          <Text className="text-white">Ocean</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-orange-500 px-4 py-2 rounded"
          onPress={() => setTheme('sunset')}
        >
          <Text className="text-white">Sunset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```