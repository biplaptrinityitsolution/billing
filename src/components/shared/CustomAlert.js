import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
// Removed LinearGradient import
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X // For a generic close icon, or use specific ones
} from 'lucide-react-native';

// Define theme-consistent colors
const THEME_COLORS = {
  success: '#28A745', // Green
  error: '#E74C3C',    // Red
  warning: '#FFC107',  // Orange
  info: '#4A90E2',     // Blue
  primaryDark: '#2C3E50', // Main dark text/button
  lightGrey: '#7F8C8D',   // Secondary text
  cream: '#FFF8F0',      // Icon background
  lightBackground: '#F8F9FA', // Light button background
};

// Use Lucide icons for consistency
const THEME_ICONS = {
  success: CheckCircle,
  error: AlertTriangle, // AlertTriangle for errors too, common in modern UI
  warning: AlertTriangle,
  info: Info,
};

export default function CustomAlert({
  visible,
  title = 'Alert',
  message = '',
  onClose,
  onConfirm,
  onCancel,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) {
  const IconComponent = THEME_ICONS[type] || Info;
  const headerColor = THEME_COLORS[type] || THEME_COLORS.info;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={styles.card}>
          <View style={[styles.header, { backgroundColor: THEME_COLORS.cream }]}> {/* Solid cream background */}
            <View style={[styles.iconContainer, { backgroundColor: headerColor + '15' }]}> {/* Tinted icon background */}
              <IconComponent size={24} color={headerColor} /> {/* Type-specific icon color */}
            </View>
            <Text style={[styles.title, { color: THEME_COLORS.primaryDark }]}>{title}</Text> {/* Dark title text */}
          </View>
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onCancel || onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: THEME_COLORS.primaryDark }]} // Primary dark button
              onPress={onConfirm || onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Slightly darker overlay for emphasis
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%', // Make it responsive
    maxWidth: 340, // Max width
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 20, // Consistent roundedness
    overflow: 'hidden',
    // Consistent shadow from your theme (e.g., login formCard)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15, // Slightly more pronounced for a modal
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Adjusted padding
    paddingHorizontal: 20,
    borderBottomWidth: 1, // Subtle border
    borderBottomColor: '#E8E8E8', // Light border
  },
  iconContainer: { // New container for the icon
    width: 40,
    height: 40,
    borderRadius: 12, // Rounded square
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    // Color set dynamically to primaryDark
    fontWeight: 'bold',
    fontSize: 19,
    flex: 1,
  },
  body: {
    paddingVertical: 20, // Adjusted padding
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 15,
    color: THEME_COLORS.lightGrey, // Consistent secondary text color
    textAlign: 'center',
    lineHeight: 22, // Improved readability
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15, // Adjusted padding
    paddingHorizontal: 20, // Adjusted padding
    borderTopWidth: 1,
    borderColor: '#E8E8E8', // Consistent light border
    backgroundColor: '#F8F9FA', // Light background for action bar
  },
  confirmBtn: {
    // Background color set dynamically to primaryDark
    borderRadius: 14, // Consistent roundedness
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 25,
    marginLeft: 10, // Adjusted margin
    // Consistent shadow for primary button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmText: {
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5, // Adjusted letter spacing
  },
  cancelBtn: {
    backgroundColor: THEME_COLORS.lightBackground, // Light button background
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    // Consistent subtle shadow for secondary button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cancelText: {
    color: THEME_COLORS.primaryDark, // Dark text
    fontSize: 15,
    fontWeight: '600', // Slightly bolder
  },
});