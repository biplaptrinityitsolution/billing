// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to easily access authentication context values.
 * Provides userToken, userRole, userName, isLoading, login, and logout functions.
 */
export const useAuth = () => useContext(AuthContext);