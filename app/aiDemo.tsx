import { AgentsCreate } from "@/ai/AgentsCreate";
import { AGENT_IDS } from "@/ai/constant";
import { ExpoAgentCore } from "@/ai/lib";
import AccountSelectModal from "@/components/ui/AddTransaction/AccountSelectModal";
import { useTheme } from "@/context/ThemeContext";
import useDataStore from "@/storage/store/useDataStore";
import useSettingStore from "@/storage/store/useSettingStore";
import { generateUUID } from "@/utils/uuid";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StatusBar as RNStatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Bubble,
  ComposerProps,
  GiftedChat,
  IMessage,
  InputToolbar,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// --- 1. Mock Data & Types ---
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description: string;
}

// --- 3. Main Component ---
export default function AIDemo() {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // 获取账本数据
  const {
    accounts,
    activeAccount,
    activeAccountId,
    switchActiveAccount,
    loadAccounts,
  } = useDataStore();

  // 获取AI配置
  const {
    initializeConfig,
    apiKey,
    apiUrl: baseURL,
    modelName: defaultModel,
  } = useSettingStore();

  // State
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [core, setCore] = useState<ExpoAgentCore | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const responseBufferRef = useRef<string>("");
  const typingTimerRef = useRef<number | null>(null);

  // Refs for cleanup
  const cancelRef = useRef<(() => void) | null>(null);

  // Layout constants
  const tabbarHeight = 0;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset =
    insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  function createSmallCountAgents() {
    // 从 useSettingStore 获取 API 配置

    // 初始化 AgentsCreate
    const agentsCreator = new AgentsCreate({
      apiKey,
      baseURL,
      defaultModel,
      timeout: 10 * 60,
    });

    // 初始化所有工具和智能体
    agentsCreator.initialize();

    // 创建会话
    const sessionId = agentsCreator.createSession();

    // 获取 agentCore 实例
    const agentCore = agentsCreator.getAgentCore();

    return {
      agentsCreator,
      agentCore,
      sessionId,
    };
  }

  // --- Initialization ---
  useEffect(() => {
    // 初始化AI配置
    initializeConfig();

    // 检查API Key是否存在
    checkApiKeyExists();

    // 初始化 Core
    const { agentsCreator, agentCore, sessionId } = createSmallCountAgents();

    setCore(agentsCreator.getAgentCore());

    // 创建会话
    const newSessionId = agentCore.createSession(
      AGENT_IDS.SMALLCOUNT_ASSISTANT
    );
    setSessionId(newSessionId);

    // 初始化账本数据
    loadAccounts();

    // Initial greeting
    setMessages([
      {
        _id: generateUUID(),
        text: "你好！我是SMALLCOUNT助手。我可以帮你记账或分析收支。请告诉我你的需求。",
        createdAt: new Date(),
        user: { _id: 2, name: "SMALLCOUNT助手" },
      },
      {
        _id: generateUUID(),
        text: `🔮 欢迎使用SMALLCOUNT AI ！当前已选择账本：${activeAccount?.name || "无"}`,
        createdAt: new Date(),
        user: { _id: 3, name: "系统通知" },
        system: true,
      },
    ]);

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  // 监听 apiKey 变化
  useEffect(() => {
    checkApiKeyExists();
  }, [apiKey]);

  // 监听 hasApiKey 变化，更新提示消息
  useEffect(() => {
    // 检查是否已存在API Key提示消息
    const hasApiKeyWarning = messages.some(
      (msg) => msg.system && msg.text?.includes("您尚未配置 AI API Key")
    );

    // 如果没有API Key且没有警告消息，添加警告
    if (!hasApiKey && !hasApiKeyWarning) {
      const warningMessage = {
        _id: generateUUID(),
        text: "⚠️ 您尚未配置 AI API Key，请点击右上角的「需要配置」按钮进行设置。配置完成后才能正常使用 AI 功能。",
        createdAt: new Date(),
        user: { _id: 3, name: "系统通知" },
        system: true,
      };
      setMessages((prev) => [...prev, warningMessage]);
    }
    // 如果有API Key且有警告消息，移除警告
    else if (hasApiKey && hasApiKeyWarning) {
      setMessages((prev) =>
        prev.filter(
          (msg) => !(msg.system && msg.text?.includes("您尚未配置 AI API Key"))
        )
      );
    }
  }, [hasApiKey]);

  // 检查API Key是否存在
  const checkApiKeyExists = () => {
    const hasKey = !!(apiKey && apiKey.trim() !== "");
    setHasApiKey(hasKey);
    return hasKey;
  };

  // 处理账本选择
  const handleAccountSelect = async (account: any) => {
    try {
      await switchActiveAccount(account.id);
      setShowAccountModal(false);
    } catch (error) {
      console.error("切换账本失败:", error);
    }
  };

  // ... 前面的 import 和 state 保持不变

  // --- 辅助函数：清洗文本 ---
  const cleanText = (text: string) => {
    return text
      .replace(/<think>[\s\S]*?<\/think>/gi, "") // 移除深度思考过程
      .replace(/<think>[\s\S]*/gi, "") // 移除未闭合标签
      .replace(/```json[\s\S]*?```/gi, "") // 移除 JSON 代码块
      .replace(/```[\s\S]*?```/gi, "") // 移除普通代码块（如果也是工具调用的话）
      .trim();
  };

  const startTypewriterEffect = (fullText: string) => {
    const aiMessageId = generateUUID();
    const createdAt = new Date();

    // 1. 先添加一个空的 AI 消息气泡
    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: aiMessageId,
          text: " ", // 给一个空格占位，防止气泡塌陷
          createdAt: createdAt,
          user: { _id: 2, name: "SMALLCOUNT助手" },
        },
      ])
    );

    let currentIndex = 0;
    const length = fullText.length;
    // 调整打字速度：数字越小越快。30ms 比较接近真实流式感
    const speed = 30;
    // 每次增加的字符数：增加到 2 或 3 可以让长文本显示得更流畅
    const chunkSize = 3;

    const typeChar = () => {
      if (currentIndex < length) {
        // 计算下一帧要显示的完整文本
        currentIndex += chunkSize;
        const currentText = fullText.slice(0, currentIndex);

        setMessages((prev) => {
          const next = [...prev];
          // 找到我们刚才创建的那条消息
          const targetIndex = next.findIndex((m) => m._id === aiMessageId);
          if (targetIndex !== -1) {
            next[targetIndex] = {
              ...next[targetIndex],
              text: currentText, // 更新文本
            };
          }
          return next;
        });

        // 继续下一帧
        typingTimerRef.current = setTimeout(typeChar, speed);
      } else {
        // 打字结束
        typingTimerRef.current = null;
      }
    };

    // 启动打字
    typeChar();
  };
  // --- Chat Handler ---
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      // 检查是否有 API Key
      if (!hasApiKey) {
        Toast.show({
          type: "error",
          text1: "无法发送消息",
          text2: "请先配置 AI API Key，点击右上角的「需要配置」按钮进行设置",
        });
        return;
      }

      if (!core || !sessionId) return;
      const userMsg = newMessages[0];
      if (!userMsg?.text) return;

      // 重置默认代理为SMALLCOUNT助手
      core.setCurrentAgent(sessionId, AGENT_IDS.SMALLCOUNT_ASSISTANT);

      // 1. UI: 显示用户消息
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      // 2. UI: 显示 "对方正在输入" 小点点
      setIsTyping(true);
      // 3. 重置缓冲区
      responseBufferRef.current = "";

      // 如果上一次的打字动画还没播完，强制停止，直接显示完整结果（可选优化）
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      const cancel = core.chat(sessionId, userMsg.text, {
        onStart: () => {}, // 保持静默

        onTextDelta: (text, agentId) => {
          // 只在后台积累，完全不更新 UI
          responseBufferRef.current += text;
        },

        onToolCall: (name, args) => {
          responseBufferRef.current = ""; // 丢弃废话
          addSystemStatusMessage(`🛠️ 正在执行：${name}...`);
        },

        onAgentChange: (from, to) => {
          responseBufferRef.current = ""; // 丢弃废话
          const agentNameMap: Record<string, string> = {
            [AGENT_IDS.SMALLCOUNT_ASSISTANT]: "总助手",
            [AGENT_IDS.DATA_OPERATOR]: "数据操作",
            [AGENT_IDS.INCOME_EXPENSE_ANALYST]: "分析师",
            [AGENT_IDS.SUMMARIZER]: "总结助手",
          };
          const name = agentNameMap[to] || to;
          addSystemStatusMessage(`🔄 正在转接给：${name}...`);
        },

        onToolResult: () => {},

        onComplete: () => {
          // 网络请求完全结束
          setIsTyping(false);
          cancelRef.current = null;

          // 清洗文本
          const finalContent = cleanText(responseBufferRef.current);
          console.log("已完成内容:", finalContent);

          if (finalContent) {
            // 关键：调用打字机效果函数
            startTypewriterEffect(finalContent);
          } else {
            // 兜底：如果没有内容
            startTypewriterEffect("✅ 操作已完成");
          }
        },

        onError: (err) => {
          setIsTyping(false);
          addSystemStatusMessage(`❌ 出错: ${err.message}`);
        },
      });

      cancelRef.current = cancel;
    },
    [core, sessionId, hasApiKey]
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (cancelRef.current) {
        cancelRef.current();
      }
    };
  }, []);

  // 辅助函数：添加系统消息 (保持不变)
  const addSystemStatusMessage = (text: string) => {
    const systemMessage: IMessage = {
      _id: generateUUID(),
      text: text,
      createdAt: new Date(),
      user: { _id: 0, name: "系统" },
      system: true,
    };
    setMessages((prev) => GiftedChat.append(prev, [systemMessage]));
  };

  const handleStop = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
      setIsTyping(false);
      addSystemStatusMessage("⏹️ 操作已停止");
    }
  };

  // ... 其余渲染代码保持不变
  // Helper to update a specific message - now updates only the AI message
  const updateAiMessage = (msgId: string, content: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const index = next.findIndex((m) => m._id === msgId);

      if (index !== -1) {
        // 只更新AI消息的内容
        next[index] = {
          ...next[index],
          text: content.trim(),
        };
      }
      return next;
    });
  };

  // --- 5. UI Components (Similar to original) ---

  const renderBubble = useCallback(
    (props: any) => {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: theme.colors.card,
              borderWidth: 0,
              padding: 4,
              borderRadius: 12,
            },
            right: {
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              padding: 4,
            },
          }}
          textStyle={{
            left: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
            right: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
          }}
        />
      );
    },
    [theme]
  );

  // Input components ...
  const renderComposer = (props: ComposerProps) => (
    <View className="flex-row items-center flex-1 gap-3">
      <View
        className="flex-1 rounded-full px-4 py-2"
        style={{
          backgroundColor: isDarkMode ? "#2c2c2e" : "#f3f4f6",
          height: 40,
          justifyContent: "center",
        }}
      >
        <TextInput
          style={{
            color: theme.colors.text,
            fontSize: 15,
            padding: 0, // Remove default padding
            height: "100%",
          }}
          placeholder="输入：记一笔午餐30元 / 分析本月支出"
          placeholderTextColor={theme.colors.textSecondary}
          onChangeText={(text) => props?.textInputProps?.onChangeText?.(text)}
          value={props.text}
          returnKeyType="send"
          editable={!isLoading}
        />
      </View>
    </View>
  );

  const renderSend = (props: any) => (
    <TouchableOpacity
      onPress={() =>
        props.text?.trim() && props.onSend({ text: props.text.trim() }, true)
      }
      disabled={isLoading || !props.text?.trim()}
      className="ml-3 w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor: isLoading ? "#ef4444" : theme.colors.primary }}
    >
      {isLoading ? (
        <TouchableOpacity onPress={handleStop}>
          <Ionicons name="stop" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color="#FFFFFF"
          style={{ marginLeft: -2, marginTop: 2 }}
        />
      )}
    </TouchableOpacity>
  );

  const renderSystemMessage = (props: any) => {
    const { currentMessage } = props;

    if (!currentMessage?.system) return null;

    // 根据消息内容判断消息类型
    const isStatusMessage =
      currentMessage.text?.includes("正在调用") ||
      currentMessage.text?.includes("转接任务") ||
      currentMessage.text?.includes("系统");

    return (
      <View className="items-center my-2">
        <View
          className={`px-4 py-2 rounded-full flex-row items-center ${isStatusMessage ? "max-w-xs" : "max-w-md"}`}
          style={{
            backgroundColor: isDarkMode
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
            borderWidth: 1,
            borderColor: isDarkMode
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(59, 130, 246, 0.2)",
          }}
        >
          {isStatusMessage && (
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            className={`text-xs font-medium text-center ${isStatusMessage ? "italic" : ""}`}
            style={{ color: theme.colors.primary }}
          >
            {currentMessage.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.colors.card,
        borderTopWidth: 0,
        padding: 8,
        paddingBottom: insets.bottom + 8,
      }}
      renderComposer={renderComposer}
      renderSend={renderSend}
    />
  );

  const renderAIControls = () => (
    <View className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <Text className="text-xs text-gray-500 mb-2">快速指令:</Text>
      <View className="flex-row flex-wrap gap-2">
        {[
          "今天吃饭吃了肯德基花了50元",
          "发工资 10000元",
          "查询最近的收支",
          "分析一下我最近的消费习惯",
          "查询本月的支出",
          "帮我查一下2025年10月的收支情况",
        ].map((cmd, i) => (
          <TouchableOpacity
            key={i}
            onPress={() =>
              onSend([
                {
                  _id: generateUUID(),
                  text: cmd,
                  createdAt: new Date(),
                  user: { _id: 1 },
                },
              ])
            }
            className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full"
          >
            <Text className="text-xs text-blue-700 dark:text-blue-300">
              {cmd}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <RNStatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        className="flex-col px-4 py-2 border-b bg-card"
        style={{
          borderColor: theme.colors.border,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          paddingTop: insets.top > 0 ? insets.top : 10, // Handle notch if not in SafeAreaView or if we want custom padding
        }}
      >
        {/* 第一行：返回按钮、标题、账本选择 */}
        <View className="flex-row items-center justify-between">
          {/* 返回按钮 */}
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {/* 标题 */}
          <Text
            className="text-xl font-bold ml-[70px]"
            style={{ color: theme.colors.text }}
          >
            SmallCount AI
          </Text>

          {/* 当前账本 */}
          <TouchableOpacity
            onPress={() => setShowAccountModal(true)}
            className="flex-row items-center"
          >
            <Text className="text-base font-medium mr-1 text-primary">
              当前账本：{activeAccount?.name || "选择账本"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* 第二行：API Key 提示 */}
        {hasApiKey ? (
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text
              className="text-sm font-medium ml-1"
              style={{ color: "#4CAF50" }}
            >
              API Key 已配置，AI 功能已启用 <Text className="text-xs font-medium text-yellow-500">BETA</Text>
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-center">
            <Ionicons name="warning" size={16} color="#F44336" />
            <Text
              className="text-sm font-medium ml-1"
              style={{ color: "#F44336" }}
            >
              需要配置 API Key 才能使用 AI 功能，
            </Text>
            <TouchableOpacity onPress={() => router.push("/aiSetting")}>
              <Text
                className="text-sm font-medium underline"
                style={{ color: "#F44336" }}
              >
                点击此处前往设置
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSystemMessage={renderSystemMessage}
        minInputToolbarHeight={60}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        isTyping={isTyping}
      />
      {/* 账本选择模态框 */}
      <AccountSelectModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelect={handleAccountSelect}
        selectedId={activeAccountId}
        data={accounts}
      />

      <Toast />
    </>
  );
}
