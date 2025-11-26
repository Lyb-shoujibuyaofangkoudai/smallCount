import { CURRENCIES } from "@/constants/data";
import useDataStore from "@/storage/store/useDataStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ACCOUNT_TYPES = [
  { label: "现金", value: "cash", icon: "cash-outline" },
  { label: "银行卡", value: "bank", icon: "card-outline" },
  { label: "信用卡", value: "credit_card", icon: "card" },
  { label: "数字钱包", value: "digital_wallet", icon: "wallet-outline" },
  { label: "投资", value: "investment", icon: "trending-up-outline" },
  { label: "借入/贷出", value: "loan", icon: "swap-horizontal-outline" },
];

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
];

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function AddAccountModal({
  visible,
  onClose,
  onSave,
}: AddAccountModalProps) {
  const initialFormState = {
    name: "",
    type: "cash",
    balance: "",
    currency: "CNY",
    icon: "💰",
    color: PRESET_COLORS[0],
    accountNumber: "",
    bankName: "",
    creditLimit: "",
    billingDay: "",
    dueDay: "",
    isDefault: false,
    notes: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false); // 控制货币选择器显示
  const { currentUser } = useDataStore();

  useEffect(() => {
    if (visible) {
      setForm(initialFormState);
      setShowCurrencyModal(false);
    }
  }, [visible]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("提示", "请输入账户名称");
      return;
    }

    setLoading(true);
    try {
      const accountData = {
        ...form,
        userId: currentUser!.id,
        balance: parseFloat(form.balance) || 0.0,
        creditLimit:
          form.type === "credit_card"
            ? parseFloat(form.creditLimit) || 0.0
            : null,
        billingDay:
          form.type === "credit_card" && form.billingDay
            ? parseInt(form.billingDay)
            : null,
        dueDay:
          form.type === "credit_card" && form.dueDay
            ? parseInt(form.dueDay)
            : null,
        bankName: ["bank", "credit_card"].includes(form.type)
          ? form.bankName
          : null,
        accountNumber: ["bank", "credit_card", "loan"].includes(form.type)
          ? form.accountNumber
          : null,
      };

      await onSave(accountData);
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取当前选中的货币对象
  const currentCurrency = CURRENCIES[form.currency] || CURRENCIES.CNY;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="justify-end bg-black/50 h-full">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full rounded-t-3xl overflow-hidden"
        >
          {/* 主卡片容器，设置为 relative 以便内部通过 absolute 覆盖货币选择器 */}
          <View className="bg-card w-full h-[700px] flex flex-col justify-end relative">
            {/* 顶部标题栏 */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-700/10 dark:border-gray-100/10">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-text text-base">取消</Text>
              </TouchableOpacity>
              <Text className="text-text text-lg font-bold">添加账户</Text>
              <TouchableOpacity onPress={handleSave} disabled={loading}>
                <Text
                  className={`text-base font-bold ${loading ? "text-gray-400" : "text-primary"}`}
                >
                  保存
                </Text>
              </TouchableOpacity>
            </View>

            {/* 表单滚动区域 */}
            <ScrollView
              className="flex-1 p-4"
              showsVerticalScrollIndicator={false}
            >
              {/* 1. 基础信息 */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-text text-md mb-1 opacity-70">
                    账户名称
                  </Text>
                  <TextInput
                    className="bg-background text-text h-12 px-3 rounded-lg border border-gray-500/20"
                    placeholder="例如：招商银行储蓄卡"
                    placeholderTextColor="#9CA3AF"
                    value={form.name}
                    onChangeText={(text) => updateField("name", text)}
                  />
                </View>
              </View>

              {/* 颜色选择器 */}
              <View className="mb-6">
                <Text className="text-text text-md mb-2 opacity-70">
                  标签颜色
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                >
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => updateField("color", color)}
                      className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${form.color === color ? "border-2 border-text" : ""}`}
                      style={{ backgroundColor: color }}
                    >
                      {form.color === color && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 2. 账户金额与货币选择 */}
              <View className="mb-6">
                <Text className="text-text text-md mb-1 opacity-70">
                  当前余额
                </Text>

                {/* 金额输入框 */}
                <View className="bg-background flex-row items-center rounded-lg border border-gray-500/20 px-3 h-12 mb-3">
                  <TextInput
                    className="flex-1 text-text text-lg font-medium"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={form.balance}
                    onChangeText={(text) => updateField("balance", text)}
                  />
                  <TouchableOpacity
                    className="bg-gray-500/20 px-2 py-1 rounded"
                    onPress={() => setShowCurrencyModal(true)}
                  >
                    {/* 这里显示货币符号，更直观 */}
                    <Text className="text-text text-md font-bold">
                      {currentCurrency.char}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 3. 账户类型 */}
              <View className="mb-6">
                <Text className="text-text text-md mb-2 opacity-70">
                  账户类型
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ACCOUNT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => updateField("type", type.value)}
                      className={`px-3 py-2 rounded-lg flex-row items-center border ${
                        form.type === type.value
                          ? "bg-primary border-primary"
                          : "bg-background border-gray-500/20"
                      }`}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={16}
                        color={form.type === type.value ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-1 text-sm ${form.type === type.value ? "text-white font-bold" : "text-text"}`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 4. 动态字段 */}
              {["bank", "credit_card"].includes(form.type) && (
                <View className="mb-4 bg-background p-3 rounded-lg">
                  <Text className="text-text font-bold mb-3">银行信息</Text>
                  <View className="gap-3">
                    <View>
                      <Text className="text-text text-md mb-1 opacity-70">
                        银行名称
                      </Text>
                      <TextInput
                        className="bg-card text-text p-2 rounded border border-gray-500/10"
                        value={form.bankName}
                        onChangeText={(t) => updateField("bankName", t)}
                        placeholder="例如：中国银行"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <View>
                      <Text className="text-text text-md mb-1 opacity-70">
                        卡号 (选填)
                      </Text>
                      <TextInput
                        className="bg-card text-text p-2 rounded border border-gray-500/10"
                        value={form.accountNumber}
                        onChangeText={(t) => updateField("accountNumber", t)}
                        keyboardType="number-pad"
                        placeholder="最后4位即可"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                </View>
              )}

              {form.type === "credit_card" && (
                <View className="mb-4 bg-background p-3 rounded-lg">
                  <Text className="text-text font-bold mb-3">信用卡详情</Text>
                  <View className="flex-row gap-3 mb-3">
                    <View className="flex-1">
                      <Text className="text-text text-md mb-1 opacity-70">
                        总额度
                      </Text>
                      <TextInput
                        className="bg-card text-text p-2 rounded border border-gray-500/10"
                        value={form.creditLimit}
                        onChangeText={(t) => updateField("creditLimit", t)}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-text text-md mb-1 opacity-70">
                        账单日 (每月)
                      </Text>
                      <TextInput
                        className="bg-card text-text p-2 rounded border border-gray-500/10"
                        value={form.billingDay}
                        onChangeText={(t) => updateField("billingDay", t)}
                        keyboardType="number-pad"
                        placeholder="1-31"
                        placeholderTextColor="#9CA3AF"
                        maxLength={2}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text text-md mb-1 opacity-70">
                        还款日 (每月)
                      </Text>
                      <TextInput
                        className="bg-card text-text p-2 rounded border border-gray-500/10"
                        value={form.dueDay}
                        onChangeText={(t) => updateField("dueDay", t)}
                        keyboardType="number-pad"
                        placeholder="1-31"
                        placeholderTextColor="#9CA3AF"
                        maxLength={2}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* 5. 更多选项 */}
              <View className="mb-4 bg-background p-3 rounded-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-text">设为默认账户</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={form.isDefault ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={(val) => updateField("isDefault", val)}
                    value={form.isDefault}
                  />
                </View>
                <View>
                  <Text className="text-text text-md mb-1 opacity-70">
                    备注
                  </Text>
                  <TextInput
                    className="bg-card text-text p-2 rounded border border-gray-500/10 h-20"
                    multiline
                    textAlignVertical="top"
                    value={form.notes}
                    onChangeText={(t) => updateField("notes", t)}
                    placeholder="添加备注..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View className="h-10" />
            </ScrollView>

            {/* --- 货币选择器覆盖层 --- */}
            {showCurrencyModal && (
              <View className="absolute inset-0 bg-card z-50 flex-col">
                {/* 覆盖层头部 */}
                <View className="flex-row items-center p-4 border-b border-gray-700/10 dark:border-gray-100/10 bg-card">
                  <TouchableOpacity
                    onPress={() => setShowCurrencyModal(false)}
                    className="mr-4"
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      className="text-text"
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <Text className="text-text text-lg font-bold">选择货币</Text>
                </View>

                {/* 货币列表 */}
                <FlatList
                  data={Object.values(CURRENCIES)}
                  keyExtractor={(item) => item.value}
                  className="flex-1 bg-card"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        updateField("currency", item.value);
                        setShowCurrencyModal(false);
                      }}
                      className={`flex-row justify-between items-center p-4 border-b border-gray-700/5 ${
                        form.currency === item.value ? "bg-primary/10" : ""
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                          <Text className="text-lg">{item.char}</Text>
                        </View>
                        <View>
                          <Text
                            className={`text-base font-bold ${form.currency === item.value ? "text-primary" : "text-text"}`}
                          >
                            {item.value}
                          </Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {item.name}
                          </Text>
                        </View>
                      </View>
                      {form.currency === item.value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          className="text-primary"
                          color="#81b0ff"
                        /> // 替换 #81b0ff 为你的 primary 色值
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
