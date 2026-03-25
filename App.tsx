import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  RedHatDisplay_400Regular,
  RedHatDisplay_500Medium,
  RedHatDisplay_600SemiBold,
  RedHatDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/red-hat-display';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SessionProvider } from './src/context/SessionContext';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MapScreen } from './src/screens/MapScreen';
import { AssetScanScreen } from './src/screens/AssetScanScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TAB_ICONS = {
  Map: 'map',
  Work: 'briefcase',
  Scan: 'qr-code',
  Profile: 'person',
} as const;

const PlaceholderScreen = () => {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabBarRow}>
        <View
          style={[
            styles.tabBarMain,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : typeof options.title === 'string'
                  ? options.title
                  : route.name;
            const iconName = TAB_ICONS[route.name as keyof typeof TAB_ICONS];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabButton,
                  isFocused && { backgroundColor: colors.primary + '14' },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.getParent()?.navigate('CreateTask')}
          style={[
            styles.addButton,
            {
              backgroundColor: colors.primary,
              borderColor: isDark ? colors.surface : colors.white,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
          title: 'Map',
        }}
      />
      <Tab.Screen
        name="Work"
        component={ProjectDetailScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={24} color={color} />,
          title: 'Work',
        }}
      />
      <Tab.Screen
        name="Scan"
        component={PlaceholderScreen}
        options={{
          title: 'r-vision',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('AssetScan');
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="TaskDetails" component={TaskDetailScreen} />
        <Stack.Screen name="AssetScan" component={AssetScanScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen
          name="CreateTask"
          component={CreateTaskScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    RedHatDisplay_400Regular,
    RedHatDisplay_500Medium,
    RedHatDisplay_600SemiBold,
    RedHatDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.bootScreen} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <AppNavigator />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  tabBarMain: {
    flex: 1,
    minHeight: 78,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    minHeight: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'RedHatDisplay_700Bold',
    fontSize: 11,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },
  bootScreen: {
    flex: 1,
    backgroundColor: '#0B141B',
  },
});
