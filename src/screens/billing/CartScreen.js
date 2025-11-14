import React, { useContext, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BillingContext } from '../../context/BillingContext';
import { AlertContext } from '../../context/AuthContext'; // Assuming AlertContext is part of AuthContext

export default function CartScreen() {
  const navigation = useNavigation();
  // Removed calculateCartTotals from local definition, as it's now from BillingContext
  const { cart, updateCartItemQuantity, removeFromCart, calculateCartTotals, createBill } = useContext(BillingContext);
  const alertCtx = useContext(AlertContext);

  const totals = useMemo(() => calculateCartTotals(), [cart, calculateCartTotals]);

  // If cart becomes empty, show popup and exit the page
  useEffect(() => {
    if (!cart.length) {
      alertCtx.showAlert({
        title: 'Cart Empty',
        message: 'Your cart is empty. Returning to previous page.',
        type: 'info',
      });
      const t = setTimeout(() => {
        navigation.goBack();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [cart.length, alertCtx, navigation]); // Added dependencies for useEffect

  const handleQuantity = (id, qty) => {
    const currentItem = cart.find(item => item.id === id);

    if (!currentItem) {
      // Should not happen if UI is correctly connected to cart state
      console.warn("Attempted to change quantity for an item not in cart.");
      return;
    }

    // --- Stock check logic ---
    if (qty > currentItem.stock) {
      alertCtx.showAlert({
        title: 'Out of Stock',
        message: `Only ${currentItem.stock} units of "${currentItem.name}" are available.`,
        type: 'warning',
      });
      return; // Prevent increasing quantity beyond stock
    }
    // --- End stock check logic ---

    if (qty <= 0) {
      removeFromCart(id);
    } else {
      updateCartItemQuantity(id, qty);
    }
  };

  const handleCreateBill = async () => {
    if (!cart.length) return;
    // You might want to get customer details (name, phone) from a form here
    // For now, using placeholders
    const newBill = await createBill({ name: 'Walk-in Customer', phone: '' });
    alertCtx.showAlert({ title: 'Bill Created', message: `Bill #${newBill.id} created successfully!`, type: 'success' });
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => {
    // Calculate effective price per base unit considering discount
    const effectivePricePerBaseUnit = item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price;

    // Calculate total for this line item
    const lineItemTotal = effectivePricePerBaseUnit * item.quantity;

    return (
      <View style={styles.billItem} key={item.id}>
        <View style={styles.itemRow}>
          <View style={styles.itemIndexCircle}>
            <Text style={styles.itemIndexText}>{index + 1}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>

            {/* Display product's base quantity and unit, and discount % */}
            {(item.productQuantity !== undefined && item.unit) || item.discount > 0 ? (
              <Text style={styles.itemBaseQuantityText}>
                {item.productQuantity !== undefined && item.unit ? `${item.productQuantity} ${item.unit}` : ''}
                {item.discount > 0 && <Text style={styles.itemDiscountText}> ({item.discount}% Off)</Text>}
              </Text>
            ) : null}

            {/* Display effective price per base unit x cart quantity, and original price if discounted */}
            <Text style={styles.itemPricePerUnit}>
              {item.discount > 0 && <Text style={styles.originalPriceStrikethrough}>₹{item.price.toFixed(2)}</Text>}
              {item.discount > 0 && <Text style={{ color: styles.itemPricePerUnit.color }}> </Text>} {/* Small space */}
              ₹{effectivePricePerBaseUnit.toFixed(2)} × {item.quantity}
            </Text>
          </View>
          <Text style={styles.itemTotal}>₹{lineItemTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantity(item.id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Minus size={14} color="#666" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantity(item.id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Plus size={14} color="#666" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeFromCart(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#FF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.topPadding} />
      <ScrollView
        style={styles.onePageWrapper}
        contentContainerStyle={styles.onePageContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (removed from here, assuming it's managed by navigator or a parent component) */}
        {/* You had a commented-out Header here, so I'm omitting it as per previous interpretation.
            If you need a custom header here, you'll need to define it. */}

        {/* Bill Container - Receipt Style */}
        <View style={styles.billContainer}>
          {/* Store Header */}
          <View style={styles.storeHeader}>
            <ShoppingBag size={32} color="#FF6347" strokeWidth={2} />
            <Text style={styles.storeName}>MyStore</Text>
            <Text style={styles.storeTagline}>Tax Invoice</Text>
            <View style={styles.dashedLine} />
          </View>

          {/* Items List - OnePage, not scrolling */}
          <View style={styles.itemsSection}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>ITEM</Text>
              <Text style={styles.tableHeaderText}>AMOUNT</Text>
            </View>
            {
              cart.length
                ? cart.map((item, idx) => renderItem({ item, index: idx }))
                : (
                  <View style={styles.emptyState}>
                    <ShoppingBag size={48} color="#CCCCCC" strokeWidth={1.5} />
                    <Text style={styles.emptyText}>No items in cart</Text>
                  </View>
                )
            }
          </View>

          {/* Bill Summary */}
          <View style={styles.summarySection}>
            <View style={styles.dashedLine} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totals.subtotal.toFixed(2)}</Text>
            </View>
            {/* UPDATED: CGST and SGST lines to reflect actual calculated values */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>CGST</Text>
              <Text style={styles.summaryValue}>₹{totals.cgst.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>SGST</Text>
              <Text style={styles.summaryValue}>₹{totals.sgst.toFixed(2)}</Text>
            </View>
            <View style={styles.solidLine} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>₹{totals.total.toFixed(2)}</Text>
            </View>
            <View style={styles.dashedLine} />
          </View>

          {/* Action Buttons with Back Button beside Payment Button */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtnBottom}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color="#1C1C1C" strokeWidth={2.5} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!cart.length}
              onPress={handleCreateBill}
              style={[styles.checkoutBtn, !cart.length && styles.checkoutBtnDisabled]}
              activeOpacity={0.8}
            >
              <CreditCard size={18} color="#fff" strokeWidth={2} />
              <Text style={styles.checkoutBtnText}>Proceed to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E7FCEA',
    marginTop: 20,
  },
  onePageWrapper: {
    flex: 1,
    backgroundColor: '#E7FCEA',
  },
  onePageContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  topPadding: {
    height: 100,
    backgroundColor: 'transparent',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    textAlign: 'center',
  },

  // Bill Receipt Style
  billContainer: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingBottom: 12,
  },
  storeHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  storeName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  storeTagline: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dashedLine: {
    width: '100%',
    height: 1,
    marginVertical: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  solidLine: {
    width: '100%',
    height: 2,
    marginVertical: 8,
    backgroundColor: '#1C1C1C',
  },

  // Items Section
  itemsSection: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.5,
  },
  itemsList: {
    paddingBottom: 8,
  },
  billItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemIndexCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  itemIndexText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  itemInfo: {
    flex: 1,
    marginRight: 5,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1C',
    lineHeight: 17,
    marginBottom: 2,
  },
  // New style for base quantity and unit
  itemBaseQuantityText: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDiscountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6347',
    marginLeft: 4,
  },
  itemPricePerUnit: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '400',
    flexDirection: 'row', // To align original price and discounted price if needed
    alignItems: 'center',
  },
  originalPriceStrikethrough: {
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
    // Removed marginLeft: 4, as it's now handled by spacing in JSX
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    minWidth: 60,
    textAlign: 'right',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 23,
    height: 23,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1C',
    marginHorizontal: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 9,
  },

  // Summary Section
  summarySection: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1C1C1C',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },

  // Action Buttons Row (bottom: payment + back button)
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 8,
    marginTop: 6,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6347',
    height: 42,
    borderRadius: 10,
    gap: 8,
    paddingHorizontal: 14,
    marginRight: 15,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  backBtnBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginRight: 0,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    gap: 5,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    marginLeft: 4,
  },
});