// src/screens/employee/ProductManagementScreen.js
import React, { useState, useContext, useCallback, useEffect } from 'react'; // Added useEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import {
  Plus,
  Package,
  Tag,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Upload,
  ChevronDown, // For dropdown indicators
} from 'lucide-react-native'; // Removed unused icons: FolderPlus, PackagePlus, ImageIcon
import { launchImageLibrary } from 'react-native-image-picker';
import { InventoryContext } from '../../context/InventoryContext';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import {
  getProductsByUserId,
  getCategoryDetails,
  saveProduct,
  saveCategory,
} from '../../api/ProductManage';

const { width } = Dimensions.get('window');

// --- Reusable SelectModal Component ---
const SelectModal = ({
  visible,
  options,
  value,
  onSelect,
  onRequestClose,
  title,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onRequestClose}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={o => (o.value ? o.value.toString() : o.label)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modalOption,
                value === item.value && styles.modalOptionSelected,
              ]}
              onPress={() => onSelect(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  value === item.value && styles.modalOptionTextSelected,
                ]}
              >
                {item.label}
              </Text>
              {value === item.value && <View style={styles.modalCheckmark} />}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.modalCancelButton}
          onPress={onRequestClose}
          activeOpacity={0.8}
        >
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
// --- End of SelectModal Component ---

// Unit Options for product
const UNIT_OPTIONS = [
  { label: 'KG', value: 'KG' },
  { label: 'ML / L', value: 'ML/L' },
  { label: 'PCS', value: 'PCS' },
];

// GST Percentage Rates for products
const GST_PERCENTAGE_RATES = [
  { label: '5%', value: '5' },
  { label: '12%', value: '12' },
  { label: '18%', value: '18' },
  { label: '28%', value: '28' },
  { label: 'Other', value: 'Other' },
];

export default function ProductManagementScreen() {
  const {
    categories,
    products,
    addCategory,
    editCategory,
    deleteCategory,
    addProduct,
    editProduct,
    deleteProduct,
    fetchCategories,
    fetchProducts
  } = useContext(InventoryContext);
  const { userName, userProfile, userID: userId, logout } = useContext(AuthContext); // Assuming userProfile exists and has gstBillingType
  const { t } = useLanguage();

  console.log(userId,userName);

  // If userId is not defined, show alert and logout
  // useEffect(() => {
  //   if (!userId) {
  //     console.log('ProductManagementScreen userId:', userId);
  //     Alert.alert(
  //       'Session Error',
  //       'User information is missing or your session has expired. Please login again.',
  //       [
  //         {
  //           text: 'OK',
  //           onPress: () => {
  //             logout();
  //           },
  //         },
  //       ],
  //       { cancelable: false },
  //     );
  //   }
  // }, [userId]);

  // Mocking userProfile.gstBillingType for demonstration purposes
  const mockUserProfile = {
    gstBillingType: 2, // 2: Including GST, 3: Excluding GST (if it's 1 or undefined, tax rate logic won't apply)
  };
  const profileGstBillingType =
    userProfile?.gstBillingType || mockUserProfile.gstBillingType;

  // State for active tab (kept as per your original request to not change tabs)
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'products'

  // Category form state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#FF6347');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Category errors state
  const [categoryErrors, setCategoryErrors] = useState({});

  // Product form state
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [productSideImage, setProductSideImage] = useState(null);
  // NEW FIELDS (Quantity REMOVED):
  const [productUnit, setProductUnit] = useState('');
  const [productTaxRate, setProductTaxRate] = useState(''); // Stores selected option value (e.g., '5', 'Other')
  const [customProductTaxRate, setCustomProductTaxRate] = useState(''); // Only used if productTaxRate is 'Other'
  const [productDiscount, setProductDiscount] = useState(''); // Optional discount percentage
  const [productErrors, setProductErrors] = useState({}); // To hold validation errors for product form

  // Search states (kept as per your original request)
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // NEW: Loading state
  const [isLoading, setIsLoading] = useState(true); // Initial state set to true

  const CATEGORY_COLORS = [
    '#FF6347',
    '#FF8C42',
    '#FFC107',
    '#4CAF50',
    '#00BCD4',
    '#2196F3',
    '#9C27B0',
    '#E91E63',
    '#4DD0E1',
    '#607D8B',
  ];

  // Reset form states
  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryColor('#FF6347');
    setCategoryDescription('');
    setCategoryErrors({});
    setEditingCategory(null);
  };

  const resetProductForm = () => {
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductCategory('');
    setProductDescription('');
    setProductSku('');
    setProductImage(null);
    setProductSideImage(null);
    setEditingProduct(null);
    // Reset NEW FIELDS (Quantity REMOVED)
    setProductUnit('');
    setProductTaxRate('');
    setCustomProductTaxRate('');
    setProductDiscount('');
    setProductErrors({}); // Clear product errors on reset
  };

  // Image picker for product (re-integrated into a single function with a flag)
  const pickProductImage = (isSideImage = false) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            'Error',
            'Failed to pick image: ' + response.errorMessage,
          );
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (isSideImage) {
            setProductSideImage(asset.uri);
          } else {
            setProductImage(asset.uri);
          }
        }
      },
    );
  };

  // Category operations (add description support)
  const handleSaveCategory = () => {
    let errors = {};
    if (!categoryName.trim()) {
      errors.categoryName = 'Category name is required.';
    }
    // Optional: Add validations for description if required (here not mandatory)

    if (Object.keys(errors).length > 0) {
      setCategoryErrors(errors);
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    if (editingCategory) {
      editCategory(editingCategory.id, {
        name: categoryName.trim(),
        color: categoryColor,
        description: categoryDescription.trim(),
      });
      Alert.alert('Success', 'Category updated successfully!');
    } else {
      addCategory({
        name: categoryName.trim(),
        color: categoryColor,
        description: categoryDescription.trim(),
      });
      Alert.alert('Success', 'Category added successfully!');
    }
    resetCategoryForm();
    setCategoryModalVisible(false);
  };

  const handleEditCategory = category => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color || '#FF6347');
    setCategoryDescription(category.description || '');
    setCategoryErrors({});
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = category => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategory(category.id);
            Alert.alert('Success', 'Category deleted successfully!');
          },
        },
      ],
    );
  };

  // Product operations
  const validateProductForm = () => {
    const e = {};
    if (!productName.trim()) e.productName = 'Product name is required';
    if (
      !productPrice.trim() ||
      isNaN(parseFloat(productPrice)) ||
      parseFloat(productPrice) <= 0
    )
      e.productPrice = 'Enter a valid positive price';
    if (
      !productStock.trim() ||
      isNaN(parseInt(productStock)) ||
      parseInt(productStock) < 0
    )
      e.productStock = 'Enter a valid non-negative stock quantity';
    if (!productCategory) e.productCategory = 'Select a category';
    // NEW FIELD VALIDATIONS (Quantity REMOVED)
    if (!productUnit) e.productUnit = 'Unit is required';

    // Tax Rate is mandatory if profileGstBillingType is "Including GST" (value 2)
    if (profileGstBillingType === 2) {
      if (!productTaxRate) {
        e.productTaxRate = 'Tax Rate is required';
      } else if (productTaxRate === 'Other') {
        if (
          !customProductTaxRate.trim() ||
          isNaN(parseFloat(customProductTaxRate)) ||
          parseFloat(customProductTaxRate) < 0 ||
          parseFloat(customProductTaxRate) > 100
        ) {
          e.customProductTaxRate = 'Enter a valid custom tax rate (0-100)';
        }
      }
    }

    // Discount validation (optional, but if provided, must be 0-100)
    if (productDiscount.trim()) {
      if (
        isNaN(parseFloat(productDiscount)) ||
        parseFloat(productDiscount) < 0 ||
        parseFloat(productDiscount) > 100
      ) {
        e.productDiscount = 'Discount must be between 0-100%';
      }
    }

    setProductErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProduct = () => {
    if (!validateProductForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    const price = parseFloat(productPrice);
    const stock = parseInt(productStock);
    // New fields parsing (Quantity REMOVED)
    const taxRateValue =
      productTaxRate === 'Other'
        ? parseFloat(customProductTaxRate)
        : parseFloat(productTaxRate);
    const discountValue = productDiscount.trim()
      ? parseFloat(productDiscount)
      : null; // Save as null if empty

    const productData = {
      name: productName.trim(),
      price: price,
      stock: stock,
      category: productCategory,
      description: productDescription.trim(),
      sku: productSku.trim() || `SKU${Date.now()}`,
      image: productImage || null,
      sideImage: productSideImage || null,
      // NEW FIELDS added to productData (Quantity REMOVED)
      unit: productUnit,
      taxRate:
        profileGstBillingType === 2
          ? isNaN(taxRateValue)
            ? null
            : taxRateValue
          : null, // Only save taxRate if GST is "Including GST"
      discount: discountValue,
    };

    if (editingProduct) {
      editProduct(editingProduct.id, productData);
      Alert.alert('Success', 'Product updated successfully!');
    } else {
      addProduct(productData);
      Alert.alert('Success', 'Product added successfully!');
    }

    resetProductForm();
    setProductModalVisible(false);
  };

  const handleEditProduct = product => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductStock(product.stock.toString());
    setProductCategory(product.category);
    setProductDescription(product.description || '');
    setProductSku(product.sku || '');
    setProductImage(product.image || null);
    setProductSideImage(product.sideImage || null);

    // Load NEW FIELDS for editing (Quantity REMOVED)
    setProductUnit(product.unit || '');
    if (product.taxRate !== undefined && product.taxRate !== null) {
      const foundRate = GST_PERCENTAGE_RATES.find(
        r => parseFloat(r.value) === product.taxRate,
      );
      if (foundRate) {
        setProductTaxRate(foundRate.value);
        setCustomProductTaxRate('');
      } else {
        setProductTaxRate('Other');
        setCustomProductTaxRate(product.taxRate.toString());
      }
    } else {
      setProductTaxRate('');
      setCustomProductTaxRate('');
    }
    setProductDiscount(product.discount ? product.discount.toString() : '');

    setProductErrors({}); // Clear any previous errors when opening for edit
    setProductModalVisible(true);
  };

  const handleDeleteProduct = product => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            Alert.alert('Success', 'Product deleted successfully!');
          },
        },
      ],
    );
  };

  // Centralized handler for all product form field changes
  const handleProductFieldChange = (key, value) => {
    switch (key) {
      case 'productTaxRate':
        setProductTaxRate(value);
        if (value !== 'Other') {
          setCustomProductTaxRate(''); // Clear custom tax rate if not 'Other'
        }
        break;
      case 'productName':
        setProductName(value);
        break;
      case 'productPrice':
        setProductPrice(value.replace(/[^0-9.]/g, ''));
        break;
      case 'productStock':
        setProductStock(value.replace(/[^0-9]/g, ''));
        break;
      case 'productCategory':
        setProductCategory(value);
        break;
      case 'productDescription':
        setProductDescription(value);
        break;
      case 'productSku':
        setProductSku(value);
        break;
      // NEW FIELD HANDLERS (Quantity REMOVED)
      case 'productUnit':
        setProductUnit(value);
        break;
      case 'customProductTaxRate':
        setCustomProductTaxRate(value.replace(/[^0-9.]/g, ''));
        break;
      case 'productDiscount':
        setProductDiscount(value.replace(/[^0-9.]/g, ''));
        break;
      default:
        break;
    }
    // Clear the specific error for the field being changed
    setProductErrors(prevErrors => ({ ...prevErrors, [key]: undefined }));
  };

  // State and helper for the common SelectModal
  const [selectModal, setSelectModal] = useState({
    open: false,
    options: [],
    onChange: null,
    key: '',
    display: '',
    title: '',
  });

  const openProductSelect = (key, options, label) => {
    setSelectModal({
      open: true,
      options,
      key,
      onChange: v => {
        setSelectModal(modal => ({ ...modal, open: false }));
        handleProductFieldChange(key, v); // Use the centralized handler
      },
      // Determine display label based on the current value for the given key
      display:
        options.find(
          o =>
            o.value ===
            (key === 'productCategory'
              ? productCategory
              : key === 'productUnit'
              ? productUnit
              : productTaxRate),
        )?.label || '',
      title: label,
    });
  };

  // const fetchProducts = async () => {
  //   try {  
  //     const productResponse = await getProductsByUserId(userId);
  //     if (productResponse?.status === 0) {
  //       // Handle successful product fetch
  //     } else {
  //       Alert.alert(
  //         'Something Went Wrong',
  //         'Failed to fetch the latest products.',
  //         [{ text: 'OK' }],
  //       );
  //     }
  //   } catch (err) {
  //     if (err?.code === 401) {
  //       Alert.alert(
  //         'Unauthorised',
  //         'Your session has expired. Please log in again.',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {
  //               logout();
  //             },
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //     } else {
  //       Alert.alert(
  //         'Something Went Wrong',
  //         'Failed to fetch Products details. Please try again after some time',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {},
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //     }
  //   }
  // };

  // const fetchCategories = async () => {
  //   try {
      
  //     const categoriesResponse = await getCategoryDetails(userId);
  //     if (categoriesResponse?.status === 0) {
  //       // Handle successful categories fetch
  //     } else {
  //       Alert.alert(
  //         'Something Went Wrong',
  //         'Failed to fetch the latest categories.',
  //         [{ text: 'OK' }],
  //       );
  //     }
  //   } catch (err) {
  //     if (err?.code === 401) {
  //       Alert.alert(
  //         'Unauthorised',
  //         'Your session has expired. Please log in again.',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {
  //               logout();
  //             },
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //     } else {
  //       Alert.alert(
  //         'Something Went Wrong',
  //         'Failed to fetch Categories details. Please try again after some time',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {},
  //           },
  //         ],
  //         { cancelable: false },
  //       );
  //     }
  //   } 
  // };

  // --- useFocusEffect for reloading UI on screen focus ---
  
  
  
  
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchData() {
        try {
          setIsLoading(true);

          await fetchProducts(userId);
          await fetchCategories(userId);

        } catch (error) {
          console.log(error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      fetchData();

      return () => {
        isActive = false;
        console.log(
          'ProductManagementScreen blurred. Cleaning up if necessary.',
        );
      };
    }, []),
  );
  // --- End of useFocusEffect ---

  // Filter data based on search (correctly applies to the active tab's search state)
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  console.log('filteredCategories:', filteredCategories);

  const filteredProducts = products.filter(
    prod =>
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (prod.sku &&
        prod.sku.toLowerCase().includes(productSearch.toLowerCase())),
  );

  const getStockStatus = stock => {
    if (stock === 0)
      return { status: 'Out of Stock', color: '#E74C3C', icon: AlertTriangle };
    if (stock <= 10)
      return { status: 'Low Stock', color: '#FFC107', icon: TrendingDown };
    return { status: 'In Stock', color: '#28A745', icon: TrendingUp };
  };

  const CategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <View
        style={[styles.categoryColorIndicator, { backgroundColor: item.color }]}
      />
      <View style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.categoryMeta}>
            <Package size={14} color="#888888" strokeWidth={2} />
            <Text style={styles.categoryCount}>
              {products.filter(p => p.category === item.name).length} products
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditCategory(item)}
            activeOpacity={0.7}
          >
            <Edit size={18} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(item)}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF6347" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ProductItem = ({ item }) => {
    const stockInfo = getStockStatus(item.stock);
    const StockIcon = stockInfo.icon;

    return (
      <View style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Package size={32} color="#CCCCCC" strokeWidth={1.5} />
            </View>
          )}
        </View>
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              ₹{item.price !== undefined ? item.price.toFixed(2) : 'N/A'}
            </Text>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: stockInfo.color + '20' },
              ]}
            >
              <StockIcon size={12} color={stockInfo.color} strokeWidth={2.5} />
              <Text style={[styles.stockText, { color: stockInfo.color }]}>
                {item.stock}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(item)}
            activeOpacity={0.7}
          >
            <Edit size={18} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item)}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF6347" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {/* Tab Navigation (RESTORED TO ORIGINAL UI) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'categories' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('categories')}
              activeOpacity={0.7}
            >
              <Tag
                size={18}
                color={activeTab === 'categories' ? '#FFFFFF' : '#888888'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'categories' && styles.activeTabText,
                ]}
              >
                Categories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'products' && styles.activeTab]}
              onPress={() => setActiveTab('products')}
              activeOpacity={0.7}
            >
              <Package
                size={18}
                color={activeTab === 'products' ? '#FFFFFF' : '#888888'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'products' && styles.activeTabText,
                ]}
              >
                Products
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar (RESTORED TO ORIGINAL UI) */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#999999" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                activeTab === 'categories'
                  ? 'Search categories...'
                  : 'Search products...'
              }
              placeholderTextColor="#999999"
              value={
                activeTab === 'categories' ? categorySearch : productSearch
              }
              onChangeText={
                activeTab === 'categories'
                  ? setCategorySearch
                  : setProductSearch
              }
            />
          </View>

          {/* Content Area (RESTORED TO ORIGINAL UI - shows content based on active tab) */}
          <View style={styles.content}>
            {activeTab === 'categories' ? (
              filteredCategories.length > 0 ? (
                <FlatList
                  data={filteredCategories}
                  keyExtractor={item => item.id}
                  renderItem={CategoryItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Tag size={48} color="#CCCCCC" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>No Categories Yet</Text>
                  <Text style={styles.emptyText}>
                    Start by adding your first category
                  </Text>
                </View>
              )
            ) : // activeTab === 'products'
            filteredProducts.length > 0 ? (
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={ProductItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Package size={48} color="#CCCCCC" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No Products Yet</Text>
                <Text style={styles.emptyText}>
                  Start by adding your first product
                </Text>
              </View>
            )}
          </View>

          {/* Floating Action Button (RESTORED TO ORIGINAL UI - opens modal based on active tab) */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              if (activeTab === 'categories') {
                resetCategoryForm();
                setCategoryModalVisible(true);
              } else {
                // activeTab === 'products'
                resetProductForm();
                setProductModalVisible(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Category Modal (now includes description) */}
          <Modal
            visible={categoryModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    resetCategoryForm();
                    setCategoryModalVisible(false);
                  }}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#1C1C1C" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </Text>
                <TouchableOpacity
                  onPress={handleSaveCategory}
                  style={styles.modalSaveButton}
                >
                  <Save size={20} color="#FF6347" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      categoryErrors.categoryName && styles.inputErrorBorder,
                    ]}
                    value={categoryName}
                    onChangeText={v => {
                      setCategoryName(v);
                      setCategoryErrors(errors => ({ ...errors, categoryName: undefined }));
                    }}
                    placeholder="Enter category name"
                    placeholderTextColor="#AAAAAA"
                    autoFocus
                  />
                  {categoryErrors.categoryName && (
                    <Text style={styles.inputErrorText}>
                      {categoryErrors.categoryName}
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={categoryDescription}
                    onChangeText={v => setCategoryDescription(v)}
                    placeholder="Enter category description"
                    placeholderTextColor="#AAAAAA"
                    multiline
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Choose Color</Text>
                  <View style={styles.colorGrid}>
                    {CATEGORY_COLORS.map((color, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          categoryColor === color && styles.selectedColor,
                        ]}
                        onPress={() => setCategoryColor(color)}
                        activeOpacity={0.8}
                      />
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Product Modal (NEW FIELDS INTEGRATED HERE, UI PRESERVED) */}
          <Modal
            visible={productModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    resetProductForm();
                    setProductModalVisible(false);
                  }}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#1C1C1C" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </Text>
                <TouchableOpacity
                  onPress={handleSaveProduct}
                  style={styles.modalSaveButton}
                >
                  <Save size={20} color="#FF6347" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Product Main Image Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Product Main Image (Optional)
                  </Text>
                  <TouchableOpacity
                    style={styles.imageUploadContainer}
                    onPress={() => pickProductImage(false)}
                    activeOpacity={0.7}
                  >
                    {productImage ? (
                      <Image
                        source={{ uri: productImage }}
                        style={styles.uploadedImage}
                      />
                    ) : (
                      <View style={styles.imageUploadPlaceholder}>
                        <Upload size={32} color="#CCCCCC" strokeWidth={1.5} />
                        <Text style={styles.imageUploadText}>
                          Tap to upload main image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Product Side Image Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Product Side Image (Optional)
                  </Text>
                  <TouchableOpacity
                    style={styles.imageUploadContainer}
                    onPress={() => pickProductImage(true)}
                    activeOpacity={0.7}
                  >
                    {productSideImage ? (
                      <Image
                        source={{ uri: productSideImage }}
                        style={styles.uploadedImage}
                      />
                    ) : (
                      <View style={styles.imageUploadPlaceholder}>
                        <Upload size={32} color="#CCCCCC" strokeWidth={1.5} />
                        <Text style={styles.imageUploadText}>
                          Tap to upload side image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Product Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Product Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      productErrors.productName && styles.inputErrorBorder,
                    ]}
                    value={productName}
                    onChangeText={v =>
                      handleProductFieldChange('productName', v)
                    }
                    placeholder="Enter product name"
                    placeholderTextColor="#AAAAAA"
                  />
                  {productErrors.productName && (
                    <Text style={styles.inputErrorText}>
                      {productErrors.productName}
                    </Text>
                  )}
                </View>

                {/* Price & Stock */}
                <View style={styles.inputRow}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}
                  >
                    <Text style={styles.inputLabel}>Price (₹) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        productErrors.productPrice && styles.inputErrorBorder,
                      ]}
                      value={productPrice}
                      onChangeText={v =>
                        handleProductFieldChange('productPrice', v)
                      }
                      placeholder="0.00"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />
                    {productErrors.productPrice && (
                      <Text style={styles.inputErrorText}>
                        {productErrors.productPrice}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Stock *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        productErrors.productStock && styles.inputErrorBorder,
                      ]}
                      value={productStock}
                      onChangeText={v =>
                        handleProductFieldChange('productStock', v)
                      }
                      placeholder="0"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="numeric"
                    />
                    {productErrors.productStock && (
                      <Text style={styles.inputErrorText}>
                        {productErrors.productStock}
                      </Text>
                    )}
                  </View>
                </View>

                {/* NEW: Unit (Quantity REMOVED, so Unit now takes full width in this row) */}
                <View style={styles.inputGroup}>
                  {' '}
                  {/* Changed from inputRow to inputGroup as only one field */}
                  <Text style={styles.inputLabel}>Unit *</Text>
                  <TouchableOpacity
                    onPress={() =>
                      openProductSelect(
                        'productUnit',
                        UNIT_OPTIONS,
                        'Select Unit',
                      )
                    }
                    style={[
                      styles.input,
                      styles.selectInput,
                      productErrors.productUnit && styles.inputErrorBorder,
                    ]}
                    activeOpacity={0.7}
                  >
                    {/* Text for selected Unit or placeholder */}
                    <Text
                      style={[
                        styles.selectText,
                        !productUnit && styles.selectPlaceholder,
                      ]}
                    >
                      {UNIT_OPTIONS.find(o => o.value === productUnit)?.label ||
                        'Select...'}
                    </Text>
                    <ChevronDown size={18} color="#999999" strokeWidth={2} />
                  </TouchableOpacity>
                  {productErrors.productUnit && (
                    <Text style={styles.inputErrorText}>
                      {productErrors.productUnit}
                    </Text>
                  )}
                </View>

                {/* Category Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <View
                    style={[
                      styles.categorySelector,
                      productErrors.productCategory && styles.inputErrorBorder,
                    ]}
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryOption,
                            productCategory === cat.name &&
                              styles.selectedCategoryOption,
                          ]}
                          onPress={() =>
                            handleProductFieldChange(
                              'productCategory',
                              cat.name,
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.categoryDot,
                              { backgroundColor: cat.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.categoryOptionText,
                              productCategory === cat.name &&
                                styles.selectedCategoryOptionText,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noCategoriesText}>
                        No categories available. Add a category first.
                      </Text>
                    )}
                  </View>
                  {productErrors.productCategory && (
                    <Text style={styles.inputErrorText}>
                      {productErrors.productCategory}
                    </Text>
                  )}
                </View>

                {/* NEW: Tax Rate - Conditional based on profileGstBillingType */}
                {profileGstBillingType === 2 && ( // Only show if profile has "Including GST"
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tax Rate *</Text>
                    <TouchableOpacity
                      onPress={() =>
                        openProductSelect(
                          'productTaxRate',
                          GST_PERCENTAGE_RATES,
                          'Select Tax Rate',
                        )
                      }
                      style={[
                        styles.input,
                        styles.selectInput,
                        productErrors.productTaxRate && styles.inputErrorBorder,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          !productTaxRate && styles.selectPlaceholder,
                        ]}
                      >
                        {GST_PERCENTAGE_RATES.find(
                          o => o.value === productTaxRate,
                        )?.label || 'Select...'}
                      </Text>
                      <ChevronDown size={18} color="#999999" strokeWidth={2} />
                    </TouchableOpacity>
                    {productErrors.productTaxRate && (
                      <Text style={styles.inputErrorText}>
                        {productErrors.productTaxRate}
                      </Text>
                    )}

                    {/* Conditional Custom Tax Rate Input if "Other" is selected */}
                    {productTaxRate === 'Other' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                          Custom Tax Rate (%) *
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            productErrors.customProductTaxRate &&
                              styles.inputErrorBorder,
                          ]}
                          value={customProductTaxRate}
                          onChangeText={v =>
                            handleProductFieldChange('customProductTaxRate', v)
                          }
                          placeholder="e.g. 10.5"
                          placeholderTextColor="#AAAAAA"
                          keyboardType="numeric"
                        />
                        {productErrors.customProductTaxRate && (
                          <Text style={styles.inputErrorText}>
                            {productErrors.customProductTaxRate}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* NEW: Discount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount (Optional)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      productErrors.productDiscount && styles.inputErrorBorder,
                    ]}
                    value={productDiscount}
                    onChangeText={v =>
                      handleProductFieldChange('productDiscount', v)
                    }
                    placeholder="0-100%"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="numeric"
                  />
                  {productErrors.productDiscount && (
                    <Text style={styles.inputErrorText}>
                      {productErrors.productDiscount}
                    </Text>
                  )}
                </View>

                {/* SKU */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SKU (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={productSku}
                    onChangeText={v =>
                      handleProductFieldChange('productSku', v)
                    }
                    placeholder="Auto-generated if empty"
                    placeholderTextColor="#AAAAAA"
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={productDescription}
                    onChangeText={v =>
                      handleProductFieldChange('productDescription', v)
                    }
                    placeholder="Product description (optional)"
                    placeholderTextColor="#AAAAAA"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Common Select Modal for product fields */}
          <SelectModal
            visible={selectModal.open}
            options={selectModal.options}
            // Determine current value based on the key
            value={
              selectModal.key === 'productCategory'
                ? productCategory
                : selectModal.key === 'productUnit'
                ? productUnit
                : productTaxRate
            }
            onSelect={v => {
              selectModal.onChange && selectModal.onChange(v);
            }}
            onRequestClose={() => setSelectModal(m => ({ ...m, open: false }))}
            title={selectModal.title}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    // Adjusted paddingTop to account for status bar and tab bar
    paddingTop: 110,
  },
  // NEW: Loading overlay styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Ensure it's above other content
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FF6347',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1C',
    marginLeft: 10,
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80, // Add padding to make space for the FAB
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryColorIndicator: {
    height: 4,
    width: '100%',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#8f8f8f',
    marginBottom: 6,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryCount: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 150,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  // Added for validation error borders
  inputErrorBorder: {
    borderColor: '#FF6347',
    borderWidth: 1.5,
  },
  // Added for validation error text
  inputErrorText: {
    fontSize: 12,
    color: '#FF6347',
    marginTop: 4,
    marginLeft: 4,
  },
  selectInput: {
    // Style for TouchableOpacity acting as a select input
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1C',
  },
  selectPlaceholder: {
    color: '#AAAAAA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  imageUploadContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageUploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 12,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1C1C1C',
    transform: [{ scale: 1.1 }],
  },
  categoryDescription: {
    fontSize: 13,
    color: '#8f8f8f',
    marginBottom: 6,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8F8F8', // Added background for consistency
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Changed to white for distinction from selector background
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedCategoryOption: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#1C1C1C',
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noCategoriesText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    width: '100%',
  },
  // --- Modal styles for SelectModal (unchanged) ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  // modalTitle is already in main styles, re-using
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#FFF5F5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  modalOptionTextSelected: {
    color: '#FF6347',
    fontWeight: '600',
  },
  modalCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6347',
  },
  modalCancelButton: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#F8F8F8',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
});
