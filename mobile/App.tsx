import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';

// Simplified navigation without bottom tabs for now
const Stack = createStackNavigator();
const queryClient = new QueryClient();

function MainApp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <Text style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 'bold' }}>VaultGuard</Text>
      <Text style={{ color: '#64748b', marginTop: 10, textAlign: 'center' }}>
        Enterprise Crypto Security Platform
      </Text>
      <Text style={{ color: '#64748b', marginTop: 20, textAlign: 'center', paddingHorizontal: 40 }}>
        Main app features coming soon. Authentication system is fully implemented.
      </Text>
    </View>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        setIsFirstLaunch(onboardingCompleted !== 'true');
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(true);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) {
    // Loading screen while checking first launch
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? "Onboarding" : "Login"}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0ea5e9',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="MainApp"
            component={MainApp}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
