import { useTheme } from "@/context/ThemeContext";
import { initializeAgents, simpleOpenAI } from "@/utils/aiAgents";
import { AgentConfig } from "@/utils/SimpleOpenAI";
import { generateUUID } from "@/utils/uuid";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Bubble,
  ComposerProps,
  DayProps,
  GiftedChat,
  IMessage,
  InputToolbar,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AIScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string>('expense-analyzer');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const tabbarHeight = 0;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset =
    insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  // 初始化智能体和会话
  useEffect(() => {
    console.log('[AI Screen] useEffect started, initializing agents...');
    try {
      console.log('[AI Screen] Calling initializeAgents...');
      const initializedAgents = initializeAgents();
      console.log('[AI Screen] initializeAgents returned:', initializedAgents.length, 'agents');
      setAgents(initializedAgents);
      
      // 创建新会话
      console.log('[AI Screen] Creating session with agent:', currentAgentId);
      const newSessionId = simpleOpenAI.createSession(currentAgentId);
      console.log('[AI Screen] Session created with ID:', newSessionId);
      setSessionId(newSessionId);
      
      // 添加欢迎消息
      const currentAgent = initializedAgents.find(a => a.id === currentAgentId);
      console.log('[AI Screen] Current agent:', currentAgent);
      setMessages([
        {
          _id: 1,
          text: `你好！👋 我是${currentAgent?.name || 'AI助手'}，${currentAgent?.description || '有什么可以帮助你的吗？'}`,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: currentAgent?.name || 'AI Assistant',
            avatar: currentAgent?.avatar || undefined,
          },
        }, 
      ]);
    } catch (error) {
      console.error('初始化AI助手失败:', error);
      Alert.alert('错误', `初始化AI助手失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, []);

  // 切换智能体
  const switchAgent = useCallback((agentId: string) => {
    if (agentId === currentAgentId) {
      setShowAgentSelector(false);
      return;
    }
    
    try {
      // 切换会话的智能体
      if (sessionId) {
        simpleOpenAI.switchSessionAgent(sessionId, agentId);
      }
      
      const newAgent = agents.find(a => a.id === agentId);
      setCurrentAgentId(agentId);
      setShowAgentSelector(false);
      
      // 添加切换智能体的消息
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, [
          {
            _id: Math.random().toString(),
            text: `已切换到${newAgent?.name || 'AI助手'}`,
            createdAt: new Date(),
            system: true,
            user: {
              _id: 0,
            },
          },
          {
            _id: Math.random().toString(),
            text: `你好！👋 我是${newAgent?.name || 'AI助手'}，${newAgent?.description || '有什么可以帮助你的吗？'}`,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: newAgent?.name || 'AI Assistant',
              avatar: newAgent?.avatar || undefined,
            },
          }
        ])
      );
    } catch (error) {
      console.error('切换智能体失败:', error);
      Alert.alert('错误', '切换智能体失败');
    }
  }, [currentAgentId, sessionId, agents]);

  // 发送消息并获取AI回复
  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );

    // 获取用户发送的消息
    const userMessage = messages[0];
    if (!userMessage || !userMessage.text) return;
    
    setIsLoading(true);
    
    // 取消之前的请求
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    // 为AI回复生成一个唯一的消息ID
    const aiMessageId = generateUUID();
    
    try {
      // 使用流式对话
      unsubscribeRef.current = simpleOpenAI.chatStream({
        sessionId,
        agentId: currentAgentId,
        message: userMessage.text,
        maxHistoryLength: 20,
      }, {
        onStart: () => {
          // 添加AI的空消息
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, [
              {
                _id: aiMessageId,
                text: '',
                createdAt: new Date(),
                user: {
                  _id: 2,
                  name: agents.find(a => a.id === currentAgentId)?.name || 'AI Assistant',
                  avatar: agents.find(a => a.id === currentAgentId)?.avatar || undefined,
                },
              },
            ])
          );
        },
        onDelta: (delta) => {
          // 更新特定ID的消息
          setMessages(previousMessages => {
            const updatedMessages = [...previousMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg._id === aiMessageId);
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                text: updatedMessages[aiMessageIndex].text + delta,
              };
            }
            return updatedMessages;
          });
        },
        onCompletion: (fullText, updatedSessionId) => {
          setIsLoading(false);
          if (updatedSessionId) {
            setSessionId(updatedSessionId);
          }
        },
        onError: (error) => {
          setIsLoading(false);
          console.error('AI对话错误:', error);
          
          // 更新特定ID的消息为错误提示
          setMessages(previousMessages => {
            const updatedMessages = [...previousMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg._id === aiMessageId);
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                text: '抱歉，处理您的请求时出现了错误。请检查API密钥配置或稍后再试。',
              };
            }
            return updatedMessages;
          });
          
          Alert.alert('错误', '处理您的请求时出现了错误，请检查API密钥配置');
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error('发送消息失败:', error);
      Alert.alert('错误', '发送消息失败，请检查API密钥配置');
    }
  }, [sessionId, currentAgentId, agents]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Custom Header
  const renderHeader = () => (
    <View
      className="flex-row items-center justify-between px-4 py-2 border-b border-border bg-card"
      style={{
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        paddingTop: insets.top > 0 ? insets.top : 10, // Handle notch if not in SafeAreaView or if we want custom padding
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        className="items-center flex-1"
        onPress={() => setShowAgentSelector(true)}
      >
        <Text
          className="text-base font-bold"
          style={{ color: theme.colors.text }}
        >
          {agents.find(a => a.id === currentAgentId)?.name || 'AI助手'}
        </Text>
        <Text className="text-xs" style={{ color: theme.colors.primary }}>
          在线
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowAgentSelector(true)}>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  // 智能体选择器
  const renderAgentSelector = () => (
    <Modal
      visible={showAgentSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAgentSelector(false)}
    >
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}
      >
        <View 
          style={{
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '70%'
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
              选择智能体
            </Text>
            <TouchableOpacity onPress={() => setShowAgentSelector(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {agents.map(agent => (
              <TouchableOpacity
                key={agent.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  borderRadius: 10,
                  backgroundColor: currentAgentId === agent.id ? theme.colors.primary + '20' : 'transparent',
                  marginBottom: 10,
                }}
                onPress={() => switchAgent(agent.id)}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 15,
                }}>
                  <Text style={{ fontSize: 20 }}>{agent.avatar}</Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: theme.colors.text,
                    marginBottom: 5
                  }}>
                    {agent.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: theme.colors.textSecondary,
                    lineHeight: 20
                  }}>
                    {agent.description}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    {agent.capabilities?.slice(0, 3).map((capability, index) => (
                      <View key={index} style={{
                        backgroundColor: theme.colors.primary + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginRight: 5,
                        marginBottom: 3,
                      }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.colors.primary 
                        }}>
                          {capability}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {currentAgentId === agent.id && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Custom Bubble
  const renderBubble = useCallback(
    (props: any) => {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: theme.colors.card,
              borderWidth: 0, // No border in design
              padding: 4,
              borderRadius: 12,
              borderTopLeftRadius: 4,
              marginBottom: 4,
            },
            right: {
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              borderTopRightRadius: 4,
              padding: 4,
              marginBottom: 4,
            },
          }}
          textStyle={{
            left: {
              color: theme.colors.text,
              fontSize: 15,
              lineHeight: 22,
            },
            right: {
              color: "#FFFFFF",
              fontSize: 15,
              lineHeight: 22,
            },
          }}
          renderMessageText={(props) => {
            // Custom rendering for the specific message with rich text simulation
            // Since we can't easily inject HTML, we check if it's the specific message
            if (props.currentMessage.text.includes("¥ 2,150.00")) {
              return (
                <View style={{ padding: 8 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                  >
                    正在查询数据... 🔎 {"\n\n"}
                    根据记录，上个月（10月）
                    <Text style={{ fontWeight: "bold" }}>🍜 餐饮美食</Text>
                    类目共支出
                    <Text
                      style={{ fontWeight: "bold", color: theme.colors.text }}
                    >
                      {" "}
                      ¥ 2,150.00
                    </Text>
                    。
                  </Text>
                </View>
              );
            }
            // Default rendering for others
            return (
              <View style={{ padding: 8 }}>
                <Text
                  style={{
                    color:
                      props.position === "left" ? theme.colors.text : "#FFFFFF",
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                >
                  {props.currentMessage.text}
                </Text>
              </View>
            );
          }}
        />
      );
    },
    [theme.colors.card, theme.colors.primary, theme.colors.text]
  );

  const [text, setText] = useState("");
  const handleTextChange = useCallback((text: string, composerProps: any) => {
    setText(text);
  }, []);

  const handleSubmit = useCallback((composerProps: any) => {
    if (composerProps.text && composerProps.text.trim()) {
      composerProps.onSend({ text: composerProps.text.trim() }, true);
    }
  }, []);

  // Custom Composer to ensure stable reference and avoid re-render focus loss
  const renderComposer = useCallback(
    (composerProps: ComposerProps) => (
      <View className="flex-row items-center flex-1 gap-3">
        <TouchableOpacity disabled={isLoading}>
          <Ionicons name="add" size={24} color={isLoading ? "#9CA3AF" : theme.colors.textSecondary} />
        </TouchableOpacity>
        <View
          className="flex-1 rounded-full px-4 py-2"
          style={{
            backgroundColor: isDarkMode ? "#2c2c2e" : "#f3f4f6", // Light gray for input bg
            height: 40,
            justifyContent: "center",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 8 }}>
                AI正在思考...
              </Text>
              <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.textSecondary} />
            </View>
          ) : (
            <TextInput
              style={{
                color: theme.colors.text,
                fontSize: 15,
                padding: 0, // Remove default padding
                height: "100%",
              }}
              placeholder="问问 AI..."
              placeholderTextColor={theme.colors.textSecondary}
              onChangeText={(text) => composerProps?.textInputProps?.onChangeText?.(text)}
              defaultValue={composerProps.text}
              returnKeyType="send"
              editable={!isLoading}
            />
          )}
        </View>
      </View>
    ),
    [
      theme.colors.text,
      theme.colors.textSecondary,
      "#9CA3AF", // 代替 theme.colors.textDisabled
      theme.colors.card,
      isDarkMode,
      isLoading,
      handleTextChange,
      handleSubmit,
    ]
  );

  // Custom Send Button
  const renderSend = useCallback(
    (sendProps: any) => (
      <TouchableOpacity
        onPress={() => {
          if (sendProps.text && sendProps.text.trim() && !isLoading) {
            sendProps.onSend({ text: sendProps.text.trim() }, true);
          }
        }}
        disabled={isLoading || !sendProps.text || !sendProps.text.trim()}
        className="ml-3 w-10 h-10 rounded-full items-center justify-center"
        style={{ 
          backgroundColor: (isLoading || !sendProps.text || !sendProps.text.trim()) 
            ? "#D1D5DB" // 代替 theme.colors.disabled
            : theme.colors.primary 
        }}
      >
        {isLoading ? (
          <Ionicons
            name="hourglass-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: -2, marginTop: 2 }}
          />
        ) : (
          <Ionicons
            name="paper-plane-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: -2, marginTop: 2 }}
          />
        )}
      </TouchableOpacity>
    ),
    [theme.colors.primary, "#D1D5DB", isLoading] // 代替 theme.colors.disabled
  );

  // Custom Input Toolbar
  const renderInputToolbar = useCallback(
    (props: any) => {
      return (
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: theme.colors.card,
            borderTopWidth: 0,
            padding: 8,
            paddingBottom: insets.bottom + 8, // Add bottom padding for home indicator
          }}
          primaryStyle={{ alignItems: "center" }}
          renderComposer={renderComposer}
          renderSend={renderSend}
        />
      );
    },
    [theme.colors.card, insets.bottom, renderComposer, renderSend]
  );

  // Custom Day (Date)
  const renderDay = useCallback(
    (props: DayProps) => {
      const { createdAt } = props;
      
      // Convert createdAt to Date object if it's a number
      const date = typeof createdAt === 'number' ? new Date(createdAt) : createdAt;
      
      // Format the date and time
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      let dateText = '';
      if (isToday) {
        dateText = `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        dateText = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            {dateText}
          </Text>
        </View>
      );
    },
    [theme.colors.textSecondary]
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      <RNStatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {/* We handle top inset in renderHeader manually if we don't use SafeAreaView for the whole container */}

      {renderHeader()}
      {renderAgentSelector()}

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderAvatar={null} // No avatars in design
        minInputToolbarHeight={60}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
      />
    </View>
  );
}
