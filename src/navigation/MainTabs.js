// src/navigation/MainTabs.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet, View, Platform, StatusBar, Dimensions } from 'react-native';
// No LinearGradient import for pure transparency/blur
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  TrendingUp, 
  Package, 
  Settings,
  Wrench,
  LogOut 
} from 'lucide-react-native';

import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Import Stack Navigators
import DashboardStack from './DashboardStack';
import BillingStack from './BillingStack';

// Import placeholder screens
import ReportsScreen from '../screens/admin/ReportsScreen';
import EmployeeReportsScreen from '../screens/employee/EmployeeReportsScreen';
import InventoryScreen from '../screens/admin/InventoryScreen';
import ProductManagementScreen from '../screens/employee/ProductManagementScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import UpdateProfileScreen from '../screens/common/UpdateProfileScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingCartButton from '../components/shared/FloatingCartButton';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { userRole, userName, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Custom header as before
  function CustomTabHeader({ title }) {
    return (
      <View style={styles.headerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.headerContent}>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerPageTitle}>{title}</Text>
            <Text style={styles.headerGreeting}>{t('common.hello')}, {userName || 'User'}! 👋</Text>
          </View>
          <TouchableOpacity onPress={logout} activeOpacity={0.85} style={styles.logoutButtonContainer}>
            <View style={styles.logoutButton}>
              <LogOut size={20} color="#2C3E50" strokeWidth={2.5} />
              <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Helper to get consistent header options across tabs
  const getHeaderOptions = (title) => ({
    headerShown: true,
    headerTransparent: true,
    header: () => <CustomTabHeader title={title} />,
    headerTitle: '',
    headerStyle: { backgroundColor: 'transparent' },
  });

  return (
    <>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1abc9c', // Highlight color
        tabBarInactiveTintColor: '#ffffff',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.floatingTabBar,
          {
            bottom: 18 + (insets.bottom || 0),
            left: 18,
            right: 18,
            height: 70,
            paddingBottom: 10,

          paddingTop: 10,
          marginLeft: 6,
          marginRight: 6,
          paddingLeft: 6,
          paddingRight: 6,
          }
        ],
        tabBarBackground: () => (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(38, 50, 56, 0.68)', // dark transparent glassy
              borderRadius: 28,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 7 },
              shadowOpacity: 0.17,
              shadowRadius: 18,
              elevation: 10,
              borderWidth: 1,
              borderColor: 'rgba(200,200,200,0.06)',
            }}
          />
        ),
        tabBarItemStyle: styles.tabBarItem,

        // Icon rendering logic with floating/modern shape
        tabBarIcon: ({ color, size, focused }) => {
          let IconComponent;
          switch (route.name) {
            case 'Dashboard': IconComponent = Home; break;
            case 'Billing': IconComponent = ShoppingCart; break;
            case 'Reports': IconComponent = BarChart3; break;
            case 'My Reports': IconComponent = TrendingUp; break;
            case 'Inventory': IconComponent = Package; break;
            case 'Manage': IconComponent = Wrench; break;
            case 'Settings': IconComponent = Settings; break;
            default: IconComponent = Home;
          }
          return (
            <View style={[
              styles.iconBubble,
              focused ? styles.iconBubbleActive : null
            ]}>
              <IconComponent
                size={focused ? size + 4 : size}
                color={focused ? "#FFF" : color}
                strokeWidth={2.6}
              />
            </View>
          );
        },
      })}
    >
      {userRole === 'admin' && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{ headerShown: false }} 
        />
      )}

      <Tab.Screen
        name="Billing"
        component={BillingStack}
        options={getHeaderOptions(t('navigation.billing'))}
      />

      {userRole === 'admin' ? (
        <Tab.Screen
          name="Reports"
          component={({ navigation }) => (
            <View style={styles.screenPadding}>
              <ReportsScreen />
            </View>
          )}
          options={getHeaderOptions(t('navigation.reports'))}
        />
      ) : (
        <Tab.Screen
          name="My Reports"
          component={({ navigation }) => (
            <View style={styles.screenPadding}>
              <EmployeeReportsScreen />
            </View>
          )}
          options={getHeaderOptions(t('navigation.myReports'))}
        />
      )}

      {userRole === 'admin' && (
        <Tab.Screen
          name="Inventory"
          component={({ navigation }) => (
            <View style={styles.screenPadding}>
              <InventoryScreen />
            </View>
          )}
          options={getHeaderOptions(t('navigation.inventory'))}
        />
      )}

      {userRole === 'ROLE_USER' && (
        <Tab.Screen
          name="Manage"
          component={ProductManagementScreen}
          options={getHeaderOptions(t('navigation.manage'))}
        />
      )}

      <Tab.Screen
        name="Settings"
        component={({ navigation }) => (
          <View style={styles.screenPadding}>
            <SettingsScreen />
          </View>
        )}
        options={getHeaderOptions(t('navigation.settings'))}
      />

      {/* <Tab.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ headerShown: true }} /> */}
    </Tab.Navigator>
    <FloatingCartButton />
    </>
  );
}

const styles = StyleSheet.create({
  // Custom Header Styles (unchanged)
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerPageTitle: {
    fontSize: 22,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerGreeting: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  logoutButtonContainer: {
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 115,
    height: 46,
    backgroundColor: '#FFF8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#2C3E50',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },

  // Floating & Modern Tab Bar
  floatingTabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 15,
    borderRadius: 38,
    backgroundColor: 'rgba(38,50,56,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.06)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
    borderTopWidth: 0,
    zIndex: 18,
    overflow: 'hidden',
    
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
    marginBottom: 2,
    color: "#ffffff",
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 38,
    paddingVertical: 0,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 18,
  },
  iconBubble: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.12s',
  },
  iconBubbleActive: {
    backgroundColor: 'rgba(26, 188, 156, 0.85)', // Accent with translucency when active
  },
  screenPadding: {
    flex: 1,
    backgroundColor: '#E7FCEA',
    paddingTop: Platform.OS === 'ios' ? 120 : StatusBar.currentHeight + 80,
  }
});