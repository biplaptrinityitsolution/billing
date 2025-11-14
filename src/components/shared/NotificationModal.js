// src/components/shared/NotificationModal.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform, // Import Platform for status bar adjustment
  StatusBar, // Import StatusBar for status bar adjustment
} from 'react-native';
// Removed LinearGradient import
import * as Animatable from 'react-native-animatable';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Clock,
  Check,
  MoreVertical,
  CircleDot, // For unread dot, if desired, or keep simple dot
} from 'lucide-react-native';
import { NotificationContext } from '../../context/NotificationContext';

const { width, height } = Dimensions.get('window');

export default function NotificationModal() {
  const {
    notifications,
    modalVisible,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hideNotifications
  } = useContext(NotificationContext);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return '#28A745'; // Green
      case 'warning': return '#FFC107'; // Orange
      case 'error': return '#E74C3C'; // Red
      case 'info': return '#4A90E2'; // Blue
      default: return '#2C3E50'; // Default dark color
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp; // Difference in milliseconds
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`; // Within a month
    
    // For older notifications, display a simplified date
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Optionally, navigate to a specific screen based on notification data
    // For now, just mark as read.
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId)
        }
      ]
    );
  };

  const renderNotification = (notification, index) => {
    const IconComponent = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);
    const isUnread = !notification.read;

    return (
      <Animatable.View
        key={notification.id}
        animation="fadeInUp"
        delay={index * 80} // Slightly faster animation for list items
        style={[styles.notificationItem, isUnread && styles.unreadNotificationBorder]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationPress(notification)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationLeft}>
            <View style={styles.notificationIconContainer}> {/* Consistent icon container */}
              <IconComponent size={20} color={iconColor} strokeWidth={2.5} />
            </View>
            <View style={styles.notificationText}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, isUnread && styles.unreadText]} numberOfLines={1} ellipsizeMode='tail'>
                  {notification.title}
                </Text>
                {isUnread && (
                  <View style={styles.unreadDot} /> // Small dot for unread status
                )}
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2} ellipsizeMode='tail'>
                {notification.message}
              </Text>
              <View style={styles.notificationTimeContainer}>
                  <Clock size={12} color="#95A5A6" />
                  <Text style={styles.notificationTimeText}>
                    {formatTime(notification.timestamp)}
                  </Text>
                </View>
            </View>
          </View>

          <View style={styles.notificationActions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(notification.id)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#7F8C8D" /> {/* Darker grey for action icon */}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hideNotifications}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header (White, with shadow) */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Bell size={24} color="#2C3E50" /> {/* Dark bell icon */}
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.actionButton} // Reusing action button style
                  onPress={markAllAsRead}
                  activeOpacity={0.7}
                >
                  <Check size={18} color="#2C3E50" /> {/* Dark check icon */}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton} // Reusing action button style
                onPress={hideNotifications}
                activeOpacity={0.7}
              >
                <X size={24} color="#2C3E50" /> {/* Dark X icon */}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.length === 0 ? (
            <Animatable.View
              animation="fadeInUp"
              style={styles.emptyState}
            >
              <View style={styles.emptyIconContainer}> {/* Consistent empty state icon container */}
                <Bell size={48} color="#95A5A6" />
              </View>
              <Text style={styles.emptyStateTitle}>No Notifications Yet</Text>
              <Text style={styles.emptyStateMessage}>
                You're all caught up! New notifications will appear here.
              </Text>
            </Animatable.View>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((notification, index) =>
                renderNotification(notification, index)
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background
  },
  header: {
    backgroundColor: '#FFFFFF', // White background
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    borderTopLeftRadius: 28, // Consistent rounded corners
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginTop: 6,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginLeft: 12,
  },
  headerBadge: {
    backgroundColor: '#E74C3C', // Alert red for unread count
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 28, // Ensure enough width for 2-3 digits
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: { // Replaces markAllButton and closeButton
    width: 40,
    height: 40,
    borderRadius: 12, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10, // Spacing between buttons
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20, // Add padding to push content down from header
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80, // Reduced padding, centered
    paddingHorizontal: 40,
  },
  emptyIconContainer: { // Consistent empty state icon container
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA', // Light grey for background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    paddingHorizontal: 20, // Padding for the list itself
  },
  notificationItem: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 16, // Consistent roundedness
    marginBottom: 12,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // Slightly less pronounced shadow for list items
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  unreadNotificationBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2', // A blue for unread indicator
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center', // Align centrally
    padding: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start', // Align icon with text start
  },
  notificationIconContainer: { // Consistent icon container
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF8F0', // Cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align title and dot
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50', // Dark text
    flex: 1, // Allow title to take space
    marginRight: 8,
  },
  unreadText: {
    fontWeight: 'bold', // Bold text for unread
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C', // Red dot for unread
    marginLeft: 8, // Space from title
  },
  notificationMessage: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey for message
    lineHeight: 20,
    marginBottom: 8, // Space before time
  },
  notificationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTimeText: {
    fontSize: 12,
    color: '#95A5A6', // Even lighter grey for time
    marginLeft: 4,
  },
  notificationActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10, // Space from message
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12, // Rounded square
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA', // Light grey background
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});