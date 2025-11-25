import { ThemeProvider } from "@/context/ThemeContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';

import "react-native-reanimated";
import "./global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
      <Toast />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
