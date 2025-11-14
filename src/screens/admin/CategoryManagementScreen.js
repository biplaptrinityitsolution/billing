// src/screens/admin/CategoryManagementScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Edit, Trash2, FolderKanban, Search, ChevronRight } from 'lucide-react-native';
import { AlertContext } from '../../context/AuthContext';
// Removed LinearGradient import
import * as Animatable from 'react-native-animatable';
import { InventoryContext } from '../../context/InventoryContext';

const MOCK_CATEGORIES = [ // This mock data should ideally come from context or API
  { id: '1', name: 'Beverages', color: '#4A90E2', productCount: 34 },
  { id: '2', name: 'Snacks', color: '#FFC107', productCount: 15 },
  { id: '3', name: 'Electronics', color: '#6A82FB', productCount: 8 },
  { id: '4', name: 'Groceries', color: '#28A745', productCount: 22 },
];

export default function CategoryManagementScreen() {
  const navigation = useNavigation();
  const alertCtx = useContext(AlertContext);
  // Using MOCK_CATEGORIES for now as InventoryContext's categories might be empty
  const { categories, deleteCategory } = useContext(InventoryContext);
  const currentCategories = categories.length > 0 ? categories : MOCK_CATEGORIES; // Use mock if real are empty

  const [search, setSearch] = useState('');
  const [imageOk, setImageOk] = useState(true); // For the empty state image

  const filteredCategories = currentCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = id => {
    alertCtx.showAlert({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteCategory(id);
        alertCtx.showAlert({ title: 'Deleted', message: 'Category deleted.', type: 'success' });
      },
    });
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={160 + index * 60} useNativeDriver>
      <TouchableOpacity
        style={styles.card} // Using the consistent card style
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CategoryDetail', { category: item })} // Example navigation
      >
        <View style={styles.iconBadge}> {/* Consistent icon badge */}
          <FolderKanban size={20} color="#2C3E50" strokeWidth={2.5} />
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>
          <Text style={styles.productCount} numberOfLines={1} ellipsizeMode='tail'>{item.productCount} products</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditCategory', { category: item })}
            style={styles.actionButton} // Consistent action button style
            activeOpacity={0.7}
          >
            <Edit size={18} color="#2C3E50" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton} // Consistent action button style
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#E74C3C" strokeWidth={2.5} /> {/* Red for delete */}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header Section */}
      <Animatable.View animation="fadeInDown" duration={680} style={styles.headerContainer}>
        {/* Search Bar */}
        <Animatable.View animation="fadeIn" delay={300} duration={600} style={styles.searchContainer}>
          <Search size={20} color="#7F8C8D" style={styles.searchIcon} />
          <TextInput
            placeholder="Search categories ..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#95A5A6"
          />
        </Animatable.View>
      </Animatable.View>

      {filteredCategories.length === 0 ? (
        <Animatable.View animation="fadeIn" delay={400} style={styles.emptyContainer}>
          {imageOk ? ( // Keeping image fallback but preferring themed icon
            <View style={styles.emptyIconBox}>
                <FolderKanban size={52} color="#95A5A6" strokeWidth={1.8} />
            </View>
          ) : (
             <View style={styles.emptyIconBox}>
                <FolderKanban size={52} color="#95A5A6" strokeWidth={1.8} />
            </View>
          )}
          <Text style={styles.empty}>No categories yet. Start by adding your first!</Text>
          <TouchableOpacity style={styles.addEmptyBtn} onPress={() => navigation.navigate('AddEditCategory')} activeOpacity={0.85}>
            <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addEmptyBtnText}>Add Category</Text>
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }} // Added horizontal padding
        />
      )}

      {/* Floating Action Button */}
      <Animatable.View animation="bounceIn" delay={700} style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddEditCategory')}
          activeOpacity={0.88}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background color
    paddingTop: 0, // Handled by headerContainer
    position: 'relative',
    marginTop: -5,
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
  headerContainer: { // Replaces headerWrap and gradientHeader
    backgroundColor: '#FFFFFF', // White background
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
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
    marginBottom: 20, // Space below header
    marginLeft: 5,
    marginRight: 5,
  },
  headerContent: { // Content inside the header
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Space between header text and search bar
  },
  headerIconCircle: { // Consistent icon container
    width: 60,
    height: 60,
    borderRadius: 18, // Rounded square
    backgroundColor: '#FFF8F0', // Consistent cream background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#7F8C8D', // Lighter grey
    fontWeight: '500',
  },
  searchContainer: { // Consistent search bar style
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
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
    color: '#2C3E50',
    fontWeight: '500',
    paddingVertical: 0,
  },
  card: { // Consistent list item card style
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBadge: { // Consistent icon badge style
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0', // Consistent cream
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  productCount: {
    color: '#7F8C8D', // Lighter grey
    fontSize: 13,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10, // Adjust margin
  },
  actionButton: { // Consistent action button style
    width: 36,
    height: 36,
    borderRadius: 10, // Rounded square
    backgroundColor: '#F8F9FA', // Light grey/cream for actions
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50, // Adjusted margin
    paddingHorizontal: 20, // Added padding
  },
  empty: {
    textAlign: 'center',
    color: '#7F8C8D', // Lighter grey
    fontSize: 16,
    marginVertical: 16,
    marginBottom: 20, // Adjusted margin
    fontWeight: '500',
    lineHeight: 24,
  },
  emptyIconBox: { // Consistent empty state icon container
    width: 100,
    height: 100,
    borderRadius: 25, // Rounded square
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA', // Light grey for background
    marginBottom: 20,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  addEmptyBtn: { // Consistent primary button style
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2C3E50', // Primary dark button
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 5,
    borderRadius: 14, // Consistent roundedness
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  addEmptyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.07,
  },
  fabWrap: {
    position: 'absolute',
    right: 20, // Adjusted position
    bottom: 40, // Adjusted position to clear floating tab bar
    zIndex: 10,
    // Consistent FAB shadow
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOpacity: 0.25,
    shadowOffset: { height: 6, width: 0 },
    elevation: 10,
  },
  fab: { // Consistent FAB style
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50', // Primary dark color
  },
  // Removed unused styles: cardGrad, emptyImage, fabGrad
});