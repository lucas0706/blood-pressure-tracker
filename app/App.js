import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { initializeDatabase, getPreferencia } from '../services/DatabaseService';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BiometricLock from '../components/BiometricLock';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Registro',
          tabBarLabel: 'Registro',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Historial',
          tabBarLabel: 'Historial',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reportes',
          tabBarLabel: 'Reportes',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          tabBarLabel: 'Configuración',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeDatabase();
        
        // Verificar si la autenticación biométrica está habilitada
        const biometricEnabled = await getPreferencia('biometric_enabled', 'false');
        setIsBiometricEnabled(biometricEnabled === 'true');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isBiometricEnabled) {
    return <BiometricLock onUnlock={() => setIsBiometricEnabled(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
