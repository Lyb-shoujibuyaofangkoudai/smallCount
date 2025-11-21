
// 定义与 React Navigation 结构兼容的颜色
// 同时添加我们自定义的 Tailwind 颜色
export const themes = {
  default: {
    dark: false,
    colors: {
      primary: '#10b981', // 绿色主题色
      background: '#f3f4f6', // 浅灰背景
      card: '#ffffff', // 白色卡片
      text: '#1f2937', // 深灰文字
      border: '#e5e7eb', // 浅灰边框
      notification: '#ef4444', // 红色通知
      secondary: '#059669', // 深绿色
    },
  },
  blue: {
    dark: false,
    colors: {
      primary: '#3b82f6', // 蓝色主题色
      background: '#f3f4f6', // 浅灰背景
      card: '#ffffff', // 白色卡片
      text: '#1f2937', // 深灰文字
      border: '#e5e7eb', // 浅灰边框
      notification: '#ef4444', // 红色通知
      secondary: '#2563eb', // 深蓝色
    },
  },
  purple: {
    dark: false,
    colors: {
      primary: '#8b5cf6', // 紫色主题色
      background: '#f3f4f6', // 浅灰背景
      card: '#ffffff', // 白色卡片
      text: '#1f2937', // 深灰文字
      border: '#e5e7eb', // 浅灰边框
      notification: '#ef4444', // 红色通知
      secondary: '#7c3aed', // 深紫色
    },
  },
  orange: {
    dark: false,
    colors: {
      primary: '#f59e0b', // 橙色主题色
      background: '#f3f4f6', // 浅灰背景
      card: '#ffffff', // 白色卡片
      text: '#1f2937', // 深灰文字
      border: '#e5e7eb', // 浅灰边框
      notification: '#ef4444', // 红色通知
      secondary: '#d97706', // 深橙色
    },
  },
} as const;