// src/screens/employee/ProductsScreen.js
import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, TextInput, ScrollView } from 'react-native';
import { Package, Plus, Search, Filter, AlertCircle, Heart } from 'lucide-react-native';
import { InventoryContext } from '../../context/InventoryContext';
import { BillingContext } from '../../context/BillingContext';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductsScreen() {
  const { products, categories } = useContext(InventoryContext);
  const { addToCart } = useContext(BillingContext);
  const   alertCtx = useContext(AuthContext);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoryOptions = useMemo(() => [
    t('common.all'),
    ...(categories?.map(c => c.name) || [])
  ], [categories, t]);

  const filteredProducts = useMemo(() => {
    let currentProducts = products;

    if (selectedCategory === t('products.top100')) {
      currentProducts = [...products]
        .sort((a, b) => {
          if (b.stock !== a.stock) {
            return b.stock - a.stock;
          }
          return b.price - a.price;
        })
        .slice(0, 100);
    } else if (selectedCategory !== 'All' && selectedCategory !== t('common.all')) {
      currentProducts = products.filter(p => p.category === selectedCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      currentProducts = currentProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    return currentProducts;
  }, [products, searchQuery, selectedCategory, t, categories]);

  const handleAdd = (product) => {
    if (product.stock === 0) {
      alertCtx.showAlert({
        title: t('products.outOfStock'),
        message: t('products.itemUnavailable'),
        type: 'warning'
      });
      return;
    }
    addToCart(product);
    alertCtx.showAlert({
      title: t('common.success'),
      message: t('messages.itemAddedToCart'),
      type: 'success'
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}

      <TouchableOpacity style={styles.favoriteButton}>
        <Heart size={16} color="#FF6347" />
      </TouchableOpacity>

      <View style={styles.imageBox}>
        <View style={styles.iconContainer}>
          <Package size={48} color="#D1D5DB" strokeWidth={1.5} />
        </View>

        {item.stock !== undefined && item.stock <= 5 && (
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: item.stock === 0 ? '#EF4444' : '#F59E0B' }
            ]}
          >
            <Text style={styles.stockText}>
              {item.stock === 0 ? t('products.outOfStock') : item.stock}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
            {item.category}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityText} numberOfLines={1}>
            {item.stock !== undefined && item.unit ? `${item.stock} ${item.unit}` : ' '}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          {item.discount > 0 ? (
            <>
              <Text style={styles.originalPrice} numberOfLines={1}>
                ₹{item.price.toFixed(2)}
              </Text>
              <Text style={styles.price} numberOfLines={1}>
                ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.price} numberOfLines={1}>
              ₹{item.price !== undefined ? item.price.toFixed(2) : 'N/A'}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}
        onPress={() => handleAdd(item)}
        disabled={item.stock === 0}
        activeOpacity={0.8}
      >
        <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoryChips}
      >
        {categoryOptions.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.categoryChip,
              selectedCategory === c && styles.categoryChipSelected
            ]}
            onPress={() => setSelectedCategory(c)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === c && styles.categoryChipTextSelected
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <AlertCircle size={40} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyStateTitle}>{t('products.noProducts')}</Text>
          <Text style={styles.emptyStateText}>
            {t('products.tryAdjustingSearch')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 80 } // Add bottom padding for navbar
          ]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA',
    paddingTop: 110,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 99, 71, 0.03)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(72, 187, 120, 0.03)',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 15,
    color: '#1C1C1C',
    fontWeight: '400',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryChips: {
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryChipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    color: '#6B6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    width: (width - 48) / 2,
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
    justifyContent: 'space-between',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6347',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  imageBox: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    bottom: -6,
    right: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  stockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    textAlign: 'left',
    marginBottom: 4,
    lineHeight: 18,
    height: 36,
  },
  categoryBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginBottom: 4,
    height: 18,
  },
  category: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '400',
  },
  quantityContainer: {
    marginBottom: 4,
    paddingVertical: 2,
    height: 20,
  },
  quantityText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    height: 24,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  addBtn: {
    width: '100%',
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#E0E0E0',
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
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});