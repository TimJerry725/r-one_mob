import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MapScreen } from './src/screens/MapScreen';
import { AssetScanScreen } from './src/screens/AssetScanScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for other tabs
const PlaceholderScreen = () => {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

function BottomTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 0,
        }
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="Work"
        component={ProjectDetailScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="r-vision"
        component={AssetScanScreen}
        options={{
          tabBarIcon: () => (
            <View style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <Ionicons name="qr-code" size={24} color={colors.white} />
            </View>
          ),
          tabBarLabelStyle: {
            color: colors.primary,
            fontWeight: '700',
          }
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('AssetScan');
          },
        })}
      />
      <Tab.Screen
        name="Search"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="TaskDetails" component={TaskDetailScreen} />
        <Stack.Screen name="AssetScan" component={AssetScanScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  }
});
