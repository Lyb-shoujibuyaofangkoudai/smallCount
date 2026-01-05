import { useTheme } from "@/context/ThemeContext";
import { Account } from "@/db/repositories/AccountRepository";
import { getFirstCharToUpper } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface TransferGridProps {
  fromAccount: Account | null;
  toAccount: Account | null;
  amount: string;
  onCycleFrom: () => void;
  onCycleTo: () => void;
  onSwap: () => void;
}

const getAccountIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "cash":
      return "cash-outline" as keyof typeof Ionicons.glyphMap;
    case "bank":
      return "business-outline" as keyof typeof Ionicons.glyphMap;
    case "credit_card":
      return "card-outline" as keyof typeof Ionicons.glyphMap;
    case "digital_wallet":
      return "phone-portrait-outline" as keyof typeof Ionicons.glyphMap;
    case "investment":
      return "trending-up-outline" as keyof typeof Ionicons.glyphMap;
    case "loan":
      return "loan-outline" as keyof typeof Ionicons.glyphMap;
    default:
      return "wallet-outline" as keyof typeof Ionicons.glyphMap;
  }
};

const getAccountIconBg = (type: string): string => {
  switch (type) {
    case "digital_wallet":
      return "bg-wechat";
    case "bank":
      return "bg-bank";
    default:
      return "bg-primary";
  }
};

export const TransferGrid: React.FC<TransferGridProps> = ({
  fromAccount,
  toAccount,
  amount,
  onCycleFrom,
  onCycleTo,
  onSwap,
}) => {
  const { theme } = useTheme();

  const fromName = fromAccount?.name || "选择账户";
  const toName = toAccount?.name || "选择账户";
  const displayAmount = amount || "0.00";

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between px-4 pb-4">
        <Pressable
          onPress={onCycleFrom}
          className="flex-1 items-center py-4 px-2 bg-red-500/15 rounded-3xl border-2 border-red-500/50"
        >
          <View className="items-center bg-red-500/20 rounded-md py-0.5 px-2 mb-5">
            <Text className="text-sm text-red-500">转出 FROM</Text>
          </View>

          <View
            className="w-14 h-14 rounded-md items-center justify-center mb-4"
            style={{
              backgroundColor: fromAccount?.color || theme.colors.primary,
            }}
          >
            <View
              className={`rounded-md items-center justify-center ${
                fromAccount ? "" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {fromAccount ? (
                <View className="rounded-md items-center justify-center">
                  <Text className="text-white text-lg font-bold">
                    {getFirstCharToUpper(fromAccount.name)}
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name="add"
                  size={28}
                  color={theme.colors.textSecondary}
                />
              )}
            </View>
          </View>
          <Text
            className="text-lg font-medium text-text text-center"
            numberOfLines={1}
          >
            {fromName}
          </Text>
          <Text className="text-sm text-textSecondary mt-1">
            余额: ¥{fromAccount?.balance || "0.00"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSwap}
          className="mx-3 w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.colors.card }}
        >
          <Ionicons
            name="swap-horizontal"
            size={20}
            color={theme.colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onCycleTo}
          className="flex-1 items-center py-4 px-2 bg-green-500/15 rounded-3xl border-2 border-green-500/50"
        >
          <View className="items-center bg-green-500/20 rounded-md py-0.5 px-2 mb-5">
            <Text className="text-sm text-green-500">转入 TO</Text>
          </View>

          <View
            className="w-14 h-14  rounded-md items-center justify-center mb-4"
            style={{
              backgroundColor: toAccount?.color || theme.colors.success,
            }}
          >
            <View
              className={`rounded-md items-center justify-center ${
                toAccount ? "" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {toAccount ? (
                <View className=" rounded-md items-center justify-center">
                  <Text className="text-white text-lg font-bold">
                    {getFirstCharToUpper(toAccount.name)}
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name="add"
                  size={28}
                  color={theme.colors.textSecondary}
                />
              )}
            </View>
          </View>
          <Text
            className="text-lg font-medium text-text text-center"
            numberOfLines={1}
          >
            {toName}
          </Text>
          <Text className="text-sm text-textSecondary mt-1">
            余额: ¥{toAccount?.balance || "0.00"}
          </Text>
        </Pressable>
      </View>

      <View
        className="mx-4 my-2 p-3 rounded-xl flex-row items-center"
        style={{ backgroundColor: theme.colors.card }}
      >
        <Text className="flex-1 text-md text-center text-textSecondary ml-2">
          <Text className="font-medium text-red-500">{fromName}</Text>
          {" 转入 "}
          <Text className="font-medium text-green-500">{toName}</Text>
          {" ¥ "}
          <Text className="font-bold text-primary text-lg">
            {displayAmount}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default TransferGrid;
