// src/screens/employee/BillingScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import {
  Plus,
  ShoppingCart,
  FileText,
  Clock,
  TrendingUp,
  Receipt,
  DollarSign,
  ChevronRight
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function BillingScreen() {
  const { userName } = useContext(AuthContext);
  const alertCtx = useContext(AlertContext);
  const navigation = useNavigation();

  const handleStartBill = () => {
    navigation.navigate('NewBill');
  };

  const quickStats = [
    { label: 'Today\'s Sales', value: '$1,245', icon: DollarSign, color: '#2C3E50' },
    { label: 'Bills Today', value: '24', icon: Receipt, color: '#2C3E50' },
    { label: 'Pending', value: '3', icon: Clock, color: '#E74C3C' },
  ];

  const recentBills = [
    { id: '#INV-001', customer: 'John Doe', amount: '$125.00', time: '10 mins ago', status: 'Completed', statusColor: '#28A745' },
    { id: '#INV-002', customer: 'Jane Smith', amount: '$89.50', time: '25 mins ago', status: 'Completed', statusColor: '#28A745' },
    { id: '#INV-003', customer: 'Mike Johnson', amount: '$234.00', time: '1 hour ago', status: 'Pending', statusColor: '#FFC107' },
    { id: '#INV-004', customer: 'Alice Brown', amount: '$55.00', time: '2 hours ago', status: 'Completed', statusColor: '#28A745' },
    { id: '#INV-005', customer: 'Robert White', amount: '$310.00', time: '3 hours ago', status: 'Completed', statusColor: '#28A745' },
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
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconComponent size={18} color={stat.color} strokeWidth={2.5} /> {/* Smaller icon */}
                </View>
                <Text style={styles.statValue} numberOfLines={1} ellipsizeMode='tail'>{stat.value}</Text> {/* Single line text */}
                <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode='tail'>{stat.label}</Text> {/* Single line text */}
              </View>
            );
          })}
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={handleStartBill}
          activeOpacity={0.8}
        >
          <View style={styles.mainActionContent}>
            <View style={styles.mainActionIconContainer}>
              <Plus size={32} color="#2C3E50" strokeWidth={3} />
            </View>
            <View style={styles.mainActionTextContainer}>
              <Text style={styles.mainActionTitle}>Start New Bill</Text>
              <Text style={styles.mainActionSubtitle}>Create a new transaction</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={styles.quickActionIcon}>
                <ShoppingCart size={22} color="#2C3E50" strokeWidth={2.5} />
              </View>
              <Text style={styles.quickActionText} numberOfLines={1} ellipsizeMode='tail'>
                View Cart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BillsList')}
            >
              <View style={styles.quickActionIcon}>
                <FileText size={22} color="#2C3E50" strokeWidth={2.5} />
              </View>
              <Text style={styles.quickActionText} numberOfLines={1} ellipsizeMode='tail'>
                All Bills
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={styles.quickActionIcon}>
                <TrendingUp size={22} color="#2C3E50" strokeWidth={2.5} />
              </View>
              <Text style={styles.quickActionText} numberOfLines={1} ellipsizeMode='tail'>
                Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BillsList')} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>

          {recentBills.length > 0 ? (
            <View style={styles.recentBillsWrapper}>
              {recentBills.map((bill, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.billCard(index, recentBills.length)}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('BillsList')}
                >
                  <View style={styles.billIconContainer}>
                    <Receipt size={20} color="#2C3E50" strokeWidth={2.5} />
                  </View>
                  <View style={styles.billDetails}>
                    <Text style={styles.billCustomer}>{bill.customer}</Text>
                    <Text style={styles.billId}>{bill.id}</Text>
                    <Text style={styles.billTime}>{bill.time}</Text>
                  </View>
                  <View style={styles.billAmountContainer}>
                    <Text style={styles.billAmount}>{bill.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: bill.statusColor + '15' }]}>
                      <Text style={[styles.statusText, { color: bill.statusColor }]}>{bill.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <FileText size={48} color="#95A5A6" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyStateTitle}>No Recent Bills</Text>
              <Text style={styles.emptyStateText}>Start a new transaction to see it here</Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // Slightly smaller radius
    paddingVertical: 18, // Reduced vertical padding
    paddingHorizontal: 10, // Adjusted horizontal padding
    alignItems: 'center', // Center content horizontally
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
    width: 44, // Smaller icon container
    height: 44, // Smaller icon container
    borderRadius: 14, // Adjusted radius
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // Reduced bottom margin
  },
  statValue: {
    fontSize: 24, // Slightly smaller value text
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    numberOfLines: 1, // Ensure single line
    ellipsizeMode: 'tail', // Truncate with ...
  },
  statLabel: {
    fontSize: 13, // Slightly smaller label text
    color: '#7F8C8D',
    fontWeight: '500',
    numberOfLines: 1, // Ensure single line
    ellipsizeMode: 'tail', // Truncate with ...
  },
  mainActionButton: {
    marginHorizontal: 20,
    marginTop: 25,
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
  mainActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  mainActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  mainActionTextContainer: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  mainActionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
  recentBillsWrapper: {
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
  billCard: (index, total) => ({
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
  billDetails: {
    flex: 1,
  },
  billId: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7F8C8D',
    marginBottom: 3,
  },
  billCustomer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 3,
  },
  billTime: {
    fontSize: 11,
    color: '#95A5A6',
  },
  billAmountContainer: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
});