import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions // Import Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Phone,
  CreditCard,
  Trash2,
  Package,
  Search,
  Filter,
  CheckCircle,
  Save // Kept Save icon as it's more appropriate
} from 'lucide-react-native';
import { BillingContext } from '../../context/BillingContext';
import { InventoryContext } from '../../context/InventoryContext';
import { AlertContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

const { width } = Dimensions.get('window'); // Get screen width for responsive product cards

export default function EditBillScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { billId } = route.params;

  const {
    getBillById,
    loadBillForEdit,
    updateBill,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    calculateCartTotals
  } = useContext(BillingContext);
  const { products } = useContext(InventoryContext); // Products from InventoryContext
  const alertCtx = useContext(AlertContext);
  const insets = useSafeAreaInsets(); // Initialize safe area insets

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showProductsModal, setShowProductsModal] = useState(false); // Renamed for clarity
  const [isSaving, setIsSaving] = useState(false);
  const [originalBill, setOriginalBill] = useState(null);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  const { subtotal, cgst, sgst, tax, total } = calculateCartTotals(); // Include cgst, sgst

  // Load bill data when component mounts
  useEffect(() => {
    const bill = loadBillForEdit(billId); // This also sets the cart in BillingContext
    if (bill) {
      setCustomerName(bill.customerName);
      setCustomerPhone(bill.customerPhone);
      setOriginalBill(bill);
    } else {
      alertCtx.showAlert({
        title: 'Bill Not Found',
        message: 'The bill you are trying to edit does not exist.',
        type: 'error'
      });
      navigation.goBack();
    }
    // Cleanup cart when component unmounts or billId changes to prevent stale data
    return () => clearCart();
  }, [billId, loadBillForEdit, alertCtx, navigation, clearCart]);

  const handleAddToCart = (product) => {
    // Check if product is already in cart, if so, increment quantity
    const existingCartItem = cart.find(item => item.id === product.id);
    const quantityToAdd = 1; // Always add 1 at a time from this button

    if (existingCartItem) {
        if (product.stock && existingCartItem.quantity + quantityToAdd > product.stock) {
            alertCtx.showAlert({
                title: 'Insufficient Stock',
                message: `Only ${product.stock} items available in stock. Cannot add more.`,
                type: 'warning'
            });
            return;
        }
        updateCartItemQuantity(product.id, existingCartItem.quantity + quantityToAdd);
    } else {
        addToCart(product);
    }

    alertCtx.showAlert({
        title: 'Added to Cart',
        message: `${product.name} added to cart.`,
        type: 'success'
    });
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from the cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) }
        ]
      );
      return;
    }
    const currentProduct = products.find(p => p.id === productId);
    if (currentProduct && currentProduct.stock !== undefined && newQuantity > currentProduct.stock) {
      alertCtx.showAlert({
        title: 'Insufficient Stock',
        message: `Only ${currentProduct.stock} items available in stock.`,
        type: 'warning'
      });
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
  };


  const handleSaveBill = async () => {
    if (cart.length === 0) {
      alertCtx.showAlert({
        title: 'Empty Cart',
        message: 'Please add items to cart before saving the bill.',
        type: 'warning'
      });
      return;
    }

    if (!customerName.trim()) {
      alertCtx.showAlert({
        title: 'Customer Required',
        message: 'Please enter customer name.',
        type: 'warning'
      });
      return;
    }

    setIsSaving(true);
    try {
      const { subtotal, cgst, sgst, tax, total } = calculateCartTotals(); // Re-calculate before saving

      updateBill(billId, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: [...cart], // Pass current cart state
        subtotal,
        cgst,
        sgst,
        tax,
        total,
        status: 'pending' // You might want to keep original status or handle this based on logic
      });

      alertCtx.showAlert({
        title: 'Bill Updated',
        message: `Bill ${billId} has been updated successfully!`,
        type: 'success'
      });

      // Clear cart in context (important after saving or discarding changes)
      clearCart();

      // Navigate back
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error("Error updating bill:", error);
      alertCtx.showAlert({
        title: 'Error',
        message: error.message || 'Failed to update bill. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard all changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            clearCart(); // Clear cart in context
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <Animatable.View animation="fadeInUp" style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <View style={styles.productIconBg}>
          <Package size={24} color="#2C3E50" strokeWidth={2.5} />
        </View>
        {item.stock !== undefined && (item.stock <= 5 || item.stock === 0) && (
          <View style={[styles.stockBadge, { backgroundColor: item.stock === 0 ? '#E74C3C' : '#FFC107' }]}>
            <Text style={styles.stockText}>{item.stock === 0 ? 'Out' : item.stock}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>
        <Text style={styles.productCategory} numberOfLines={1} ellipsizeMode='tail'>{item.category}</Text>
        <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
        {item.stock !== undefined && (
          <Text style={styles.stockInfo}>
            Stock: {item.stock} {item.stock <= 5 && item.stock > 0 && <Text style={styles.lowStockText}>Low!</Text>}
            {item.stock === 0 && <Text style={styles.outOfStockText}>Out!</Text>}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.addButton, item.stock === 0 && styles.addButtonDisabled]}
        onPress={() => handleAddToCart(item)}
        disabled={item.stock === 0}
        activeOpacity={0.7}
      >
        <Plus size={18} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderCartItem = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" style={[styles.cartItem, index === cart.length - 1 && { borderBottomWidth: 0 }]}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.cartItemControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          activeOpacity={0.7}
        >
          <Minus size={14} color="#2C3E50" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, item.stock !== undefined && item.quantity >= item.stock && styles.quantityButtonDisabled]}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          disabled={item.stock !== undefined && item.quantity >= item.stock}
          activeOpacity={0.7}
        >
          <Plus size={14} color="#2C3E50" strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromCart(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={14} color="#E74C3C" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cartItemTotal}>
        ₹{(item.price * item.quantity).toFixed(2)}
      </Text>
    </Animatable.View>
  );

  if (!originalBill) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />
        <Text style={styles.loadingText}>Loading bill...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Circles (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Bill</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowProductsModal(true)} // Open products selection modal
            activeOpacity={0.7}
          >
            <ShoppingCart size={24} color="#2C3E50" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length > 99 ? '99+' : cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Info */}
        <View style={[styles.section, styles.billInfoCard]}>
          <Text style={styles.billIdText}>Bill ID: {billId}</Text>
          <Text style={styles.billStatusText}>
            Status: {originalBill.status.charAt(0).toUpperCase() + originalBill.status.slice(1)}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBg}>
              <User size={20} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Customer Name *"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#95A5A6"
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBg}>
              <Phone size={20} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#95A5A6"
            />
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products in Cart</Text>
            <TouchableOpacity
              style={styles.addProductsButton}
              onPress={() => setShowProductsModal(true)}
              activeOpacity={0.7}
            >
              <Plus size={18} color="#2C3E50" strokeWidth={2.5} />
              <Text style={styles.addProductsText}>Add More</Text>
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <View style={styles.emptyIconBg}>
                <ShoppingCart size={48} color="#95A5A6" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyCartTitle}>Cart is Empty</Text>
              <Text style={styles.emptyCartText}>Tap "Add More" to add items to this bill</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={styles.cartListVertical} // Applied existing vertical list style
            />
          )}
        </View>

        {/* Order Summary */}
        {cart.length > 0 && (
          <Animatable.View animation="fadeInUp" style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST (9%):</Text>
                <Text style={styles.summaryValue}>₹{cgst.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST (9%):</Text>
                <Text style={styles.summaryValue}>₹{sgst.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Save Button */}
      {cart.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSaveBill}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <View style={styles.saveButtonContent}> {/* Replaces saveButtonGradient */}
              <Save size={24} color="#fff" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Modal */}
      <Modal
        visible={showProductsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProductsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowProductsModal(false)}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#2C3E50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Products</Text> {/* Title changed */}
              <View style={styles.placeholder} />
            </View>
          </View>

          <View style={styles.modalContent}>
            {/* Search and Filter */}
            <View style={styles.modalSearchFilterContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#7F8C8D" strokeWidth={2.5} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#95A5A6"
                />
              </View>
              <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
                <Filter size={20} color="#2C3E50" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilter}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextSelected
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Products List */}
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyProducts}>
                <View style={styles.emptyIconBg}>
                  <Package size={48} color="#95A5A6" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyProductsTitle}>No Products Found</Text>
                <Text style={styles.emptyProductsText}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
                columnWrapperStyle={styles.productRow}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7FCEA', // Consistent background
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D', // Consistent light grey text
  },
  header: {
    backgroundColor: '#FFFFFF', // White background
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
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
    borderBottomLeftRadius: 28, // Consistent rounded corners
    borderBottomRightRadius: 28,
    marginBottom: 20, // Space below header
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48, // Consistent size
    height: 48,
    borderRadius: 15, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24, // Consistent title size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
  },
  cartButton: { // Used here to open Products Modal
    width: 48, // Consistent size
    height: 48,
    borderRadius: 15, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: -8, // Adjusted position
    right: -8, // Adjusted position
    backgroundColor: '#E74C3C', // Alert red
    borderRadius: 10,
    minWidth: 22, // Adjusted size
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, // Border to stand out
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Consistent horizontal padding
  },
  section: {
    marginBottom: 25,
  },
  billInfoCard: { // New style for the Bill ID/Status section
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  billIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 5,
  },
  billStatusText: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18, // Consistent margin
  },
  sectionTitle: {
    fontSize: 24, // Consistent title size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light grey/cream background
    borderRadius: 14, // Consistent roundedness
    marginBottom: 15, // Consistent margin
    paddingHorizontal: 16,
    height: 56, // Fixed height
    borderWidth: 1, // Subtle border
    borderColor: '#E8E8E8',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputIconBg: { // New container for input icons
    width: 32, // Fixed width for icon container
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50', // Dark text
    paddingVertical: 0, // Remove default vertical padding
  },
  addProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0', // Consistent cream background
    paddingHorizontal: 16, // Adjusted padding
    paddingVertical: 10, // Adjusted padding
    borderRadius: 14, // Consistent roundedness
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  addProductsText: {
    color: '#2C3E50', // Dark text
    fontSize: 15, // Consistent size
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyCart: {
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 20, // Consistent roundedness
    padding: 40,
    alignItems: 'center',
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconBg: { // Consistent empty state icon container
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA', // Light grey for background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginTop: 15,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey
    textAlign: 'center',
    lineHeight: 20,
  },
  cartListVertical: { // Styles for the cart list
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 20, // Consistent roundedness
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8', // Light separator
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#7F8C8D', // Lighter grey
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quantityButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#E8E8E8',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    minWidth: 70,
    textAlign: 'right',
  },
  summarySection: {
    marginBottom: 25,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 20, // Consistent roundedness
    padding: 20,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745', // Success green
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40, // Adjust for safe area
    backgroundColor: '#FFFFFF', // White background
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Consistent shadow going upwards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  saveButton: {
    borderRadius: 14, // Consistent roundedness
    backgroundColor: '#2C3E50', // Primary dark button
    // Consistent shadow for primary action
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonContent: { // Content inside save button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonDisabled: { // General disabled style for buttons
    opacity: 0.7,
    backgroundColor: '#95A5A6', // Muted background for disabled
    shadowOpacity: 0.05,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background
  },
  modalHeader: {
    backgroundColor: '#FFFFFF', // White background
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
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
    borderBottomLeftRadius: 28, // Consistent rounded corners
    borderBottomRightRadius: 28,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseButton: {
    width: 48, // Consistent size
    height: 48,
    borderRadius: 15, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24, // Consistent title size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
  },
  placeholder: {
    width: 48, // Match close button width for centering
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSearchFilterContainer: { // Container for search and filter button
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light grey/cream background
    borderRadius: 14, // Consistent roundedness
    paddingHorizontal: 16,
    marginRight: 10,
    height: 50, // Fixed height
    borderWidth: 1, // Subtle border
    borderColor: '#E8E8E8',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 45, // Adjusted to fit container height
    fontSize: 16,
    color: '#2C3E50', // Dark text
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterButton: {
    width: 50, // Consistent size
    height: 50,
    borderRadius: 15, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryFilter: {
    marginBottom: 0,
    gap: 10, // Consistent gap
    height: 48, // Added fixed height for consistent layout
    marginTop: 5,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA', // Light grey/cream for inactive
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14, // Consistent roundedness
    marginRight: 0, // No extra margin if gap is used
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#2C3E50', // Primary dark for selected
    // More pronounced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,

  },
  categoryChipText: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey for inactive text
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff', // White text for selected
    fontWeight: '600',
  },
  productsList: {
    paddingBottom: 10,
    paddingHorizontal: 5,
    // Small padding for inner cards
    paddingTop: 10,
    marginTop: -5,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    width: (width - 60 - 10) / 2, // Calculate width for 2 columns with gaps and modal padding
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,

  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIconBg: { // Consistent icon container
    width: 60,
    height: 60,
    borderRadius: 18, // Rounded square
    backgroundColor: '#FFF8F0', // Cream background
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: -8, // Adjusted position
    right: -8, // Adjusted position
    // Background color set dynamically
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50', // Dark text
    textAlign: 'center',
    marginBottom: 4,
    height: 36, // Fixed height to prevent layout shifts
  },
  productCategory: {
    fontSize: 12,
    color: '#7F8C8D', // Lighter grey
    marginBottom: 6,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745', // Success green
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  lowStockText: {
    color: '#FFC107', // Orange for low stock
    fontWeight: 'bold',
  },
  outOfStockText: {
    color: '#E74C3C', // Red for out of stock
    fontWeight: 'bold',
  },
  addButton: {
    width: 44, // Consistent size
    height: 44,
    borderRadius: 14, // Rounded square
    backgroundColor: '#2C3E50', // Primary dark button
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#95A5A6', // Muted background when disabled
    shadowOpacity: 0.05,
    elevation: 2,
  },
  emptyProducts: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginTop: 15,
    marginBottom: 8,
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#7F8C8D', // Lighter grey
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});