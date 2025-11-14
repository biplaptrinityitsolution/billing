import React, { useState, useContext, useRef, useEffect } from 'react';
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  Printer,
  X
} from 'lucide-react-native';
import { BillingContext } from '../../context/BillingContext';
import { InventoryContext } from '../../context/InventoryContext';
import { AlertContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function NewBillScreen() {
  const navigation = useNavigation();
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, calculateCartTotals, createBill } = useContext(BillingContext);
  const { products } = useContext(InventoryContext);
  const alertCtx = useContext(AlertContext);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showProducts, setShowProducts] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Popup for "View Cart"
  // Removed in favor of global floating button and Cart screen

  // For animated product added notification
  const [addedProductName, setAddedProductName] = useState('');
  const addedProductAnim = useRef(new Animated.Value(0)).current;
  const productAddedTimeoutRef = useRef(null);

  // Show the "Added to Cart" with the product name
  const showAddProductBanner = (name, quantity) => {
    setAddedProductName(`${quantity}x ${name} added to cart`);
    Animated.timing(addedProductAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    if (productAddedTimeoutRef.current) clearTimeout(productAddedTimeoutRef.current);

    productAddedTimeoutRef.current = setTimeout(() => {
      Animated.timing(addedProductAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setAddedProductName('');
      });
    }, 1500);
  };

  // No local popup/modal anymore

  useEffect(() => {
    return () => {
      if (productAddedTimeoutRef.current) clearTimeout(productAddedTimeoutRef.current);
    };
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  const { subtotal, cgst, sgst, tax, total } = calculateCartTotals();

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (quantity <= 0) {
      alertCtx.showAlert({
        title: 'Invalid Quantity',
        message: 'Please enter a valid quantity.',
        type: 'warning'
      });
      return;
    }

    if (selectedProduct.stock && quantity > selectedProduct.stock) {
      alertCtx.showAlert({
        title: 'Insufficient Stock',
        message: `Only ${selectedProduct.stock} items available in stock.`,
        type: 'warning'
      });
      return;
    }

    // Add product with specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedProduct);
    }

    // Show animated product name banner at the top for 1s
    showAddProductBanner(selectedProduct.name, quantity);

    setShowQuantityModal(false);
    setSelectedProduct(null);
    setQuantity(1);
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

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      alertCtx.showAlert({
        title: 'Empty Cart',
        message: 'Please add items to cart before creating a bill.',
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

    setIsCreating(true);
    try {
      const newBill = await createBill({
        name: customerName.trim(),
        phone: customerPhone.trim()
      });

      alertCtx.showAlert({
        title: 'Bill Created',
        message: `Bill ${newBill.id} has been created successfully!`,
        type: 'success'
      });

      setCustomerName('');
      setCustomerPhone('');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error("Error creating bill:", error);
      alertCtx.showAlert({
        title: 'Error',
        message: error.message || 'Failed to create bill. Please try again.',
        type: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Cart Modal Items List rendering (vertical)
  const renderCartModalItem = ({ item, index }) => (
    <View style={[viewCartStyles.cartModalItem, index === cart.length - 1 && { borderBottomWidth: 0 }]}>
      <Text style={viewCartStyles.cartModalItemName}>{item.name}</Text>
      <Text style={viewCartStyles.cartModalItemQty}>Qty: {item.quantity}</Text>
      <Text style={viewCartStyles.cartModalItemPrice}>₹{item.price.toFixed(2)}</Text>
      <Text style={viewCartStyles.cartModalItemSubtotal}>Total: ₹{(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  // The "View Cart" popup floating button
  const renderViewCartPopup = () => null;

  // The View Cart Modal itself
  const { subtotal: modalSubtotal, cgst: modalCgst, sgst: modalSgst, total: modalTotal } = calculateCartTotals();

  const renderViewCartModal = () => null;

  // Product rendering from FlatList (unchanged)
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

  // Old Cart Section rendering - user will "View Cart" in popup/modal now

  const renderAddedProductBanner = () => {
    if (!addedProductName) return null;
    return (
      <Animated.View
        style={[
          styles.addedProductBanner,
          {
            opacity: addedProductAnim,
            transform: [
              {
                translateY: addedProductAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-Platform.OS === 'android' ? 30 : 60, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.addedProductBannerText}>{addedProductName}</Text>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* View Cart handled globally */}

      {/* Animated banner overlay for added product */}
      {renderAddedProductBanner()}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Bill</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowProducts(false)}
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
            <Text style={styles.sectionTitle}>Products</Text>
            <TouchableOpacity
              style={styles.addProductsButton}
              onPress={() => setShowProducts(true)}
              activeOpacity={0.7}
            >
              <Plus size={18} color="#2C3E50" strokeWidth={2.5} />
              <Text style={styles.addProductsText}>Add Products</Text>
            </TouchableOpacity>
          </View>
          {/* Cart summary and order summary moved to view cart modal */}
          <View style={styles.emptyCart}>
            <View style={styles.emptyIconBg}>
              <ShoppingCart size={48} color="#95A5A6" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyCartTitle}>Tap "Add Products" to start</Text>
            <Text style={styles.emptyCartText}>
              After adding product(s), tap "View Cart" popup to see and edit your cart.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Bill Button */}
      {cart.length > 0 && (
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.printButton, isCreating && styles.buttonDisabled]}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <View style={styles.printButtonContent}>
                <Printer size={20} color="#2C3E50" strokeWidth={2.5} />
                <Text style={styles.printButtonText}>Print</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.buttonDisabled]}
              onPress={handleCreateBill}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <View style={styles.createButtonContent}>
                <CreditCard size={24} color="#fff" strokeWidth={2.5} />
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Creating...' : 'Create Bill'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products Modal */}
      <Modal
        visible={showProducts}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProducts(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowProducts(false)}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#2C3E50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Products</Text>
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

      {/* Quantity Selection Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" style={styles.quantityModal}>
            <View style={styles.quantityHeader}>
              <Text style={styles.quantityTitle}>Select Quantity</Text>
              <TouchableOpacity
                style={styles.closeQuantityButton}
                onPress={() => setShowQuantityModal(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#7F8C8D" /> {/* Smaller X icon */}
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <View style={styles.productDetails}>
                <View style={styles.productIconBg}>
                  <Package size={28} color="#2C3E50" strokeWidth={2.5} /> {/* Smaller icon */}
                </View>
                <View style={styles.productInfoQuantityModal}>
                  <Text style={styles.productNameQuantityModal} numberOfLines={2} ellipsizeMode='tail'>{selectedProduct.name}</Text>
                  <Text style={styles.productCategoryQuantityModal} numberOfLines={1} ellipsizeMode='tail'>{selectedProduct.category}</Text>
                  <Text style={styles.productPriceQuantityModal}>₹{selectedProduct.price.toFixed(2)} each</Text>
                  {selectedProduct.stock !== undefined && (
                    <Text style={styles.stockInfoQuantityModal}>
                      Available: {selectedProduct.stock} items
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButtonQtyModal, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color="#2C3E50" strokeWidth={2.5} /> {/* Smaller icon */}
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setQuantity(Math.max(1, num));
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[
                    styles.quantityButtonQtyModal,
                    selectedProduct?.stock && quantity >= selectedProduct.stock && styles.quantityButtonDisabled
                  ]}
                  onPress={() => setQuantity(quantity + 1)}
                  disabled={!!selectedProduct?.stock && quantity >= selectedProduct.stock}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#2C3E50" strokeWidth={2.5} /> {/* Smaller icon */}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.calculationSection}>
              <Text style={styles.calculationTitle}>Price Calculation</Text>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Unit Price:</Text>
                <Text style={styles.calculationValue}>₹{selectedProduct?.price.toFixed(2)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Quantity:</Text>
                <Text style={styles.calculationValue}>{quantity}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Subtotal:</Text>
                <Text style={styles.calculationValue}>₹{(selectedProduct?.price * quantity).toFixed(2)}</Text>
              </View>
              <View style={[styles.calculationRow, styles.totalCalculationRow]}>
                <Text style={styles.totalCalculationLabel}>Total:</Text>
                <Text style={styles.totalCalculationValue}>₹{(selectedProduct?.price * quantity).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuantityModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleConfirmAddToCart}
                activeOpacity={0.8}
              >
                <View style={styles.addToCartContent}>
                  <ShoppingCart size={20} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// View Cart Modal Styles
const viewCartStyles = StyleSheet.create({
  viewCartPopupContainer: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  viewCartPopupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 7,
  },
  viewCartPopupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },

  cartModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cartModalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 11,
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 1,
  },
  cartModalTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#2C3E50'
  },
  flatListVertical: {
    maxHeight: 310,
    marginBottom: 12,
  },
  cartModalItem: {
    paddingVertical: 11,
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 1,
    flexDirection: 'column',
    marginBottom: 2,
  },
  cartModalItemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2C3E50'
  },
  cartModalItemQty: {
    marginTop: 3,
    fontSize: 14,
    color: '#7F8C8D'
  },
  cartModalItemPrice: {
    marginTop: 3,
    fontSize: 14,
    color: '#4285F4'
  },
  cartModalItemSubtotal: {
    marginTop: 2,
    fontSize: 13,
    color: '#28A745'
  },

  cartModalTotalsSection: {
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#E7FCEA',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  cartModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cartModalLabel: {
    color: '#7F8C8D',
    fontSize: 15
  },
  cartModalValue: {
    color: '#2C3E50',
    fontWeight: '600',
    fontSize: 15,
  },
  cartModalLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  cartModalValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745'
  },
  cartModalAction: {
    marginTop: 20,
    alignItems: 'center',
  },
  cartModalActionButton: {
    borderRadius: 14,
    backgroundColor: '#2C3E50',
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  cartModalActionText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff'
  }
});

// --- Styles (same as before) ---
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
  addedProductBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 58,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#28A745',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 5,
  },
  addedProductBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  header: {
    backgroundColor: '#FFFFFF',
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
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
    backgroundColor: '#FFF8F0',
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
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputIconBg: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 0,
  },
  addProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  addProductsText: {
    color: '#2C3E50',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyCart: {
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
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  productsList: {
    paddingBottom: 10,
    paddingHorizontal: 5,
    paddingTop: 10,
    marginTop: -5,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    width: (width - 60 - 10) / 2,
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
  productIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
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
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
    height: 36,
  },
  productCategory: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  lowStockText: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  outOfStockText: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#95A5A6',
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
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#E7FCEA',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFF8F0',
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
  placeholder: {
    width: 48,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSearchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryFilter: {
    marginBottom: 0,
    gap: 10,
    height: 48,
    marginTop:5,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quantityModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  quantityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeQuantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  productInfoQuantityModal: {
    flex: 1,
    marginLeft: 10,
  },
  productNameQuantityModal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  productCategoryQuantityModal: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  productPriceQuantityModal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#28A745',
  },
  stockInfoQuantityModal: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  quantitySection: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonQtyModal: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quantityInput: {
    width: 60,
    height: 44,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  calculationSection: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  calculationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  calculationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalCalculationRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 10,
    marginTop: 8,
  },
  totalCalculationLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalCalculationValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#28A745',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 18,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  addToCartButton: {
    flex: 2,
    borderRadius: 14,
    backgroundColor: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  addToCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 15,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 + 10 : 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  printButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  printButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  printButtonText: {
    color: '#2C3E50',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});