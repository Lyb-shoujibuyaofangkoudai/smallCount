import { baseColors } from "./theme/colors";
/** @type {import('tailwindcss').Config} */
module.exports = {
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
        textSecondary: "var(--color-text-secondary)",
        border: "var(--color-border)",
        notification: "var(--color-notification)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        // 自定义颜色
        secondary: "var(--color-secondary)",
        // 向后兼容的颜色别名
        "bg-primary": "var(--color-primary)",
        "bg-secondary": "var(--color-secondary)",
        "text-primary": "var(--color-text)",
        "text-secondary": "var(--color-secondary)",
        "border-primary": "var(--color-primary)",
        ...baseColors,
      },
    },
  },
  plugins: [],
};

