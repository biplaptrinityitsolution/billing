// src/navigation/DashboardStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ProductFormScreen from '../screens/admin/ProductFormScreen';
import CategoryManagementScreen from '../screens/admin/CategoryManagementScreen';
import AddEditCategoryScreen from '../screens/admin/AddEditCategoryScreen';
import EmployeeManagementScreen from '../screens/admin/EmployeeManagementScreen';
import AddEditEmployeeScreen from '../screens/admin/AddEditEmployeeScreen';
import { StyleSheet, Text, View, Platform, TouchableOpacity, StatusBar } from 'react-native'; // Import StatusBar
// Removed LinearGradient as it doesn't fit the desired aesthetic
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Modern custom header, with optional back button, subtitle and proper alignment
function ModernHeader({ title, subtitle, canGoBack }) {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}> {/* Changed to View for solid background */}
      <View style={styles.headerContent}>
        {/* Back button on left */}
        {canGoBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go Back"
          >
            <ArrowLeft size={24} color="#2C3E50" /> {/* Icon color matching theme */}
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        {/* Main title and subtitle */}
        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.backButtonPlaceholder} /> {/* Align right side */}
      </View>
    </View>
  );
}

// Apply padding to avoid overlap, and provide space for custom header
function withHeaderSafeArea(ScreenComponent, hasCustomHeader = true) {
  // Calculate dynamic header height
  const HEADER_HEIGHT_IOS = 100 + (Platform.OS === 'ios' ? 44 : 0); // Approx height for title/subtitle + safe area
  const HEADER_HEIGHT_ANDROID = 80 + StatusBar.currentHeight; // Approx height for title/subtitle + status bar

  const headerHeight = Platform.select({
    ios: HEADER_HEIGHT_IOS,
    android: HEADER_HEIGHT_ANDROID,
  });

  return (props) => (
    <View style={{ flex: 1, backgroundColor: '#E7FCEA', paddingTop: hasCustomHeader ? headerHeight : 0 }}>
      <ScreenComponent {...props} />
    </View>
  );
}

// Centralized options with modern look and subtitle
const modernOptions = (title, subtitle = "Manage your business with ease") => ({
  headerShown: true,
  headerTransparent: true, // Keep transparent so our custom header is visible below
  header: ({ navigation, back }) => (
    <ModernHeader title={title} subtitle={subtitle} canGoBack={!!back} />
  ),
  headerTitle: '', // Empty headerTitle to hide default title
  headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  animation: 'slide_from_right', // A common navigation animation
  animationTypeForReplace: 'push',
});

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Default to no header, override for specific screens
        contentStyle: { backgroundColor: '#E7FCEA' }, // Consistent background
        animation: 'slide_from_right', // Consistent animation
      }}
    >
      {/* AdminDashboardScreen will manage its own header/top section */}
      <Stack.Screen
        name="AdminDashboardMain"
        component={AdminDashboardScreen} // No need for withHeaderSafeArea here as it draws its own header
      />
      <Stack.Screen
        name="ProductForm"
        component={withHeaderSafeArea(ProductFormScreen)}
        options={modernOptions('Add / Edit Product', 'Create new products or make changes')}
      />
      <Stack.Screen
        name="CategoryManagement"
        component={withHeaderSafeArea(CategoryManagementScreen)}
        options={modernOptions('Manage Categories', 'Organize your inventory effortlessly')}
      />
      <Stack.Screen
        name="AddEditCategory"
        component={withHeaderSafeArea(AddEditCategoryScreen)}
        options={modernOptions('Add / Edit Category', 'Create or update product categories')}
      />
      <Stack.Screen
        name="EmployeeManagement"
        component={withHeaderSafeArea(EmployeeManagementScreen)}
        options={modernOptions('Manage Employees', 'View & edit employee details')}
      />
      <Stack.Screen
        name="AddEditEmployee"
        component={withHeaderSafeArea(AddEditEmployeeScreen)}
        options={modernOptions('Add / Edit Employee', 'Add or update employee profiles')}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF', // Solid white background
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    // Consistent shadow from login formCard or splash logoCircle
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight, // Adjusted for status bar and general height
    paddingBottom: 20, // Reduced padding
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48, // Minimum height for content
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#FFF8F0', // Consistent cream background for icon containers
    // Consistent shadow from login formCard or splash logoCircle
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, // Smaller shadow for button
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  backButtonPlaceholder: {
    width: 42,
    height: 42,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 22, // Adjusted font size
    fontWeight: 'bold', // Stronger bold
    color: '#2C3E50', // Darker text for consistency
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 2,
    // Removed textShadow
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500', // Lighter weight
    color: '#7F8C8D', // Lighter grey for subtitle
    letterSpacing: 0.1,
    textAlign: 'center',
    marginTop: 0,
  },
});