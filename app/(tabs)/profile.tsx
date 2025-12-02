import { useTheme } from "@/context/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingItemProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  accessibilityHint?: string;
  showArrow?: boolean;
};

function SettingItem({
  icon,
  label,
  onPress,
  trailing,
  accessibilityHint,
  showArrow = true,
}: SettingItemProps) {
  return (
    <Pressable
      className="w-full flex-row items-center justify-between py-1 active:bg-gray-50 dark:active:bg-neutral-800 transition-colors"
      android_ripple={{ color: "#e5e5ea" }}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
    >
      <View className="flex-row items-center">
        {icon ? (
          <MaterialIcons
            name={icon}
            size={22}
            color="#6B7280"
            style={{ marginRight: 12 }}
          />
        ) : null}
        <Text className="text-base text-neutral-900 dark:text-neutral-100 font-medium">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {trailing}
        {showArrow && !trailing ? (
          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
        ) : null}
      </View>
    </Pressable>
  );
}

function ThemeColorSelector() {
  const { themeName, setTheme } = useTheme();

  // Only show base colors (no dark variants needed for selection as they are handled by mode)
  // We map the base name to the color value
  const colorOptions = [
    { key: "default", color: "#10b981" }, // Green
    { key: "blue", color: "#3b82f6" }, // Blue
    { key: "purple", color: "#8b5cf6" }, // Purple
    { key: "orange", color: "#f59e0b" }, // Orange
  ];

  const currentBaseTheme = themeName.replace("_dark", "");

  return (
    <View className="flex-row gap-3">
      {colorOptions.map((opt) => {
        const isActive = currentBaseTheme === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // If current theme is dark, switch to new color's dark mode
              const isDark = themeName.includes("_dark");
              setTheme(isDark ? `${opt.key}_dark` : (opt.key as any));
            }}
            className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
              isActive
                ? "border-gray-300 dark:border-neutral-500"
                : "border-transparent"
            }`}
          >
            <View
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ProfilePage() {
  const { themeName, setTheme, isDarkMode } = useTheme();

  const domainArr: {key: string, label: string, children: {key: string, label?: string, render: () => React.ReactNode}[]}[] = [
    {
      key: "appearance",
      label: "外观设置",
      children: [
        { key: "theme", label: "主题色", render: () => <ThemeColorSelector /> },
        {
          key: "darkMode",
          label: "暗黑模式",
          render: () => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleThemeMode}
              thumbColor={isDarkMode ? "#10b981" : undefined}
            />
          ),
        },
      ],
    },
    // {
    //   key: "other",
    //   label: "其他设置",
    //   children: [
    //     {
    //       key: "reset",
    //       render: () => (
    //         <SettingItem
    //           label="多账本管理"
    //           onPress={() => {}}
    //           showArrow={true}
    //         />
    //       ),
    //     },
    //     {
    //       key: "data",
    //       render: () => (
    //         <SettingItem label="数据管理" onPress={() => {}} showArrow={true} />
    //       ),
    //     },
    //     {
    //       key: "backup",
    //       render: () => (
    //         <SettingItem
    //           label="备份与恢复"
    //           onPress={() => {}}
    //           showArrow={true}
    //         />
    //       ),
    //     },
    //   ],
    // },
    {
      key: "other",
      label: "其他设置",
      children: [
        {
          key: "support",
          render: () => (
            <SettingItem
              label="支持项目（点个star）"
              onPress={() => {
                Linking.openURL("https://github.com/Lyb-shoujibuyaofangkoudai/smallCount");
              }}
              showArrow={true}
            />
          ),
        },
      ],
    }
  ];

  const toggleThemeMode = (value: boolean) => {
    Haptics.selectionAsync();
    const currentBase = themeName.replace("_dark", "");
    setTheme(value ? `${currentBase}_dark` : (currentBase as any));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-950">
      <ScrollView
        className="flex-1 px-4 md:px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
      >
        <View className="w-full max-w-md self-center">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-neutral-900 dark:text-white">
              个人中心
            </Text>
          </View>

          {/* Minimal Profile Layout */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
              <Text className=" text-2xl font-bold text-gray-600 dark:text-gray-300">
                M
              </Text>
            </View>
            <Text className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
              small记账
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              免费好用的小型记账APP
            </Text>
          </View>

          {domainArr.map((domain) => (
            <View key={domain.key} className="mb-8">
              <Text className="ml-4 mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                {domain.label}
              </Text>
              <View className="bg-card rounded-2xl overflow-hidden border border-border">
                {domain.children.map((item) => (
                  <View
                    key={item.key}
                    className={`flex-row items-center justify-between p-4 border-b border-border ${item.key === domain.children[domain.children.length - 1].key ? 'border-b-0' : ''}`}
                  >
                    {item?.label ? (
                      <Text className="text-base text-neutral-900 dark:text-neutral-100 font-medium">
                        {item.label}
                      </Text>
                    ) : (
                      ""
                    )}
                    {item.render()}
                  </View>
                ))}
              </View>
            </View>
          ))}

         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
