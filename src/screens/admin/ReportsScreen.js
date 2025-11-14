// src/screens/admin/ReportsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { userName } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState('Month'); // Default to month for better data

  const periods = ['Today', 'Week', 'Month', 'Year'];

  const mainStats = [
    {
      label: 'Total Revenue',
      value: '$45,231',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: '#28A745', // Green for positive
      iconBg: '#FFF8F0' // Consistent cream background
    },
    {
      label: 'Total Sales',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
      color: '#2C3E50', // Dark for general stat
      iconBg: '#FFF8F0'
    },
    {
      label: 'Customers',
      value: '892',
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      color: '#2C3E50',
      iconBg: '#FFF8F0'
    },
    {
      label: 'Products Sold',
      value: '3,421',
      change: '-2.4%',
      isPositive: false,
      icon: Package,
      color: '#E74C3C', // Red for negative
      iconBg: '#FFF8F0'
    },
  ];

  const topProducts = [
    { name: 'Product A', sales: '$12,340', units: '234 units', trend: '+12%', isPositive: true },
    { name: 'Product B', sales: '$9,820', units: '189 units', trend: '+8%', isPositive: true },
    { name: 'Product C', sales: '$7,650', units: '145 units', trend: '+5%', isPositive: true },
    { name: 'Product D', sales: '$6,230', units: '112 units', trend: '-3%', isPositive: false },
  ];

  const employeePerformance = [
    { name: 'John Smith', sales: '$8,920', transactions: 145, badge: '🥇' },
    { name: 'Sarah Johnson', sales: '$7,450', transactions: 128, badge: '🥈' },
    { name: 'Mike Wilson', sales: '$6,890', transactions: 115, badge: '🥉' },
    { name: 'Emma Davis', sales: '$5,670', transactions: 98, badge: '' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header Section (custom, without gradients) */}
      <View style={styles.headerContainer}>

        {/* Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodScrollView}
          contentContainerStyle={styles.periodContainer}
        >
          {periods.map((period, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          {mainStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const trendIcon = stat.isPositive ? ArrowUpRight : ArrowDownRight;
            const trendColor = stat.isPositive ? '#28A745' : '#E74C3C';
            return (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconComponent size={22} color={stat.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statChangeContainer}>
                  <Text style={[styles.statChange, { color: trendColor }]}>
                    <Text>{stat.isPositive ? '▲' : '▼'} {stat.change}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Overview</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={18} color="#2C3E50" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={48} color="#95A5A6" strokeWidth={1.5} />
            <Text style={styles.chartPlaceholderText}>Chart visualization here</Text>
            <Text style={styles.chartPlaceholderSubtext}>Implement with Recharts or Victory Native</Text>
          </View>
        </View>

        {/* Top Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {topProducts.map((product, index) => (
              <View key={index} style={styles.productCard(index, topProducts.length)}>
                <View style={styles.billIconContainer}>
                  <Package size={20} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productUnits}>{product.units}</Text>
                </View>
                <View style={styles.productStats}>
                  <Text style={styles.productSales}>{product.sales}</Text>
                  <View style={[
                    styles.trendBadge,
                    { backgroundColor: product.isPositive ? '#28A74515' : '#E74C3C15' }
                  ]}>
                    <Text style={[
                      styles.trendText,
                      { color: product.isPositive ? '#28A745' : '#E74C3C' }
                    ]}>
                      <Text>{product.isPositive ? '▲' : '▼'} {product.trend.replace('+', '')}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Employee Performance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Employee Performance</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {employeePerformance.map((employee, index) => (
              <View key={index} style={styles.employeeCard(index, employeePerformance.length)}>
                <View style={styles.employeeLeft}>
                  <View style={styles.employeeAvatar}>
                    <Text style={styles.employeeInitial}>{employee.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.employeeInfo}>
                    <View style={styles.employeeNameContainer}>
                      <Text style={styles.employeeName}>{employee.name}</Text>
                      {employee.badge && <Text style={styles.employeeBadge}>{employee.badge}</Text>}
                    </View>
                    <Text style={styles.employeeTransactions}>{employee.transactions} transactions</Text>
                  </View>
                </View>
                <Text style={styles.employeeSales}>{employee.sales}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Calendar size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionText}>Custom Report</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Download size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionText}>Export Data</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA',
    position: 'relative',
    top: -0.8,
    marginBottom: Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight ? StatusBar.currentHeight + 70 : 110),
  },
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
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Keep this for spacing between header text and period selector
  },
  welcomeText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  downloadButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  periodScrollView: {
    // This scroll view ensures horizontal scrollability if many periods are added
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute items evenly
    alignItems: 'center',
    gap: 15, // Spacing between buttons
    // Removed paddingHorizontal here as the parent headerContainer handles it
  },
  periodButton: {
    flex: 1, // Allow buttons to take equal space
    maxWidth: (width - 40 - 30) / 4, // Calculate max width for 4 buttons (40 for screen padding, 30 for 3 gaps of 10)
    paddingVertical: 10,
    paddingHorizontal: 15, // Reduced horizontal padding
    borderRadius: 14,

    backgroundColor: '#F8F9FA', // Inactive background
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF', // Active background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  periodText: {
    fontSize: 13, // Slightly smaller text for compactness
    fontWeight: '600',
    color: '#7F8C8D', // Inactive text color
    textAlign: 'center', // Ensure text is centered
    numberOfLines: 1, // Ensure single line
    ellipsizeMode: 'tail',
  },
  periodTextActive: {
    color: '#2C3E50', // Active text color
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 0,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
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
    marginBottom: 12,
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
  statChange: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartSection: {
    marginHorizontal: 20,
    marginTop: 30,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 15,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 5,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
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
  },
  productCard: (index, total) => ({
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: index === total - 1 ? 0 : 1,
    borderBottomColor: '#E8E8E8',
  }),
  billIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productUnits: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productSales: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  employeeCard: (index, total) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: index === total - 1 ? 0 : 1,
    borderBottomColor: '#E8E8E8',
  }),
  employeeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  employeeInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  employeeBadge: {
    fontSize: 16,
  },
  employeeTransactions: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  employeeSales: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
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
    padding: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
});