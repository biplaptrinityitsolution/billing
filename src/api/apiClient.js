// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !! IMPORTANT !!
// Replace with the actual IP address or domain of your backend server.
// For development, if running on a physical device, this must be your computer's IP.
// If using an emulator, 'http://10.0.2.2:3000' (Android) or 'http://localhost:3000' (iOS)
// Make sure your backend server is running and accessible from your device/emulator.
export const API_BASE_URL = 'http://YOUR_BACKEND_IP_OR_DOMAIN:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token to outgoing requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor to handle token expiration/invalidity
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Example: If the server responds with a 401 Unauthorized, maybe logout the user
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request. Token might be expired or invalid.');
      // You might want to dispatch a logout action here from your AuthContext
      // This is more complex as it breaks the context-API separation slightly.
      // For now, let AuthContext handle its own logout on explicit action.
    }
    return Promise.reject(error);
  }
);


export default apiClient;