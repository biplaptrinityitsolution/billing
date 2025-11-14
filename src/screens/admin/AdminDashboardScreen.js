// src/screens/admin/AdminDashboardScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import NotificationModal from '../../components/shared/NotificationModal';
// Removed LinearGradient as it doesn't fit the desired aesthetic
import { 
  Package, 
  Shapes, 
  Users, 
  BarChart3, 
  Bell, 
  Plus, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  PackageSearch
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { userName } = useContext(AuthContext);
  const { unreadCount, showNotifications } = useContext(NotificationContext);
  const navigation = useNavigation();

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  const dashboardItems = [
    { 
      title: 'Inventory', 
      subtitle: 'Manage Stock & Products',
      icon: Package, 
      screen: 'Inventory', 
      iconColor: '#2C3E50', // Consistent icon color
      iconBg: '#FFF8F0',    // Consistent icon background
    },
    { 
      title: 'Categories', 
      subtitle: 'Organize Item Classifications',
      icon: Shapes, 
      screen: 'CategoryManagement', 
      iconColor: '#2C3E50',
      iconBg: '#FFF8F0',
    },
    { 
      title: 'Employees', 
      subtitle: 'Manage Team Access',
      icon: Users, 
      screen: 'EmployeeManagement', 
      iconColor: '#2C3E50',
      iconBg: '#FFF8F0',
    },
    { 
      title: 'Reports', 
      subtitle: 'View Analytics & Statistics',
      icon: BarChart3, 
      screen: 'Reports', 
      iconColor: '#2C3E50',
      iconBg: '#FFF8F0',
    },
  ];

  const statsData = [
    { label: 'Total Products', value: '1,234', icon: Package, color: '#2C3E50' },
    { label: 'Low Stock', value: '23', icon: AlertCircle, color: '#E74C3C' }, // A subtle alert red
    { label: 'Total Employees', value: '45', icon: Users, color: '#2C3E50' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}!</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={showNotifications}
              activeOpacity={0.7}
            >
              <Bell size={24} color="#2C3E50" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards - Now standalone, using consistent card style */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
        >
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFF8F0' }]}>
                  <IconComponent size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          
          {/* Dashboard Grid - Consistent white cards with subtle shadows */}
          <View style={styles.gridContainer}>
            {dashboardItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItemWrapper}
                  onPress={() => handleNavigation(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dashCard}>
                    <View style={styles.dashCardContent}>
                      <View style={[styles.dashIconBox, { backgroundColor: item.iconBg }]}>
                        <IconComponent size={28} color={item.iconColor} />
                      </View>
                      <View style={styles.dashTextBox}>
                        <Text style={styles.dashCardTitle}>{item.title}</Text>
                        <Text style={styles.dashCardSubtitle}>{item.subtitle}</Text>
                      </View>
                      <ChevronRight size={20} color="#95A5A6" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Actions with Consistent Card Design */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionCard} 
              onPress={() => navigation.navigate('ProductForm')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8F0' }]}>
                  <Plus size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Add New Product</Text>
                  <Text style={styles.quickActionSubtitle}>Create new inventory entry</Text>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard} 
              onPress={() => navigation.navigate('Inventory')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8F0' }]}>
                  <PackageSearch size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Manage Stock Levels</Text>
                  <Text style={styles.quickActionSubtitle}>Review and update inventory</Text>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard} 
              onPress={() => navigation.navigate('Reports')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8F0' }]}>
                  <TrendingUp size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>View Sales Reports</Text>
                  <Text style={styles.quickActionSubtitle}>Access detailed analytics</Text>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Notification Modal */}
      <NotificationModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Matching splash/login background
    position: 'relative',
    // marginBottom should match MainTabs.js tab bar height+padding, and adapt for status bar/platform
    marginBottom: Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight ? StatusBar.currentHeight + 70 : 110),
  },
  // Decorative Circles (from Splash/Login)
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20, // Adjust for status bar
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed to center for better alignment with bell
    marginBottom: 25,
  },
  greeting: {
    fontSize: 18, // Slightly larger
    color: '#2C3E50', // Darker text for consistency
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 32, // Larger and bolder
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF', // White background
    alignItems: 'center',
    justifyContent: 'center',
    // Consistent shadow from login screen logoCircle
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C', // Alert red
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20, // Increased padding
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // More rounded
    padding: 20,
    marginRight: 15,
    minWidth: width * 0.45, // Responsive width
    // Consistent shadow from login formCard
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  statIconContainer: {
    width: 50, // Larger icon container
    height: 50,
    borderRadius: 15, // Slightly rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28, // Larger value
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey for label
    fontWeight: '500',
  },
  mainContent: {
    backgroundColor: 'transparent', // Background is handled by container
    paddingTop: 10, // Adjusted padding
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 18,
    marginTop: 20, // Added more margin for separation
  },
  gridContainer: {
    marginBottom: 30,
  },
  gridItemWrapper: {
    marginBottom: 15,
  },
  dashCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Consistent rounded corners
    padding: 20,
    // Consistent shadow from login formCard
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dashCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18, // Slightly rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  dashTextBox: {
    flex: 1,
  },
  dashCardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  dashCardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D', // Consistent lighter grey
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Consistent rounded corners
    marginBottom: 12,
    // Consistent shadow from login formCard
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15, // Slightly rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#7F8C8D', // Consistent lighter grey
    fontWeight: '500',
  },
});