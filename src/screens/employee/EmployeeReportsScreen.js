import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import {
  User,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Package, // For top selling items
  ChevronRight,
  BarChart3, // For overview section (if a chart was implemented)
  Download
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EmployeeReportsScreen() {
  const navigation = useNavigation();
  const { userName } = useContext(AuthContext);
  const alertCtx = useContext(AlertContext);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // --- Mock Employee Data (replace with real data from API/Context) ---
  const employeeStats = {
    totalSales: '$15,432',
    transactionsCount: '187',
    commissionEarned: '$1,234',
    avgSaleValue: '$82.55',
    salesTrend: '+5.7%', // This could be based on a period
    isSalesTrendPositive: true,
  };

  const recentTransactions = [
    { id: '#TRX-001', customer: 'Alice G.', amount: '$75.00', time: '15m ago', status: 'Completed' },
    { id: '#TRX-002', customer: 'Bob L.', amount: '$120.50', time: '1h ago', status: 'Pending' },
    { id: '#TRX-003', customer: 'Charlie K.', amount: '$45.20', time: '3h ago', status: 'Completed' },
    { id: '#TRX-004', customer: 'David P.', amount: '$99.99', time: '5h ago', status: 'Completed' },
  ];

  const topSellingItems = [
    { name: 'Coffee Mug Deluxe', sales: '$2,100', units: '50 units' },
    { name: 'Espresso Maker Pro', sales: '$1,850', units: '35 units' },
    { name: 'Organic Tea Blend', sales: '$1,500', units: '28 units' },
  ];
  // --- End Mock Data ---

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#28A745'; // Green
      case 'Pending': return '#FFC107'; // Orange
      default: return '#7F8C8D';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, you would fetch updated data here
    setTimeout(() => {
      setRefreshing(false);
      alertCtx.showAlert({
        title: 'Reports Refreshed',
        message: 'Your latest sales data is now available.',
        type: 'info'
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]} // Adjust for safe area
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2C3E50']} // Themed refresh indicator
            tintColor="#2C3E50"
          />
        }
      >
        {/* Welcome Section */}
        <Animatable.View animation="fadeIn" delay={100} style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeIconContainer}>
              <User size={32} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeGreeting}>Hello, {userName || 'Employee'}! 👋</Text>
              <Text style={styles.welcomeMessage}>
                Your personal sales performance report.
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Key Performance Indicators (KPIs) */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <DollarSign size={20} color="#28A745" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{employeeStats.totalSales}</Text>
              <Text style={styles.statLabel}>Total Sales</Text>
              <View style={styles.statChangeContainer}>
                {employeeStats.isSalesTrendPositive ? (
                  <ArrowUpRight size={14} color="#28A745" strokeWidth={3} />
                ) : (
                  <ArrowDownRight size={14} color="#E74C3C" strokeWidth={3} />
                )}
                <Text style={[
                  styles.statChange,
                  { color: employeeStats.isSalesTrendPositive ? '#28A745' : '#E74C3C' }
                ]}>
                  {employeeStats.salesTrend}
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Receipt size={20} color="#4A90E2" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{employeeStats.transactionsCount}</Text>
              <Text style={styles.statLabel}>Total Bills</Text>
              <View style={styles.statChangeContainer}>
                <Text style={styles.statChangeLabel}>Avg Value:</Text>
                <Text style={[styles.statChange, { color: '#2C3E50' }]}>
                  {employeeStats.avgSaleValue}
                </Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bills</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {recentTransactions.length === 0 ? (
              <View style={styles.emptyListState}>
                <Text style={styles.emptyListText}>No recent transactions.</Text>
              </View>
            ) : (
              recentTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.listItemCard(index, recentTransactions.length)}
                  activeOpacity={0.7}
                  // Assuming 'BillDetails' route exists in your navigation stack
                  onPress={() => navigation.navigate('BillDetails', { billId: transaction.id })}
                >
                  <View style={styles.listItemIconContainer}>
                    <Receipt size={20} color="#2C3E50" strokeWidth={2.5} />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle} numberOfLines={1} ellipsizeMode='tail'>{transaction.customer}</Text>
                    <Text style={styles.listItemSubtitle} numberOfLines={1} ellipsizeMode='tail'>{transaction.id} - {transaction.time}</Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemAmount}>₹{transaction.amount}</Text>
                    <View style={[styles.listItemStatusBadge, { backgroundColor: getStatusColor(transaction.status) + '15' }]}>
                      <Text style={[styles.listItemStatusText, { color: getStatusColor(transaction.status) }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animatable.View>

        {/* Top Selling Items */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Selling Items</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {topSellingItems.length === 0 ? (
              <View style={styles.emptyListState}>
                <Text style={styles.emptyListText}>No top selling items yet.</Text>
              </View>
            ) : (
              topSellingItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.listItemCard(index, topSellingItems.length)}
                  activeOpacity={0.7}
                  onPress={() => alertCtx.showAlert({ title: 'Item Details', message: `Details for ${item.name}`, type: 'info' })}
                >
                  <View style={styles.listItemIconContainer}>
                    <Package size={20} color="#2C3E50" strokeWidth={2.5} />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>
                    <Text style={styles.listItemSubtitle} numberOfLines={1} ellipsizeMode='tail'>{item.units} sold</Text>
                  </View>
                  <Text style={styles.listItemAmount}>₹{item.sales}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animatable.View>

        {/* Quick Actions / Export */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButtonLarge}
            onPress={() => alertCtx.showAlert({ title: 'Export Data', message: 'Preparing your sales data for export.', type: 'info' })}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonLargeContent}>
              <Download size={24} color="#fff" strokeWidth={2.5} />
              <Text style={styles.actionButtonLargeText}>Export My Sales Data</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background color
    position: 'relative',
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
    paddingTop: 20, // Initial padding from the top, below where a fixed header would be
    paddingHorizontal: 20, // General horizontal padding for content
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF8F0', // Cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8F9FA', // Light grey background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginRight: 4,
  },
  viewAllIcon: {
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15, // Gap between cards
    marginBottom: 20,
  },
  statCard: {
    width: (width / 2) - 20 - 15/2, // (width - 2*horizontalPadding - gap) / 2
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
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
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 6,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  statChange: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 8,
  },
  listItemCard: (index, total) => ({
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: index === total - 1 ? 0 : 1, // No border for last item
    borderBottomColor: '#E8E8E8', // Light separator
  }),
  listItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  listItemStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listItemStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyListState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA', // Light background for empty state in list card
    borderRadius: 20,
  },
  emptyListText: {
    fontSize: 15,
    color: '#7F8C8D',
    marginTop: 10,
  },
  actionButtonLarge: {
    backgroundColor: '#2C3E50', // Primary dark button
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  actionButtonLargeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionButtonLargeText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});