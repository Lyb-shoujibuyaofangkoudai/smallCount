import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { useTheme } from "@/context/ThemeContext";
import useSettingStore from "@/storage/store/useSettingStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AiSetting() {
  const { theme, isDarkMode } = useTheme();
  const {
    apiUrl,
    apiKey,
    modelName,
    isLoading,
    testResult,
    updateApiUrl,
    updateApiKey,
    updateModelName,
    initializeConfig,
    testAiConnection,
    saveAiConfig,
    resetAiConfig,
  } = useSettingStore();
  // 初始化时从store加载配置
  useEffect(() => {
    // 从本地存储加载AI配置
    initializeConfig();
  }, []);

  const handleTestConnection = async () => {
    try {
      const result = await testAiConnection();
      Toast.show({
        type: "success",
        text1: "连接成功",
        text2: result.message,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "连接失败",
        text2:
          error instanceof Error
            ? error.message
            : "无法连接到API服务器，请检查配置",
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!apiUrl || !apiKey) {
      Toast.show({
        type: "error",
        text1: "错误",
        text2: "请填写完整的API配置信息",
      });
      return;
    }

    try {
      await saveAiConfig({
        apiUrl,
        apiKey,
        modelName,
      });

      Toast.show({
        type: "success",
        text1: "保存成功",
        text2: "AI配置已保存",
      });

      // 可以返回上一页
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "保存失败",
        text2: error instanceof Error ? error.message : "无法保存配置，请重试",
      });
    }
  };

  const handleGetKeyHelp = () => {
    Alert.alert(
      "如何获取API Key",
      "1. 访问 OpenAI 官网\n2. 注册/登录账户\n3. 进入 API Keys 页面\n4. 创建新的 API Key\n5. 复制并保存 Key",
      [{ text: "知道了" }]
    );
  };

  const handleResetConfig = () => {
    Alert.alert(
      "删除配置",
      "确定要删除所有AI配置吗？此操作不可撤销，您需要重新配置API信息才能使用AI功能。",
      [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              await resetAiConfig();
              Toast.show({
                type: "success",
                text1: "删除成功",
                text2: "AI配置已删除",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "删除失败",
                text2: error instanceof Error ? error.message : "无法删除配置，请重试",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <Text className="text-lg font-semibold ml-4 text-text">AI 设置</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Title Section */}
        <View className="mt-6 mb-6">
          <Text className="text-2xl font-bold text-text">模型配置</Text>
          <Text className="text-sm text-textSecondary mt-2">
            配置 AI 服务的连接参数，确保助手正常工作。<Text className="text-xs font-medium text-yellow-500">当前功能为Beta版本，可能存在不稳定情况。</Text>
          </Text>
        </View>

        {/* Service Provider Section */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-3">
            服务提供商
          </Text>
          <View className="bg-card rounded-xl p-4 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-black justify-center items-center">
                  <MaterialIcons name="smart-toy" size={20} color="white" />
                </View>
                <Text className="ml-3 text-base font-medium text-text">
                  OpenAI / 兼容接口
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Connection Parameters Section */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-3">
            连接参数（理论上兼容OpenAI接口相关的都行）
          </Text>

          <View className="bg-card rounded-xl border border-border">
            {/* API URL */}
            <View className="flex-row items-center p-4 border-b border-border">
              <View className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center">
                <MaterialIcons
                  name="language"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-text mb-1">
                  接口地址 (Base URL)
                </Text>
                <TextInput
                  className="text-base text-text p-2 bg-background rounded-lg border border-border"
                  value={apiUrl}
                  onChangeText={updateApiUrl}
                  placeholder="https://api.siliconflow.cn/v1"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* API Key */}
            <View className="flex-row items-center p-4 border-b border-border">
              <View className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center">
                <MaterialIcons
                  name="key"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-text mb-1">
                  API Key
                </Text>
                <TextInput
                  className="text-base text-text p-2 bg-background rounded-lg border border-border"
                  value={apiKey}
                  onChangeText={updateApiKey}
                  placeholder="sk-..."
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Model Name */}
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center">
                <MaterialIcons
                  name="model-training"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-text mb-1">
                  模型名称 (Model)
                </Text>
                <TextInput
                  className="text-base text-text p-2 bg-background rounded-lg border border-border"
                  value={modelName}
                  onChangeText={updateModelName}
                  placeholder="gpt-4o-mini"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Help Link */}
        <View className="items-end mb-6">
          <Pressable onPress={handleGetKeyHelp}>
            <Text className="text-sm text-primary">如何获取 Key?</Text>
          </Pressable>
        </View>

        {/* 测试结果区域 */}
        {testResult && (
          <View
            className={`mb-6 p-3 rounded-lg ${testResult.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
          >
            <View className="flex-row items-center">
              <MaterialIcons
                name={testResult.success ? "check-circle" : "error"}
                size={20}
                color={testResult.success ? theme.colors.success : "#F44336"}
              />
              <Text
                className={`ml-2 text-sm ${testResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
              >
                {testResult.message}
              </Text>
            </View>
            <Text
              className={`mt-1 text-xs ${testResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              测试时间: {new Date(testResult.timestamp).toLocaleString()}
            </Text>
          </View>
        )}

        

        {/* Buttons */}
        <View className="flex-col gap-3 mb-8">
          <Pressable
            className="flex-row items-center justify-center bg-card border border-border p-4 rounded-xl"
            onPress={handleTestConnection}
            disabled={isLoading}
          >
            <MaterialIcons
              name="check-circle"
              size={20}
              color={theme.colors.text}
            />
            <Text className="ml-2 text-base font-medium text-text">
              {isLoading ? "测试中..." : "测试连接"}
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center justify-center bg-primary p-4 rounded-xl"
            onPress={handleSaveConfig}
            disabled={isLoading}
          >
            <Text className="text-base font-medium text-white">保存配置</Text>
          </Pressable>
        </View>

        {/* 危险区域 */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
            危险区域
          </Text>
          <View className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="warning" size={20} color="#F44336" />
              <Text className="ml-2 text-sm font-medium text-red-800 dark:text-red-200">
                删除配置
              </Text>
            </View>
            <Text className="text-sm text-red-700 dark:text-red-300 mb-4">
              删除所有AI配置信息，包括API地址、密钥和模型设置。此操作不可撤销，删除后需要重新配置才能使用AI功能。
            </Text>
            <Pressable
              className="flex-row items-center justify-center bg-red-600 p-3 rounded-lg"
              onPress={handleResetConfig}
              disabled={isLoading}
            >
              <MaterialIcons name="delete" size={18} color="white" />
              <Text className="ml-2 text-base font-medium text-white">删除所有配置</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
