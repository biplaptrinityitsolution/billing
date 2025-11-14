// src/screens/admin/AddEditCategoryScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertContext } from '../../context/AuthContext';
import { FolderKanban, PaintBucket, Check } from 'lucide-react-native';
// Removed LinearGradient import
import * as Animatable from 'react-native-animatable';
import { InventoryContext } from '../../context/InventoryContext';

// Adjusted COLORS to fit the theme better, or use slightly more muted versions
const COLORS = [
  '#4A90E2', // Blue
  '#28A745', // Green
  '#FFC107', // Orange
  '#6A82FB', // Purple-blue
  '#E74C3C', // Red
  '#83C4B2', // Teal-green
  '#95A5A6', // Muted Grey
  '#D35400', // Darker Orange
  '#C0392B', // Darker Red
  '#7F8C8D'  // Even more muted grey
];

export default function AddEditCategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const alertCtx = useContext(AlertContext);
  const { addCategory, editCategory } = useContext(InventoryContext);
  const editing = route.params && route.params.category;
  const [name, setName] = useState(editing ? route.params.category.name : '');
  const [color, setColor] = useState(editing ? route.params.category.color : COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      alertCtx.showAlert({ title: 'Validation Error', message: 'Category name required.', type: 'warning' });
      return;
    }
    if (editing) {
      editCategory(route.params.category.id, { name: name.trim(), color });
      alertCtx.showAlert({
        title: 'Category Updated',
        message: `Category "${name}" has been updated!`,
        type: 'success',
      });
    } else {
      addCategory({ name: name.trim(), color });
      alertCtx.showAlert({
        title: 'Category Added',
        message: `Category "${name}" has been added!`,
        type: 'success',
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Custom Header (matching theme) */}
      

      <Animatable.View animation="fadeInUp" delay={130} style={styles.formCard}>
        <Text style={styles.label}>Category Name</Text>
        <Animatable.View animation="fadeIn" delay={240}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drinks"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#95A5A6" // Consistent placeholder color
          />
        </Animatable.View>
        <Text style={[styles.label, { marginTop: 25 }]}>Pick Color</Text> {/* Increased margin top */}
        <Animatable.View animation="fadeIn" delay={260} style={styles.colorRow}>
          {COLORS.map((c, index) => (
            <TouchableOpacity
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                color === c && styles.colorSwatchActive // Active state style
              ]}
              key={index} // Using index as key is okay if colors array is static
              onPress={() => setColor(c)}
              activeOpacity={0.82}
            >
              {color === c && <Check size={18} color="#FFFFFF" style={{ alignSelf: "center" }} />}
            </TouchableOpacity>
          ))}
        </Animatable.View>
        {editing && (
          <View style={{ marginTop: 25 }}> {/* Increased margin top */}
            <Text style={styles.label}>Product Count</Text>
            <View style={styles.countValueContainer}> {/* New container for consistent styling */}
              <Text style={styles.countValue}>{route.params.category.productCount || 0}</Text>
            </View>
          </View>
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.84}>
          <View style={styles.saveBtnContent}> {/* Replaced LinearGradient */}
            <PaintBucket size={19} color="#fff" strokeWidth={2.6} style={{ marginRight: 11 }} />
            <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Add Category'}</Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background color
    position: 'relative',
    paddingTop: 0, // Handled by headerContainer
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
  headerContainer: { // New style for header
    backgroundColor: '#FFFFFF', // White background
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    marginBottom: 20, // Space below header
  },
  headerContent: { // Content inside the header
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 28, // Consistent heading size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#7F8C8D', // Lighter grey
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 20, // Consistent roundedness
    padding: 24,
    marginHorizontal: 20, // Consistent horizontal margin
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30, // Adjusted margin
  },
  label: {
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 8, // Consistent margin
    fontSize: 16, // Consistent label size
  },
  input: {
    backgroundColor: '#F8F9FA', // Light grey/cream background
    borderRadius: 14, // Consistent roundedness
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C3E50', // Dark text
    borderWidth: 1,
    borderColor: '#E8E8E8', // Light border
  },
  colorRow: {
    flexDirection: 'row',
    marginTop: 10, // Adjusted margin
    marginBottom: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to start
    gap: 10, // Consistent gap
  },
  colorSwatch: {
    width: 40, // Larger swatch
    height: 40,
    borderRadius: 20, // Circle
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for swatches
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2, // Border always present
    borderColor: 'transparent', // Default transparent
  },
  colorSwatchActive: { // Active state for swatch
    borderColor: '#2C3E50', // Dark border for active
    shadowColor: '#2C3E50',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtn: {
    alignSelf: 'center',
    marginTop: 30, // Increased margin top
    // Consistent shadow for primary button
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 5,
    borderRadius: 14, // Consistent roundedness
  },
  saveBtnContent: { // Replaces saveBtnGrad
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: '#2C3E50', // Primary dark button color
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.13,
  },
  countValueContainer: { // New container for product count
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center', // Center text
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  countValue: {
    fontSize: 16,
    color: '#7F8C8D', // Lighter grey for count
    fontWeight: '500',
  },
});