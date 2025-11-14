// src/screens/admin/InventoryScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, StatusBar, Platform } from 'react-native';
// Removed LinearGradient import
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit,
  Trash2,
  AlertCircle,
  BarChart3, // For categories icon, or use a more specific one if available (Shapes as in dashboard?)
  Archive,
  Box,
  PackageSearch,
  ChevronRight // For 'View All' links
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { InventoryContext } from '../../context/InventoryContext';
import ProductFormScreen from './ProductFormScreen'; // Ensure this screen exists and is styled consistently

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
  const navigation = useNavigation();
  const { products, deleteProduct } = useContext(InventoryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const inventoryStats = [
    { label: 'Total Products', value: '1', icon: Package, color: '#2C3E50' }, // Dark for general stat
    { label: 'Low Stock', value: '0', icon: AlertCircle, color: '#FFC107' }, // Orange for warning
    { label: 'Out of Stock', value: '1', icon: Archive, color: '#E74C3C' }, // Red for critical
    { label: 'Categories', value: '1', icon: BarChart3, color: '#2C3E50' }, // Dark for general stat
  ];

  const categories = [
    { name: 'Food', count: 1, color: '#83C4B2' }, // A pleasant green for category dot
    { name: 'Beverages', count: 0, color: '#4A90E2' }, // A blue for category dot
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return '#28A745'; // Green
      case 'Low Stock': return '#FFC107'; // Orange
      case 'Out of Stock': return '#E74C3C'; // Red
      default: return '#7F8C8D'; // Grey
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header Section (custom, without gradients) */}
      <View style={styles.headerContainer}>
       

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#7F8C8D" strokeWidth={2.5} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#95A5A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#2C3E50" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {inventoryStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconComponent size={20} color={stat.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode='tail'>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#2C3E50" style={styles.viewAllIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.productsListWrapper}> {/* New wrapper for list styling */}
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyProductContainer}>
                <View style={styles.emptyIconBox}>
                   <Box size={48} color="#95A5A6" style={{marginBottom:0}} />
                </View>
                <Text style={styles.emptyProductText}>No products available yet.</Text>
                <TouchableOpacity style={styles.addProductBtn} onPress={() => navigation.navigate('ProductForm')}>
                  <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.addProductBtnText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredProducts.map((product, index) => (
                <View key={product.id} style={styles.productCard(index, filteredProducts.length)}>
                  <View style={styles.productLeft}>
                    <View style={styles.productImage}>
                      <Text style={styles.productEmoji}>{product.image}</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productSku}>SKU: {product.sku}</Text>
                      <View style={styles.productMeta}>
                        <Text style={styles.productCategory}>{product.category}</Text>
                        <View style={styles.productMetaDivider} />
                        <Text style={styles.productStock}>{product.stock} units</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.productRight}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) + '15' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>
                        {product.status}
                      </Text>
                    </View>
                    <View style={styles.productActions}>
                      <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={() => {
                        setSelectedProduct(product);
                        setEditModalVisible(true);
                      }}>
                        <Edit size={18} color="#2C3E50" strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={() => deleteProduct(product.id)}>
                        <Trash2 size={18} color="#E74C3C" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductForm')}
            >
              <View style={styles.quickActionContent}> {/* Replaced gradient */}
                <View style={styles.quickActionIcon}>
                  <Plus size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionText}>Add Product</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={styles.quickActionContent}> {/* Replaced gradient */}
                <View style={styles.quickActionIcon}>
                  <AlertCircle size={24} color="#2C3E50" strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionText}>Low Stock</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Product Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <View style={styles.placeholder} />
          </View>
          <ProductFormScreen
            product={selectedProduct}
            onClose={() => setEditModalVisible(false)} // Pass onClose prop
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background
    position: 'relative',
    top: -0.9,
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
  headerContainer: { // Replaced headerGradient
    backgroundColor: '#FFFFFF', // White background
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // Consistent shadow from theme
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    marginBottom: 20, // Add margin to separate from scroll content
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Spacing between header text and search bar
  },
  headerTitle: {
    fontSize: 28, // Adjusted font size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#7F8C8D', // Lighter grey
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 15, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    // Consistent subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50', // Dark text
    fontWeight: '500',
    paddingVertical: 0, // Ensure no extra vertical padding
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 14, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    // Consistent subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    // No marginTop here; header has margin bottom, and sections have their own margin top
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute items evenly
    paddingHorizontal: 20,
    marginTop: 0, // Header has marginBottom, so this can be 0 or small
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2, // Width for 2 columns with gaps
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    // Consistent shadow
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
    width: 48, // Consistent size
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0', // Consistent cream
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26, // Consistent size
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13, // Consistent size
    color: '#7F8C8D',
    fontWeight: '500',
  },
  categoriesSection: {
    marginTop: 30, // Consistent top margin for sections
  },
  sectionTitle: {
    fontSize: 24, // Consistent size
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    marginBottom: 18, // Consistent bottom margin
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12, // Consistent gap
  },
  categoryCard: {
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 20, // Consistent roundedness
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 130, // Maintain minimum width
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginRight: 0,
     marginTop: 5,
     marginBottom: 5,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
    numberOfLines: 1, // Ensure single line
    ellipsizeMode: 'tail',
  },
  categoryCount: {
    fontSize: 12,
    color: '#7F8C8D', // Lighter grey
    fontWeight: '500',
  },
  productsSection: {
    marginTop: 30, // Consistent top margin
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18, // Consistent bottom margin
  },
  viewAllButton: { // Consistent 'View All' button style
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
  productsListWrapper: { // New wrapper for the list
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    // No internal padding, individual cards handle it
  },
  productCard: (index, total) => ({ // Dynamic border for list items
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically
    padding: 16,
    borderBottomWidth: index === total - 1 ? 0 : 1,
    borderBottomColor: '#E8E8E8', // Light separator
  }),
  productLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  productImage: {
    width: 56, // Slightly larger emoji container
    height: 56,
    borderRadius: 16, // Consistent rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    // Subtle shadow for image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productEmoji: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 11,
    color: '#95A5A6', // Lighter grey for SKU
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 13, // Consistent size
    color: '#7F8C8D',
    fontWeight: '500',
  },
  productMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#95A5A6',
    marginHorizontal: 8,
  },
  productStock: {
    fontSize: 13, // Consistent size
    color: '#7F8C8D',
    fontWeight: '500',
  },
  productRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 100, // Ensure enough space for price and buttons
  },
  productPrice: {
    fontSize: 18, // Consistent size
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6, // Adjusted margin
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6, // Adjusted margin
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36, // Slightly larger action button
    height: 36,
    borderRadius: 10, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 30, // Consistent top margin
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
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
  quickActionContent: { // Replaced quickActionGradient
    padding: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF', // White background
  },
  quickActionIcon: { // Consistent style for Quick Actions icon containers
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
    color: '#2C3E50', // Dark text
  },
  emptyProductContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50, // More vertical padding
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Needs its own rounded corners
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
  emptyIconBox: { // New style for the empty state icon container
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA', // Light grey for this background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Increased margin
  },
  emptyProductText: {
    fontSize: 17,
    color: '#7F8C8D', // Lighter grey
    marginBottom: 15,
    fontWeight: '500',
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50', // Primary dark button
    borderRadius: 14, // Consistent roundedness
    paddingHorizontal: 25,
    paddingVertical: 12,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addProductBtnText: {
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background for modal
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 15, // Adjust for status bar
    paddingBottom: 20,
    backgroundColor: '#FFFFFF', // White background
    borderBottomLeftRadius: 28, // Consistent rounded corners
    borderBottomRightRadius: 28,
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
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA', // Light grey background
    borderRadius: 12, // Consistent rounded square
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#7F8C8D', // Lighter grey for close icon
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20, // Consistent title size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
  },
  placeholder: {
    width: 40, // Match close button width for centering
  },
});