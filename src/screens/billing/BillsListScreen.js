import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import {
  ArrowLeft,
  Receipt,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Phone,
  Calendar,
} from 'lucide-react-native';
import { BillingContext } from '../../context/BillingContext';
import { AlertContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function BillsListScreen() {
  const navigation = useNavigation();
  const { bills, deleteBill, completeBill } = useContext(BillingContext);
  const alertCtx = useContext(AlertContext);
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillDetails, setShowBillDetails] = useState(false);

  const statusOptions = ['All', 'pending', 'completed'];

  const filteredBills = bills.filter(bill => {
    const matchesSearch =
      bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerPhone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'All' || bill.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDeleteBill = (bill) => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete bill ${bill.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBill(bill.id);
            alertCtx.showAlert({
              title: 'Bill Deleted',
              message: `Bill ${bill.id} has been deleted successfully.`,
              type: 'success'
            });
          }
        }
      ]
    );
  };

  const handleCompleteBill = (bill) => {
    Alert.alert(
      'Complete Bill',
      `Mark bill ${bill.id} as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeBill(bill.id);
            alertCtx.showAlert({
              title: 'Bill Completed',
              message: `Bill ${bill.id} has been marked as completed.`,
              type: 'success'
            });
          }
        }
      ]
    );
  };

  const handleEditBill = (bill) => {
    navigation.navigate('EditBill', { billId: bill.id });
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28A745';
      case 'pending': return '#FFC107';
      default: return '#7F8C8D';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const renderBill = ({ item, index }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 80}
        style={styles.billCard}
      >
        <TouchableOpacity
          style={styles.billContent}
          onPress={() => handleViewBill(item)}
          activeOpacity={0.7}
        >
          <View style={styles.billHeader}>
            <View style={styles.billInfo}>
              <Text style={styles.billId} numberOfLines={1}>{item.id}</Text>
              <View style={styles.statusContainer}>
                <StatusIcon size={14} color={statusColor} strokeWidth={2.5} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.billAmount}>₹{item.total.toFixed(2)}</Text>
          </View>

          <View style={styles.billDetails}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
              {item.customerPhone && (
                <View style={styles.phoneContainer}>
                  <Phone size={12} color="#7F8C8D" strokeWidth={2.5} />
                  <Text style={styles.phoneText} numberOfLines={1}>{item.customerPhone}</Text>
                </View>
              )}
            </View>
            <View style={styles.dateContainer}>
              <Calendar size={12} color="#7F8C8D" strokeWidth={2.5} />
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.itemsSummary}>
            <Text style={styles.itemsText}>
              {item.items.length} item{item.items.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.billActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewBill(item)}
            activeOpacity={0.7}
          >
            <Eye size={16} color="#2C3E50" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditBill(item)}
            activeOpacity={0.7}
          >
            <Edit size={16} color="#2C3E50" strokeWidth={2.5} />
          </TouchableOpacity>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCompleteBill(item)}
              activeOpacity={0.7}
            >
              <CheckCircle size={16} color="#28A745" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteBill(item)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#E74C3C" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  const renderBillDetails = () => {
    if (!selectedBill) return null;

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Bill Details</Text>
          <Text style={styles.detailsId}>{selectedBill.id}</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>Customer Information</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Name:</Text>
            <Text style={styles.detailsValue}>{selectedBill.customerName}</Text>
          </View>
          {selectedBill.customerPhone && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Phone:</Text>
              <Text style={styles.detailsValue}>{selectedBill.customerPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>Items</Text>
          {selectedBill.items.map((item, index) => (
            <View key={index} style={styles.itemRow(index, selectedBill.items.length)}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{selectedBill.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>CGST (9%):</Text>
            <Text style={styles.summaryValue}>₹{selectedBill.cgst.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SGST (9%):</Text>
            <Text style={styles.summaryValue}>₹{selectedBill.sgst.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{selectedBill.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>Bill Information</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Status:</Text>
            <Text style={[styles.detailsValue, { color: getStatusColor(selectedBill.status) }]}>
              {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Created:</Text>
            <Text style={styles.detailsValue}>{formatDate(selectedBill.createdAt)}</Text>
          </View>
          {selectedBill.updatedAt && selectedBill.updatedAt.getTime() !== selectedBill.createdAt.getTime() && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Updated:</Text>
              <Text style={styles.detailsValue}>{formatDate(selectedBill.updatedAt)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#2C3E50" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Bills</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#7F8C8D" strokeWidth={2.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#95A5A6"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Filter size={20} color="#2C3E50" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusFilter}
      >
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusChip,
              selectedStatus === status && styles.statusChipSelected
            ]}
            onPress={() => setSelectedStatus(status)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === status && styles.statusChipTextSelected
              ]}
            >
              {status === 'All' ? 'All Bills' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredBills.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Receipt size={48} color="#95A5A6" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyStateTitle}>
            {bills.length === 0 ? 'No Bills Yet' : 'No Bills Found'}
          </Text>
          <Text style={styles.emptyStateText}>
            {bills.length === 0
              ? 'Create your first bill to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          renderItem={renderBill}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.billsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2C3E50']}
              tintColor="#2C3E50"
            />
          }
        />
      )}

      <Modal
        visible={showBillDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBillDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBillDetails(false)}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#2C3E50" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bill Details</Text>
              <View style={styles.placeholder} />
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderBillDetails()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 48,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: -10,
    zIndex: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginRight: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  statusFilter: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statusChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusChipSelected: {
    backgroundColor: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  statusChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  billsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  billContent: {
    padding: 20,
    paddingBottom: 15,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billInfo: {
    flex: 1,
  },
  billId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  billAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  itemsSummary: {
    marginTop: 8,
  },
  itemsText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  billActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#F8F9FA',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  detailsHeader: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  detailsId: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 25,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailsValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemRow: (index, total) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: index === total - 1 ? 0 : 1,
    borderBottomColor: '#E8E8E8',
  }),
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  itemQuantity: {
    marginHorizontal: 15,
  },
  quantityText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28A745',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },
});