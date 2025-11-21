import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LedgersPage() {
  const [currentTheme, setCurrentTheme] = useState('default');
  return (
    <SafeAreaView className="flex-1">
      <View className="mt-20">
        <Text className="text-2xl font-bold text-primary-500 dark:text-primary-300">当前主题: {currentTheme}</Text>
      </View>
    </SafeAreaView>
  );
}