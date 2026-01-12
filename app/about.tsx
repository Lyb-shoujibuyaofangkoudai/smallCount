import { useTheme } from "@/context/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutPage() {
  const { isDarkMode,theme } = useTheme();
  const [currentVersion, setCurrentVersion] = useState("0.0.1");

  useEffect(() => {
    const version = Constants.expoConfig?.version || "0.0.1";
    setCurrentVersion(version);
  }, []);

  return (
    <SafeAreaView
      className={`flex-1 ${
        isDarkMode ? "bg-neutral-950" : "bg-gray-50"
      }`}
    >
      <ScrollView
        className="flex-1 px-4 md:px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
      >
        <View className="w-full max-w-md self-center">
          <View className="flex-row items-center mb-6">
            <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
            <Text
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-neutral-900"
              } ml-2`}
            >
              关于我们
            </Text>
          </View>

          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4 bg-primary"
            >
              <Text className="text-white text-2xl font-bold">简</Text>
            </View>
            <Text
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-neutral-900"
              } mb-1`}
            >
                简记（SmallCount）
            </Text>
            <Text
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              免费好用的小型记账APP
            </Text>
          </View>

          <View className="mb-8">
            <View
              className={`rounded-2xl overflow-hidden border ${
                isDarkMode ? "border-neutral-800" : "border-gray-200"
              }`}
            >
              <View
                className={`p-4 border-b ${
                  isDarkMode ? "border-neutral-800" : "border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  版本信息
                </Text>
              </View>

              <View
                className={`p-4 flex-row items-center justify-between border-b ${
                  isDarkMode ? "border-neutral-800" : "border-gray-200"
                }`}
              >
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-neutral-100" : "text-neutral-900"
                  }`}
                >
                  当前版本
                </Text>
                <Text
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  v{currentVersion}
                </Text>
              </View>

              <View
                className={`p-4 flex-row items-center justify-between active:opacity-70 ${
                  isDarkMode ? "active:bg-neutral-800" : "active:bg-gray-50"
                }`}
              >
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-neutral-100" : "text-neutral-900"
                  }`}
                >
                  检查更新
                </Text>
                <Text
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  点击检查
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <View
              className={`rounded-2xl overflow-hidden border ${
                isDarkMode ? "border-neutral-800" : "border-gray-200"
              }`}
            >
              <View
                className={`p-4 border-b ${
                  isDarkMode ? "border-neutral-800" : "border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  联系我们
                </Text>
              </View>

              <Pressable
                className={`p-4 flex-row items-center justify-between active:opacity-70 ${
                  isDarkMode ? "active:bg-neutral-800" : "active:bg-gray-50"
                }`}
                onPress={() =>
                  Linking.openURL(
                    "mailto:support@smallcount.app?subject=small记账反馈"
                  )
                }
              >
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-neutral-100" : "text-neutral-900"
                  }`}
                >
                  意见反馈
                </Text>
                <Text
                  className={`text-lg ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  →
                </Text>
              </Pressable>

              <Pressable
                className={`p-4 flex-row items-center justify-between active:opacity-70 ${
                  isDarkMode ? "active:bg-neutral-800" : "active:bg-gray-50"
                }`}
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/Lyb-shoujibuyaofangkoudai/smallCount"
                  )
                }
              >
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-neutral-100" : "text-neutral-900"
                  }`}
                >
                  GitHub
                </Text>
                <Text
                  className={`text-lg ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  →
                </Text>
              </Pressable>

              <Pressable
                className={`p-4 flex-row items-center justify-between active:opacity-70 ${
                  isDarkMode ? "active:bg-neutral-800" : "active:bg-gray-50"
                }`}
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/Lyb-shoujibuyaofangkoudai/smallCount/releases"
                  )
                }
              >
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-neutral-100" : "text-neutral-900"
                  }`}
                >
                  版本历史
                </Text>
                <Text
                  className={`text-lg ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  →
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="items-center">
            <Text
              className={`text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              © 2024 small记账 All rights reserved
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
