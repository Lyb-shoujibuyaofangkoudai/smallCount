# Expo App nativewind实现主题色系统并兼容expo-navigator

### expo项目使用nativewind实现

## 1. 下载依赖 
参考链接：[nativewind 安装](https://www.nativewind.dev/docs/getting-started/installationo)
- 安装依赖
```bash
npm install nativewind react-native-reanimated@~3.17.4 react-native-safe-area-context@5.4.0
npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
```

## 2. 配置tailwind.config.js
```javascript
import { baseColors } from "./theme/colors";
/** @type {import('tailwindcss').Config} */
module.exports = {
    // 定义tailwindcss的内容范围，包括组件和应用的所有文件
  content: ["./components/**/*.{js,ts,tsx}", "./app/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 定义语义化的颜色名称，指向 CSS 变量
        primary: "var(--color-primary)",
        background: "var(--color-background)",
        card: "var(--color-card)",
        text: "var(--color-text)",
        border: "var(--color-border)",
        notification: "var(--color-notification)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        // 自定义颜色
        secondary: "var(--color-secondary)",
        // 向后兼容的颜色别名
        "bg-primary": "var(--color-primary)",
        "bg-secondary": "var(--color-secondary)",
        "text-primary": "var(--color-text)",
        "text-secondary": "var(--color-secondary)",
        ...baseColors,
      },
    },
  },
  plugins: [],
};

```

## 3. 配置 babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
      // react-native-reanimated 插件 - 必须放在其他插件之前
      'react-native-reanimated/plugin',
      // 路径别名配置（可选但推荐）需要下载对应插件
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ]
    ],
  };
};
```

## 4. 配置 metro.config.js
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

// 注意这里的global.css文件的路径
module.exports = withNativeWind(config, { input: './global.css' })
```

## 5. 定义全局css文件 global.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 6. 配置app.json
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

## 7. 如果是typescript项目，需要在根目录下创建nativewind-env.d.ts
```ts
/// <reference types="nativewind/types" />
```

## 8. 定义主题颜色
colors.js
```typescript
// 主题类型定义
export type ThemeName = 'default' | 'default_dark' | 'blue' | 'blue_dark' | 'purple' | 'purple_dark' | 'orange' | 'orange_dark';

// 颜色集合接口定义
export interface ColorPalette {
  white: string;
  black: string;
  charcoal: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    850: string;
    900: string;
    950: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  danger: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// 通用基础颜色（所有主题共享的基础颜色）
export const baseColors = {
  white: "#ffffff",
  black: "#000000",
  // 深色模式和中性色在所有主题中保持一致
  charcoal: {
    50: "#f8f8f8",
    100: "#e8e8e8",
    200: "#d4d4d4",
    300: "#b3b3b3",
    400: "#8a8a8a",
    500: "#6b6b6b",
    600: "#4a4a4a",
    700: "#3a3a3a",
    800: "#1b1b1c", // 修改为指定的深色背景色
    850: "#161616",
    900: "#121212",
    950: "#0a0a0a",
  },
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// 默认主题（绿色系）
const defaultTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
};

// 蓝色主题
const blueTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  success: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fee2e2",
    100: "#fecaca",
    200: "#fca5a5",
    300: "#f87171",
    400: "#ef4444",
    500: "#dc2626",
    600: "#b91c1c",
    700: "#991b1b",
    800: "#7f1d1d",
    900: "#621b1b",
  },
};

// 紫色主题
const purpleTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  success: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
};

// 橙色主题
const orangeTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  success: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
};

// 暗色主题颜色定义
const defaultDarkTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
};

const blueDarkTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  success: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fee2e2",
    100: "#fecaca",
    200: "#fca5a5",
    300: "#f87171",
    400: "#ef4444",
    500: "#dc2626",
    600: "#b91c1c",
    700: "#991b1b",
    800: "#7f1d1d",
    900: "#621b1b",
  },
};

const purpleDarkTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  success: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
};

const orangeDarkTheme: ColorPalette = {
  ...baseColors,
  primary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  success: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
};

// 主题集合
export const themes: Record<ThemeName, ColorPalette> = {
  default: defaultTheme,
  default_dark: defaultDarkTheme,
  blue: blueTheme,
  blue_dark: blueDarkTheme,
  purple: purpleTheme,
  purple_dark: purpleDarkTheme,
  orange: orangeTheme,
  orange_dark: orangeDarkTheme,
};

// 获取当前主题的颜色
export const getThemeColors = (themeName: ThemeName = 'default'): ColorPalette => {
  return themes[themeName] || themes.default;
};


// 导出默认主题颜色作为向后兼容
export const colors = defaultTheme;


```

## 9. 定义与 React Navigation 结构兼容的颜色
```typescript

import { themes as colorThemes } from './colors';

// 定义与 React Navigation 结构兼容的颜色
// 同时添加我们自定义的 Tailwind 颜色
export const themes = {
  // 默认主题 - 浅色
  default: {
    dark: false,
    colors: {
      primary: colorThemes.default.primary[500], // 绿色主题色
      background: colorThemes.default.neutral[100], // 浅灰背景
      card: colorThemes.default.white, // 白色卡片
      text: colorThemes.default.neutral[800], // 深灰文字
      border: colorThemes.default.neutral[200], // 浅灰边框
      notification: colorThemes.default.danger[500], // 红色通知
      secondary: colorThemes.default.primary[600], // 深绿色
      success: colorThemes.default.success[500], // 绿色成功
      warning: colorThemes.default.warning[500], // 红色错误
    },
  },
  // 默认主题 - 暗色
  default_dark: {
    dark: true,
    colors: {
      primary: colorThemes.default_dark.primary[500], // 绿色主题色
      background: colorThemes.default_dark.charcoal[950], // 深色背景
      card: colorThemes.default_dark.charcoal[800], // 深灰卡片（使用新的 #1B1B1C）
      text: colorThemes.default_dark.neutral[50], // 浅灰文字
      border: colorThemes.default_dark.charcoal[700], // 深灰边框
      notification: colorThemes.default_dark.danger[500], // 红色通知
      secondary: colorThemes.default_dark.primary[600], // 深绿色
      success: colorThemes.default_dark.success[500], // 绿色成功
      warning: colorThemes.default_dark.warning[500], // 红色错误
    },
  },
  // 蓝色主题 - 浅色
  blue: {
    dark: false,
    colors: {
      primary: colorThemes.blue.primary[500], // 蓝色主题色
      background: colorThemes.blue.neutral[100], // 浅灰背景
      card: colorThemes.blue.white, // 白色卡片
      text: colorThemes.blue.neutral[800], // 深灰文字
      border: colorThemes.blue.neutral[200], // 浅灰边框
      notification: colorThemes.blue.danger[500], // 红色通知
      secondary: colorThemes.blue.primary[600], // 深蓝色
      success: colorThemes.blue.success[500], // 绿色成功
      warning: colorThemes.blue.warning[500], // 红色错误
    },
  },
  // 蓝色主题 - 暗色
  blue_dark: {
    dark: true,
    colors: {
      primary: colorThemes.blue_dark.primary[500], // 蓝色主题色
      background: colorThemes.blue_dark.charcoal[950], // 深色背景
      card: colorThemes.blue_dark.charcoal[800], // 深灰卡片（使用新的 #1B1B1C）
      text: colorThemes.blue_dark.neutral[50], // 浅灰文字
      border: colorThemes.blue_dark.charcoal[700], // 深灰边框
      notification: colorThemes.blue_dark.danger[500], // 红色通知
      secondary: colorThemes.blue_dark.primary[600], // 深蓝色
      success: colorThemes.blue_dark.success[500], // 绿色成功
      warning: colorThemes.blue_dark.warning[500], // 红色错误
    },
  },
  // 紫色主题 - 浅色
  purple: {
    dark: false,
    colors: {
      primary: colorThemes.purple.primary[500], // 紫色主题色
      background: colorThemes.purple.neutral[100], // 浅灰背景
      card: colorThemes.purple.white, // 白色卡片
      text: colorThemes.purple.neutral[800], // 深灰文字
      border: colorThemes.purple.neutral[200], // 浅灰边框
      notification: colorThemes.purple.danger[500], // 红色通知
      secondary: colorThemes.purple.primary[600], // 深紫色
      success: colorThemes.purple.success[500], // 绿色成功
      warning: colorThemes.purple.warning[500], // 红色错误
    },
  },
  // 紫色主题 - 暗色
  purple_dark: {
    dark: true,
    colors: {
      primary: colorThemes.purple_dark.primary[500], // 紫色主题色
      background: colorThemes.purple_dark.charcoal[950], // 深色背景
      card: colorThemes.purple_dark.charcoal[800], // 深灰卡片（使用新的 #1B1B1C）
      text: colorThemes.purple_dark.neutral[50], // 浅灰文字
      border: colorThemes.purple_dark.charcoal[700], // 深灰边框
      notification: colorThemes.purple_dark.danger[500], // 红色通知
      secondary: colorThemes.purple_dark.primary[600], // 深紫色
      success: colorThemes.purple_dark.success[500], // 绿色成功
      warning: colorThemes.purple_dark.warning[500], // 红色错误
    },
  },
  // 橙色主题 - 浅色
  orange: {
    dark: false,
    colors: {
      primary: colorThemes.orange.primary[500], // 橙色主题色
      background: colorThemes.orange.neutral[100], // 浅灰背景
      card: colorThemes.orange.white, // 白色卡片
      text: colorThemes.orange.neutral[800], // 深灰文字
      border: colorThemes.orange.neutral[200], // 浅灰边框
      notification: colorThemes.orange.danger[500], // 红色通知
      secondary: colorThemes.orange.primary[600], // 深橙色
      success: colorThemes.orange.success[500], // 绿色成功
      warning: colorThemes.orange.warning[500], // 红色错误
    },
  },
  // 橙色主题 - 暗色
  orange_dark: {
    dark: true,
    colors: {
      primary: colorThemes.orange_dark.primary[500], // 橙色主题色
      background: colorThemes.orange_dark.charcoal[950], // 深色背景
      card: colorThemes.orange_dark.charcoal[800], // 深灰卡片（使用新的 #1B1B1C）
      text: colorThemes.orange_dark.neutral[50], // 浅灰文字
      border: colorThemes.orange_dark.charcoal[700], // 深灰边框
      notification: colorThemes.orange_dark.danger[500], // 红色通知
      secondary: colorThemes.orange_dark.primary[600], // 深橙色
      success: colorThemes.orange_dark.success[500], // 绿色成功
      warning: colorThemes.orange_dark.warning[500], // 黄色警告
    },
  },
} as const;
```

## 10. 使用@react-native-async-storage/async-storage来缓存主题设置
utils/storage.ts
```typescript

import AsyncStorage from '@react-native-async-storage/async-storage'

// 存储键前缀
const STORAGE_PREFIX = {
  DEFAULT: 'app_',
  THEME: 'theme_',
  SETTINGS: 'settings_',
}

// 存储类型枚举
export enum StorageType {
  DEFAULT = 'default',
  THEME = 'theme',
  SETTINGS = 'settings',
}

// 获取存储键前缀
function getStoragePrefix(type: StorageType) {
  switch (type) {
    case StorageType.DEFAULT:
      return STORAGE_PREFIX.DEFAULT
    case StorageType.THEME:
      return STORAGE_PREFIX.THEME
    case StorageType.SETTINGS:
      return STORAGE_PREFIX.SETTINGS
    default:
      return STORAGE_PREFIX.DEFAULT
  }
}

// 生成完整的存储键
function getStorageKey(type: StorageType, key: string) {
  return `${getStoragePrefix(type)}${key}`
}

// 基础存储操作类
export class StorageManager {
  private storageType: StorageType

  constructor(storageType: StorageType = StorageType.DEFAULT) {
    this.storageType = storageType
  }

  // 设置值
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      let stringValue: string

      if (typeof value === 'string') {
        stringValue = value
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        stringValue = String(value)
      } else {
        // 对象类型转为JSON字符串存储
        stringValue = JSON.stringify(value)
      }

      await AsyncStorage.setItem(storageKey, stringValue)
      return true
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error)
      return false
    }
  }

  // 获取值
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      
      if (value === null) {
        return defaultValue
      }

      // 尝试解析JSON
      try {
        return JSON.parse(value) as T
      } catch {
        // 如果不是JSON，尝试转换类型
        if (value === 'true') return true as T
        if (value === 'false') return false as T
        if (!isNaN(Number(value)) && value !== '') return Number(value) as T
        return value as unknown as T
      }
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取字符串
  async getString(key: string, defaultValue?: string): Promise<string | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      return value ?? defaultValue
    } catch (error) {
      console.error(`Storage getString error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取数字
  async getNumber(key: string, defaultValue?: number): Promise<number | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      if (value === null) return defaultValue
      
      const numValue = Number(value)
      return isNaN(numValue) ? defaultValue : numValue
    } catch (error) {
      console.error(`Storage getNumber error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取布尔值
  async getBoolean(key: string, defaultValue?: boolean): Promise<boolean | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      if (value === null) return defaultValue
      
      if (value === 'true') return true
      if (value === 'false') return false
      return defaultValue
    } catch (error) {
      console.error(`Storage getBoolean error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 检查键是否存在
  async contains(key: string): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      return value !== null
    } catch (error) {
      console.error(`Storage contains error for key "${key}":`, error)
      return false
    }
  }

  // 删除键
  async remove(key: string): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      await AsyncStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error)
      return false
    }
  }

  // 清空所有数据
  async clear(): Promise<boolean> {
    try {
      const prefix = getStoragePrefix(this.storageType)
      const allKeys = await AsyncStorage.getAllKeys()
      const keysToRemove = allKeys.filter(key => key.startsWith(prefix))
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove)
      }
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  // 获取所有键
  async getAllKeys(): Promise<string[]> {
    try {
      const prefix = getStoragePrefix(this.storageType)
      const allKeys = await AsyncStorage.getAllKeys()
      return allKeys
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''))
    } catch (error) {
      console.error('Storage getAllKeys error:', error)
      return []
    }
  }

  // 批量设置
  async setMultiple<T extends Record<string, any>>(data: T): Promise<boolean> {
    try {
      const promises = Object.entries(data).map(([key, value]) => 
        this.set(key, value)
      )
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Storage setMultiple error:', error)
      return false
    }
  }

  // 批量获取
  async getMultiple<T extends string[]>(keys: T): Promise<Record<T[number], any>> {
    const result = {} as Record<T[number], any>
    const promises = keys.map(async (key) => {
      result[key as T[number]] = await this.get(key)
    })
    await Promise.all(promises)
    return result
  }

  // 批量删除
  async removeMultiple(keys: string[]): Promise<boolean> {
    try {
      const promises = keys.map(key => this.remove(key))
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Storage removeMultiple error:', error)
      return false
    }
  }
}

// 导出存储管理器实例
export const defaultStorageManager = new StorageManager(StorageType.DEFAULT)
export const themeStorageManager = new StorageManager(StorageType.THEME)
export const settingsStorageManager = new StorageManager(StorageType.SETTINGS)

```

## 11. 创建 ThemeContext 上下文
```typescript
import { themes } from '@/theme/themes';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'nativewind';

import { ThemeName } from '@/theme/colors';
import { themeStorageManager } from '../utils/storage';

type ThemeContextType = {
  themeName: ThemeName;
  theme: typeof themes[ThemeName]; // 当前主题对象
  setTheme: (name: ThemeName) => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const { setColorScheme } = useColorScheme();

  // 从存储中加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await themeStorageManager.getString('SELECTED_THEME_NAME');
        if (savedTheme && ['default', 'default_dark', 'blue', 'blue_dark', 'purple', 'purple_dark', 'orange', 'orange_dark'].includes(savedTheme)) {
          setThemeName(savedTheme as ThemeName);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    
    loadTheme();
  }, []);

  const theme = useMemo(() => themes[themeName], [themeName]);
  
  // 判断是否为深色模式（基于主题的 dark 属性）
  const isDarkMode = useMemo(() => {
    return theme.dark || false;
  }, [theme]);

  // 使用 NativeWind 的 setColorScheme 来管理暗色模式
  useEffect(() => {
    if (isDarkMode) {
      setColorScheme('dark');
    } else {
      setColorScheme('light');
    }
  }, [isDarkMode, setColorScheme]);

  const setTheme = async (name: ThemeName) => {
    try {
      setThemeName(name);
      await themeStorageManager.set('SELECTED_THEME_NAME', name);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, setTheme, isDarkMode }}>
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


## 12. 创建RootNavigator
```typescript
import { useTheme } from '@/context/ThemeContext';
import { useSystemInit } from '@/hooks/use-system-init';
import { Theme as NavigationTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { vars } from 'nativewind'; // NativeWind 提供的变量注入工具
import React, { useEffect } from 'react';
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
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
  });

  const { isReady, error, stage } = useSystemInit();
 // 监听状态变化以隐藏启动屏
  useEffect(() => {
    if (isReady || error) {
      // 当准备就绪或报错时，隐藏原生启动屏
      console.log('系统初始化完成:', { isReady, error, stage });
    }
  }, [isReady, error]);

  return (
    // style={nativeWindVars} 将变量注入到根节点，所有子组件的 Tailwind 类都能读取到
    // 注意 taiwindcss这块的变量样式不要放在第三方组件中，否则可能会导致样式失效
    <View style={[nativeWindVars, { flex: 1 }]} className="bg-gray-200 dark:bg-black">
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
```

## 13. 在_layout.tsx中使用RootNavigator
```typescript
import { ThemeProvider } from "@/context/ThemeContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

```

## 14. 主题切换方式
```typescript
import { useTheme } from "@/context/ThemeContext";

function ThemeSelector() {
  const { themeName, setTheme, isDarkMode } = useTheme();
  const themeOptions = useMemo(
    () => [
      { key: "default" as const, label: "绿色", color: "#10b981", darkColor: "#10b981" },
      { key: "default_dark" as const, label: "绿色暗色", color: "#10b981", darkColor: "#10b981" },
      { key: "blue" as const, label: "蓝色", color: "#3b82f6", darkColor: "#3b82f6" },
      { key: "blue_dark" as const, label: "蓝色暗色", color: "#3b82f6", darkColor: "#3b82f6" },
      { key: "purple" as const, label: "紫色", color: "#8b5cf6", darkColor: "#8b5cf6" },
      { key: "purple_dark" as const, label: "紫色暗色", color: "#8b5cf6", darkColor: "#8b5cf6" },
      { key: "orange" as const, label: "橙色", color: "#f59e0b", darkColor: "#f59e0b" },
      { key: "orange_dark" as const, label: "橙色暗色", color: "#f59e0b", darkColor: "#f59e0b" },
    ],
    []
  );
  
  return (
    <View className="space-y-4">
      <View className="flex-row flex-wrap gap-2">
        {themeOptions.map((opt) => {
          const active = themeName === opt.key;
          const isDarkTheme = opt.key.includes('_dark');
          
          return (
            <Pressable
              key={opt.key}
              className={`px-3 py-2 rounded-xl border transition-colors flex-row items-center gap-2 ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border"
              } ${isDarkTheme ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTheme(opt.key);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${opt.label}主题`}
            >
              <View 
                className="w-4 h-4 rounded-full border border-white dark:border-neutral-800" 
                style={{ backgroundColor: opt.color }}
              />
              <Text className="text-xs text-text">
                {opt.label}
              </Text>
              {isDarkTheme && (
                <MaterialIcons name="dark-mode" size={12} color="#6b7280" />
              )}
            </Pressable>
          );
        })}
      </View>
      
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text/60">
          当前主题
        </Text>
        <View className="px-2 py-1 rounded-lg bg-card border border-border">
          <Text className="text-xs text-text font-medium">
            {themeOptions.find(opt => opt.key === themeName)?.label || themeName}
          </Text>
        </View>
      </View>
    </View>
  );
}
```


## 原理

此方案利用了 NativeWind 的运行时 polyfill 能力。vars() 实际上是将自定义属性传递给 React Native 的 style，NativeWind 的编译器会将 bg-primary 编译成引用这些 style 属性的代码。

React Navigation：React Navigation 并不认识 CSS 变量，它只认 JS 对象。所以我们需要在 RootNavigator 中显式地把当前的颜色值传给 <NavigationContainer theme={...}>。这样 Header、TabBar 等原生组件就能正确着色。
StatusBar：你可能还需要根据 theme.dark 属性来同步更新 Expo 的 <StatusBar style={theme.dark ? 'light' : 'dark'} />。
