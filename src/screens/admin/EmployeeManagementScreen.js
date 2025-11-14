// src/screens/admin/EmployeeManagementScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Removed LinearGradient import
import * as Animatable from 'react-native-animatable';
import { Plus, User, UserCog, Mail, Phone, Trash2, Edit, UserX, Search } from 'lucide-react-native';
import { AlertContext } from '../../context/AuthContext';
import { InventoryContext } from '../../context/InventoryContext'; // Assuming this context provides employee data

const STATUS_COLORS = {
  Active: '#28A745', // Green for active
  Inactive: '#E74C3C' // Red for inactive
};

// Mock Employee Data (if InventoryContext doesn't provide it yet)
const MOCK_EMPLOYEES = [
  { id: 'emp1', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', role: 'Admin', status: 'Active' },
  { id: 'emp2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '098-765-4321', role: 'Employee', status: 'Active' },
  { id: 'emp3', name: 'Mike Johnson', email: 'mike.j@example.com', phone: '555-123-4567', role: 'Employee', status: 'Inactive' },
];

export default function EmployeeManagementScreen() {
  const { employees, deleteEmployee } = useContext(InventoryContext);
  const currentEmployees = employees.length > 0 ? employees : MOCK_EMPLOYEES; // Use mock if real are empty

  const alertCtx = useContext(AlertContext);
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const filtered = currentEmployees.filter(e => (
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.role && e.role.toLowerCase().includes(search.toLowerCase())) ||
    (e.phone && e.phone.includes(search))
  ));

  const handleDelete = id => {
    alertCtx.showAlert({
      title: 'Remove Employee',
      message: 'Are you sure you want to remove this employee?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteEmployee(id);
        alertCtx.showAlert({ title: 'Removed!', message: 'Employee removed.', type: 'info' });
      },
    });
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={130 + index * 55} useNativeDriver>
      <View style={styles.card}> {/* Consistent card style */}
        <View style={styles.iconCircle}> <User size={26} color="#2C3E50" /> </View>
        <View style={styles.infoCol}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Mail size={15} color="#7F8C8D" style={{marginRight: 4}} />
            <Text style={styles.metaText} numberOfLines={1} ellipsizeMode='tail'>{item.email}</Text>
          </View>
          <View style={styles.metaRow}>
            <Phone size={15} color="#7F8C8D" style={{marginRight: 4}} />
            <Text style={styles.metaText}>{item.phone}</Text>
          </View>
          <View style={styles.roleRow}>
            <UserCog size={18} color="#2C3E50" />
            <Text style={styles.role}>{item.role}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '15' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditEmployee', { employee: item })}
            style={styles.actionButton} // Consistent action button style
            activeOpacity={0.76}
          >
            <Edit size={17} color="#2C3E50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton} // Consistent action button style
            activeOpacity={0.76}
          >
            <Trash2 size={17} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header Section */}
      <Animatable.View animation="fadeInDown" style={styles.headerContainer}>
        

        {/* Search Bar */}
        <Animatable.View animation="fadeIn" delay={250} style={styles.searchContainer}>
          <Search size={20} color="#7F8C8D" style={{ marginRight: 10 }}/>
          <TextInput
            placeholder="Search employees ..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#95A5A6"
          />
        </Animatable.View>
      </Animatable.View>

      {filtered.length === 0 ? (
        <Animatable.View animation="fadeIn" delay={350} style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}><UserX size={52} color="#95A5A6"/></View>
          <Text style={styles.empty}>No employees. Tap below to add.</Text>
          <TouchableOpacity style={styles.addEmptyBtn} onPress={()=>navigation.navigate('AddEditEmployee')} activeOpacity={0.85}>
            <Plus size={20} color="#fff" style={{marginRight:8}} />
            <Text style={styles.addEmptyBtnText}>Add Employee</Text>
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }} // Added horizontal padding
        />
      )}
      <Animatable.View animation="bounceIn" delay={500} style={styles.fabWrap}>
        <TouchableOpacity style={styles.fab} onPress={()=>navigation.navigate('AddEditEmployee')} activeOpacity={0.86}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
  headerContainer: { // Replaces headerWrap and gradientHeader
    backgroundColor: '#FFFFFF', // White background
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    marginBottom: 20, // Space below header
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
    padding: 16, // Adjusted padding
    borderRadius: 20, // Consistent roundedness
    marginBottom: 12, // Consistent margin bottom
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: { // Consistent icon circle style
    width: 48,
    height: 48,
    borderRadius: 15, // Rounded square
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
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 2,
  },
  metaRow: { // For email and phone
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    color: '#7F8C8D', // Lighter grey
    fontSize: 13,
    fontWeight: '500',
    flex: 1, // Allow text to take space
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6, // Adjusted margin
  },
  role: {
    fontSize: 13.4,
    color: '#2C3E50', // Dark text
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 10, // Increased margin
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // More rounded for badge
    // Background color set dynamically
  },
  statusText: {
    fontSize: 11.7,
    fontWeight: 'bold',
    // Color set dynamically
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, // Adjusted margin
    gap: 8,
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
    paddingHorizontal: 20,
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
  emptyIconCircle: { // Consistent empty state icon container
    width: 100,
    height: 100,
    borderRadius: 25, // Rounded square
    backgroundColor: '#F8F9FA', // Light grey background
    alignItems: 'center',
    justifyContent: 'center',
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
    bottom: 30, // Adjusted position to clear floating tab bar
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
});