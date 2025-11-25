import { Ionicons } from "@expo/vector-icons";

// --- 类型定义 ---
export interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap; // 强类型约束 Ionicons 名称
  isDefault?: boolean; // 是否默认支付方式
}