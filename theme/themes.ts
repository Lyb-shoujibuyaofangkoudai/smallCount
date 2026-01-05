
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.default.neutral[200], // 浅灰边框
      notification: colorThemes.default.danger[500], // 红色通知
      secondary: colorThemes.default.primary[600], // 深绿色
      success: colorThemes.default.success[500], // 绿色成功
      warning: colorThemes.default.warning[500], // 黄色警告
      danger: colorThemes.default.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.default_dark.charcoal[700], // 深灰边框
      notification: colorThemes.default_dark.danger[500], // 红色通知
      secondary: colorThemes.default_dark.primary[600], // 深绿色
      success: colorThemes.default_dark.success[500], // 绿色成功
      warning: colorThemes.default_dark.warning[500], // 黄色警告
      danger: colorThemes.default_dark.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.blue.neutral[200], // 浅灰边框
      notification: colorThemes.blue.danger[500], // 红色通知
      secondary: colorThemes.blue.primary[600], // 深蓝色
      success: colorThemes.blue.success[500], // 绿色成功
      warning: colorThemes.blue.warning[500], // 黄色警告
      danger: colorThemes.blue.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.blue_dark.charcoal[700], // 深灰边框
      notification: colorThemes.blue_dark.danger[500], // 红色通知
      secondary: colorThemes.blue_dark.primary[600], // 深蓝色
      success: colorThemes.blue_dark.success[500], // 绿色成功
      warning: colorThemes.blue_dark.warning[500], // 黄色警告
      danger: colorThemes.blue_dark.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.purple.neutral[200], // 浅灰边框
      notification: colorThemes.purple.danger[500], // 红色通知
      secondary: colorThemes.purple.primary[600], // 深紫色
      success: colorThemes.purple.success[500], // 绿色成功
      warning: colorThemes.purple.warning[500], // 黄色警告
      danger: colorThemes.purple.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.purple_dark.charcoal[700], // 深灰边框
      notification: colorThemes.purple_dark.danger[500], // 红色通知
      secondary: colorThemes.purple_dark.primary[600], // 深紫色
      success: colorThemes.purple_dark.success[500], // 绿色成功
      warning: colorThemes.purple_dark.warning[500], // 黄色警告
      danger: colorThemes.purple_dark.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.orange.neutral[200], // 浅灰边框
      notification: colorThemes.orange.danger[500], // 红色通知
      secondary: colorThemes.orange.primary[600], // 深橙色
      success: colorThemes.orange.success[500], // 绿色成功
      warning: colorThemes.orange.warning[500], // 黄色警告
      danger: colorThemes.orange.danger[500], // 红色危险
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
      textSecondary: colorThemes.default.neutral[500], // 中灰文字
      border: colorThemes.orange_dark.charcoal[700], // 深灰边框
      notification: colorThemes.orange_dark.danger[500], // 红色通知
      secondary: colorThemes.orange_dark.primary[600], // 深橙色
      success: colorThemes.orange_dark.success[500], // 绿色成功
      warning: colorThemes.orange_dark.warning[500], // 黄色警告
      danger: colorThemes.orange_dark.danger[500], // 红色危险
    },
  },
} as const;