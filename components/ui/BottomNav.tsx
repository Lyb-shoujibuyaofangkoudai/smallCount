import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
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

  const items = useMemo(
    () => [
      {
        key: 'detail' as const,
        label: '明细',
        icon: (color: string) => (
          <MaterialIcons name="format-list-bulleted" size={24} color={color} />
        ),
        onPress: () => router.replace('/'),
      },
      {
        key: 'stats' as const,
        label: '图表',
        icon: (color: string) => (
          <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
        ),
        onPress: () => router.replace('/stats'),
      },
      {
        key: 'add' as const,
        label: '',
        icon: (color: string) => (
          <View className="w-12 h-12 rounded-full justify-center items-center bg-primary">
            <MaterialIcons name="add" size={29} color="#fff" />
          </View>
        ),
        onPress: () => router.push('/modal'),
      },
      {
        key: 'ledgers' as const,
        label: '账本',
        icon: (color: string) => (
          <MaterialIcons name="library-books" size={24} color={color} />
        ),
        onPress: () => router.replace('/ledgers'),
      },
      {
        key: 'profile' as const,
        label: '我的',
        icon: (color: string) => (
          <MaterialIcons name="person" size={24} color={color} />
        ),
        onPress: () => router.replace('/profile'),
      },
    ],
    [pathname]
  );

  return (
    <View
      className="flex-row items-center justify-between px-2 bg-card border-t border-border"
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
  );
}