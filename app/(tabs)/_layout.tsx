import { AppText as Text } from '../../src/components/common/AppText';
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/hooks/useAuth';
import { LoadingView } from '../../src/components/common/LoadingView';

// ── Emoji icon ────────────────────────────────────────────────────────────────
function TabIconEmoji({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={[styles.emoji, focused && styles.emojiActive]}>{emoji}</Text>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  // Tab bar height + device navigation bar (gesture nav or 3-button nav)
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: insets.bottom + 4,
          },
        ],
        tabBarActiveTintColor: COLORS.green.main,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Vườn',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/image1.png')}
              style={[
                { width: 24, height: 24, borderRadius: 12, opacity: 0.5 },
                focused && { opacity: 1 }
              ]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Nhiệm vụ',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/task.png')}
              style={[
                { width: 24, height: 24, opacity: 0.5 },
                focused && { opacity: 1 }
              ]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Cây thật',
          tabBarIcon: ({ focused }) => (
            <TabIconEmoji emoji="📸" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/diary.png')}
              style={[
                { width: 24, height: 24, opacity: 0.5 },
                focused && { opacity: 1 }
              ]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/profile.png')}
              style={[
                { width: 24, height: 24, opacity: 0.5 },
                focused && { opacity: 1 }
              ]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabItem: {
    paddingTop: 2,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  emojiActive: {
    opacity: 1,
  },
});
