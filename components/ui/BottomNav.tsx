import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

type NavKey = 'detail' | 'stats' | 'add' | 'ledgers' | 'profile';

function useActiveKey(pathname: string): NavKey {
  if (pathname === '/' || pathname === '' || pathname === '/index') return 'detail';
  if (pathname.startsWith('/stats')) return 'stats';
  if (pathname.startsWith('/ledgers')) return 'ledgers';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'detail';
}

export default function BottomNav() {
  const pathname = usePathname();
  const active = useActiveKey(pathname);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // 新增：控制菜单显示的状态
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const { height: screenHeight } = Dimensions.get('window');

  // 处理关闭菜单的辅助函数
  const closeMenu = () => {
    setAddMenuOpen(false);
  };

  const items = useMemo(
    () => [
      {
        key: 'detail' as const,
        label: '明细',
        icon: (color: string) => (
          <MaterialIcons name="format-list-bulleted" size={24} color={color} />
        ),
        onPress: () => {
          closeMenu();
          router.replace('/');
        },
      },
      {
        key: 'stats' as const,
        label: '图表',
        icon: (color: string) => (
          <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
        ),
        onPress: () => {
          closeMenu();
          router.replace('/stats');
        },
      },
      {
        // 中间的添加按钮
        key: 'add' as const,
        label: '',
        icon: (color: string) => (
          <View 
            className={`w-12 h-12 rounded-full justify-center items-center ${isAddMenuOpen ? 'bg-zinc-600' : 'bg-primary'}`}
            style={{ transform: [{ rotate: isAddMenuOpen ? '45deg' : '0deg' }] }} // 简单的旋转动画效果
          >
            <MaterialIcons name="add" size={29} color="#fff" />
          </View>
        ),
        onPress: () => {
          // 切换菜单状态
          setAddMenuOpen((prev) => !prev);
        },
      },
      {
        key: 'ledgers' as const,
        label: '账本',
        icon: (color: string) => (
          <MaterialIcons name="library-books" size={24} color={color} />
        ),
        onPress: () => {
          closeMenu();
          router.replace('/ledgers');
        },
      },
      {
        key: 'profile' as const,
        label: '我的',
        icon: (color: string) => (
          <MaterialIcons name="person" size={24} color={color} />
        ),
        onPress: () => {
          closeMenu();
          router.replace('/profile');
        },
      },
    ],
    [pathname, isAddMenuOpen, theme.colors.primary] // 添加依赖
  );

  return (
    <>
      {/* 新增：全屏透明遮罩，用于点击外部关闭菜单 */}
      {isAddMenuOpen && (
        <Pressable
          className="absolute left-0 right-0 z-40 bg-black/20"
          style={{ 
            top: -screenHeight, // 延伸到顶部覆盖全屏
            bottom: 0 
          }}
          onPress={closeMenu}
        />
      )}

      {/* 新增：弹出的功能菜单 */}
      {isAddMenuOpen && (
        <View 
          className="absolute left-0 right-0 items-center z-50"
          style={{ bottom: 80 + insets.bottom }} // 位于底部导航栏上方
        >
          <View className="flex-row bg-card rounded-2xl p-4 shadow-xl border border-border gap-6">
            {/* 按钮 1：记一笔 */}
            <Pressable 
              className="items-center justify-center gap-2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeMenu();
                router.navigate('/transaction/add/');
              }}
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
              </View>
              <Text className="text-xs font-medium text-text">记一笔</Text>
            </Pressable>

            {/* 分割线 */}
            <View className="w-[1px] h-full bg-border" />

            {/* 按钮 2：AI 助手 */}
            <Pressable 
              className="items-center justify-center gap-2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeMenu();
                // 假设你的 AI 页面路由是 /ai 或 /chat，请根据实际情况修改
                router.navigate('/ai'); 
              }}
            >
              <View className="w-12 h-12 rounded-full bg-purple-500/10 items-center justify-center">
                <MaterialCommunityIcons name="robot" size={24} color="#a855f7" />
              </View>
              <Text className="text-xs font-medium text-text">AI助手</Text>
            </Pressable>
          </View>
          
          {/* 小三角箭头指向下方 (可选装饰) */}
          <View 
            className="w-4 h-4 bg-card border-r border-b border-border absolute -bottom-2" 
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
      )}

      {/* 原有的底部导航栏 */}
      <View
        className="flex-row items-center justify-between px-2 bg-card border-t border-border z-50"
        style={{
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        }}
      >
        {items.map((item) => {
          const isActive = active === item.key;
          const color = isActive ? theme.colors.primary : theme.colors.text;
          return (
            <Pressable
              key={item.key}
              className="flex-1 items-center justify-center"
              android_ripple={{ color: '#e5e5ea' }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                item.onPress();
              }}
            >
              {item.key === 'add' ? (
                item.icon(color)
              ) : (
                <View className="items-center justify-center">
                  {item.icon(color)}
                  <Text
                    className="mt-1 text-xs"
                    style={{ color }}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}