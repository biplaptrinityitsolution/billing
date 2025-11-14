// src/context/NotificationContext.js
import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Pizza Margherita is running low (only 5 left)',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'New Order Received',
      message: 'Order #1234 - 2x Burger, 1x Fries for $25.99',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Employee Check-in',
      message: 'John Doe checked in at 9:15 AM',
      type: 'info',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      title: 'Daily Sales Report',
      message: 'Today\'s sales: $1,234.56 (15% above target)',
      type: 'success',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true,
      priority: 'medium'
    },
    {
      id: '5',
      title: 'System Update',
      message: 'App will be updated tonight at 2:00 AM',
      type: 'info',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      priority: 'low'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Show notification modal
  const showNotifications = useCallback(() => {
    setModalVisible(true);
  }, []);

  // Hide notification modal
  const hideNotifications = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Simulate real-time notifications (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add notifications every 30-60 seconds
      if (Math.random() > 0.7) {
        const sampleNotifications = [
          {
            title: 'New Order',
            message: `Order #${Math.floor(Math.random() * 9000) + 1000} received`,
            type: 'success'
          },
          {
            title: 'Stock Alert',
            message: `${['Pizza', 'Burger', 'Fries', 'Salad'][Math.floor(Math.random() * 4)]} running low`,
            type: 'warning'
          },
          {
            title: 'Payment Received',
            message: `Payment of $${(Math.random() * 100 + 10).toFixed(2)} processed`,
            type: 'success'
          }
        ];
        
        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      modalVisible,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      showNotifications,
      hideNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
