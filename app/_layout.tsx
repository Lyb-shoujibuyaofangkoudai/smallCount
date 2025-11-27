import { RootNavigator } from "@/components/navigation/RootNavigator";
import { ThemeProvider } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';

import "react-native-reanimated";
import "./global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
      <Toast position="top" />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
