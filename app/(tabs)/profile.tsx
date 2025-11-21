import { useTheme } from "@/context/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type SectionProps = {
  title: string;
  children: React.ReactNode;
  desc?: string;
};

function Section({ title, children, desc }: SectionProps) {
  return (
    <View className="w-full rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 md:p-6 transition-colors">
      <Text className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      {desc ? (
        <Text className="mt-1 text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
          {desc}
        </Text>
      ) : null}
      <View className="mt-4">{children}</View>
    </View>
  );
}

type SettingItemProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  accessibilityHint?: string;
};

function SettingItem({
  icon,
  label,
  onPress,
  trailing,
  accessibilityHint,
}: SettingItemProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 focus:bg-gray-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 transition-colors"
      android_ripple={{ color: "#e5e5ea" }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
    >
      <View className="flex-row items-center">
        {icon ? <MaterialIcons name={icon} size={22} color="#6B7280" /> : null}
        <Text className="ml-2 text-sm md:text-base text-neutral-800 dark:text-neutral-200">
          {label}
        </Text>
      </View>
      {trailing ?? (
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

function ThemeSelector() {
  const { themeName, setTheme, isDarkMode } = useTheme();
  const themeOptions = useMemo(
    () => [
      { key: "default" as const, label: "绿色", color: "#10b981" },
      { key: "blue" as const, label: "蓝色", color: "#3b82f6" },
      { key: "purple" as const, label: "紫色", color: "#8b5cf6" },
      { key: "orange" as const, label: "橙色", color: "#f59e0b" },
    ],
    []
  );
  
  return (
    <View className="flex-row gap-2">
      {themeOptions.map((opt) => {
        const active = themeName === opt.key;
        return (
          <Pressable
            key={opt.key}
            className={`px-3 py-2 rounded-xl border transition-colors ${
              active
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTheme(opt.key);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View className="flex-row items-center gap-2">
              <View 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: opt.color }}
              />
              <Text
                className={`text-sm ${active ? "text-primary" : "text-text"}`}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <View className="flex-1 items-end">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-text/60">
            当前
          </Text>
          <View className="px-2 py-1 rounded-lg bg-card">
            <Text className="text-xs text-text">
              {themeName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ProfilePage() {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView
        className="flex-1 px-4 md:px-8 py-4 md:py-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="w-full max-w-5xl self-center gap-6">
          <View className="w-full rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 transition-colors">
            <View className="items-center">
              <View className="relative">
                <Pressable
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-500 items-center justify-center"
                  android_ripple={{ color: "#e5e5ea" }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  accessibilityRole="button"
                  accessibilityHint="更换头像"
                >
                  <Text className="text-white text-xl font-bold">我</Text>
                </Pressable>
                <View className="absolute -bottom-1 -right-1">
                  <View className="w-7 h-7 rounded-full bg-white dark:bg-neutral-800 items-center justify-center border border-gray-200 dark:border-neutral-700">
                    <MaterialIcons
                      name="camera-alt"
                      size={16}
                      color="#374151"
                    />
                  </View>
                </View>
              </View>
              <Text className="mt-4 text-2xl font-semibold tracking-wide text-primary-900 dark:text-primary-400">
                YB COUNBT
              </Text>
              <View className="relative mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700/50">
                <Text className="absolute top-0 left-0 w-fit flex-row items-center justify-center text-xl text-primary-700 dark:text-primary-300 bg-white/80 dark:bg-primary-900/50 px-4 rounded-br-xl backdrop-blur-sm">
                  2025-12
                </Text>
                <View className="px-4 pt-8 w-full flex-row items-center justify-center gap-3">
                  <View className="px-3 py-2 flex-col items-center justify-center">
                    <Text className="text-lg text-neutral-600 dark:text-neutral-300">
                      总账单
                    </Text>
                    <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      128
                    </Text>
                  </View>
                  <View className="px-3 py-2 flex-col items-center justify-center flex-1">
                    <Text className="text-lg text-neutral-600 dark:text-neutral-300">
                      本月收入
                    </Text>
                    <Text className="text-xl font-semibold text-green-600">
                      ¥ 8,500
                    </Text>
                  </View>
                  <View className="px-3 py-2 flex-col items-center justify-center flex-1">
                    <Text className="text-lg text-neutral-600 dark:text-neutral-300">
                      本月支出
                    </Text>
                    <Text className="text-xl font-semibold text-red-600">
                      ¥ 6,100
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Section title="主题与外观" desc="切换亮色/暗色，支持跟随系统">
            <ThemeSelector />
          </Section>

          <Section title="同步与备份" desc="云服务配置与本地备份">
            <SettingItem
              icon="cloud"
              label="配置云同步（Supabase / WebDAV）"
              onPress={() => {}}
              accessibilityHint="配置云同步服务"
            />
            <SettingItem
              icon="backup"
              label="立即备份到本地"
              onPress={() => {}}
              accessibilityHint="创建本地备份"
            />
            <SettingItem
              icon="file-upload"
              label="导出CSV数据"
              onPress={() => {}}
              accessibilityHint="导出数据为CSV"
            />
          </Section>

          <Section title="偏好与隐私" desc="通知、分析与安全">
            <SettingItem
              icon="notifications"
              label="通知提醒"
              trailing={
                <Switch
                  value={notifyEnabled}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setNotifyEnabled(v);
                  }}
                  accessibilityRole="switch"
                />
              }
              accessibilityHint="开启或关闭通知"
            />
            <SettingItem
              icon="insights"
              label="匿名使用分析"
              trailing={
                <Switch
                  value={analyticsEnabled}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setAnalyticsEnabled(v);
                  }}
                  accessibilityRole="switch"
                />
              }
              accessibilityHint="开启或关闭匿名分析"
            />
            <View className="mt-2 px-3">
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                数据仅存储在本地设备，云同步为可选功能，遵循WCAG可访问性标准。
              </Text>
            </View>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
