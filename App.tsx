// App.js
import 'react-native-gesture-handler'; // !! IMPORTANT: Must be at the very top for React Navigation !!
import React from 'react';
import { AuthProvider, AlertProvider } from './src/context/AuthContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { BillingProvider } from './src/context/BillingContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <LanguageProvider>
    <AlertProvider>
      <NotificationProvider>
        <InventoryProvider>
          <BillingProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </BillingProvider>
        </InventoryProvider>
      </NotificationProvider>
    </AlertProvider>
    </LanguageProvider>
  );
}

export default App;