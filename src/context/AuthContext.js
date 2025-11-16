// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/shared/CustomAlert';
import { loginUserApi } from '../api/auth'; // Import your mock/real login API

export const AuthContext = createContext();

// Alert context for global alert state
export const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertOptions, setAlertOptions] = useState({ visible: false });
  const showAlert = useCallback((options) => {
    setAlertOptions({...options, visible: true });
  }, []);
  const hideAlert = useCallback(() => setAlertOptions(a => ({ ...a, visible: false })), []);
  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert {...alertOptions} onClose={hideAlert} />
    </AlertContext.Provider>
  );
}

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // True only for login/logout progress
  const [isAuthInitializing, setIsAuthInitializing] = useState(true); // True for initial app boot splash

  // Function to handle login process
  const login = async (phone, password) => {
    setIsLoading(true);
    try {
      const response = await loginUserApi(phone, password);

      console.log("loginUserApi response:", response);

      const { token, user } = response?.data || {};

      const { userRole: role, userId, userName: username } = user || {};

      console.log("useridlogin",userId);

      await AsyncStorage.setItem('userToken', token );
      await AsyncStorage.setItem('userRole', role );
      await AsyncStorage.setItem('userName', username );
      await AsyncStorage.setItem('userID', String(userId));

      setUserToken(token);
      setUserRole(role);
      setUserName(username);
      setUserID(String(userId));
      
      return { success: true };
    } catch (e) {
      console.error('Login failed:', e.response?.data?.message || e.message);
      setUserToken(null);
      setUserRole(null);
      setUserName(null);
      setUserID(null);
      return {
        success: false,
        error: e.response?.data?.message || 'Something went wrong. Please check your network or credentials.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userID');
      setUserToken(null);
      setUserRole(null);
      setUserName(null);
      setUserID(null);  

      // No in-context alert here
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const minimumSplashTime = new Promise(resolve => setTimeout(resolve, 4000));
      let storedToken = null;
      let storedRole = null;
      let storedUserName = null;
      let storeUserId = null;
      try {
        await Promise.all([
          (async () => {
            storedToken = await AsyncStorage.getItem('userToken');
            storedRole = await AsyncStorage.getItem('userRole');
            storedUserName = await AsyncStorage.getItem('userName');
            storeUserId = await AsyncStorage.getItem('userID');
            console.log('Restored userID:', storeUserId);
          })(),
          minimumSplashTime
        ]);
        if (storedToken && storedRole) {
          setUserToken(storedToken);
          setUserRole(storedRole);
          setUserName(storedUserName);
          setUserID(storeUserId);
          
        }
      } catch (e) {
        console.error('Failed to restore session or minimum splash time interrupted:', e);
      } finally {
        setIsAuthInitializing(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, userRole, userName, isLoading, isAuthInitializing, login, logout,userID }}>
      {children}
    </AuthContext.Provider> 
  );
};