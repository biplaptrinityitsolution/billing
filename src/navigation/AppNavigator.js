// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import MainTabs from './MainTabs';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isAuthInitializing } = useContext(AuthContext);

  React.useEffect(() => {
    // This effect runs whenever userToken changes
    if (userToken) {
      console.log('User is authenticated:', userToken);
      // Place side effects related to login here, if needed
    } else {
      console.log('User is not authenticated.');
      // Place side effects for logout or no session, if needed
    }
  }, [userToken]);

  console.log('AppNavigator userToken:', userToken);

  if (isAuthInitializing) {
    // Only show SplashScreen while checking initial authentication/session restore
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}