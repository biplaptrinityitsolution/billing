// src/screens/admin/AddEditEmployeeScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Modal, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// Removed LinearGradient import
import * as Animatable from 'react-native-animatable';
import { User, Mail, Phone, UserCog, Briefcase, ShoppingBasket, ChefHat, Users, ChevronsUpDown, Check, CheckCircle, X, ArrowLeft } from 'lucide-react-native';
import { AlertContext } from '../../context/AuthContext';
import { InventoryContext } from '../../context/InventoryContext'; // Assuming this context provides employee data

const ROLES = [
  { label: 'Manager', icon: Briefcase },
  { label: 'Cashier', icon: ShoppingBasket },
  { label: 'Chef', icon: ChefHat },
  { label: 'Waiter', icon: Users },
  { label: 'Admin', icon: UserCog },
];

export default function AddEditEmployeeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const alertCtx = useContext(AlertContext);
  const { addEmployee, editEmployee } = useContext(InventoryContext);
  const editing = route.params && route.params.employee;
  const init = editing ? route.params.employee : {};
  const [name, setName] = useState(init.name || '');
  const [email, setEmail] = useState(init.email || '');
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [roleIdx, setRoleIdx] = useState(
    init.role ? ROLES.findIndex(r => r.label === init.role) : 0
  );
  const role = ROLES[roleIdx]?.label;
  const [phone, setPhone] = useState(init.phone || '');
  const [status, setStatus] = useState(init.status || 'Active');

  function validateEmail(val) {
    return /.+@.+\..+/.test(val);
  }

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      alertCtx.showAlert({ title: 'Validation Error', message: 'Name and valid email are required.', type: 'warning' });
      return;
    }
    if (!validateEmail(email.trim())) {
      alertCtx.showAlert({ title: 'Validation Error', message: 'Invalid email format.', type: 'warning' });
      return;
    }
    const emp = { name: name.trim(), email: email.trim(), role, phone: phone.trim(), status };
    if (editing) {
      editEmployee(init.id, emp);
      alertCtx.showAlert({ title: 'Employee Updated', message: `${name} has been updated!`, type: 'success' });
    } else {
      addEmployee(emp);
      alertCtx.showAlert({ title: 'Employee Added', message: `${name} has been added!`, type: 'success' });
    }
    navigation.goBack();
  };

  const currentRoleIcon = ROLES[roleIdx].icon;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7FCEA" />

      {/* Decorative Elements (from Splash/Login) */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Custom Header */}
     

      <Animatable.View animation="fadeInUp" delay={100} style={styles.formCard}>
        <View style={styles.inputGroup}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <User size={18} color="#2C3E50" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#95A5A6"
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Mail size={18} color="#2C3E50" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#95A5A6"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <UserCog size={18} color="#2C3E50" />
            </View>
            <TouchableOpacity style={styles.rolePicker} onPress={() => setRolePickerOpen(true)} activeOpacity={0.81}>
              <Text style={styles.rolePickerText}>{role}</Text>
              <ChevronsUpDown size={18} color="#7F8C8D" style={{ marginLeft: 7 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Phone size={18} color="#2C3E50" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#95A5A6"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.label}>Status:</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[styles.statusBtn, status === 'Active' && styles.statusActive]}
              onPress={() => setStatus('Active')}
              activeOpacity={0.8}
            >
              <CheckCircle size={18} color={status === 'Active' ? "#28A745" : "#7F8C8D"} />
              <Text style={[styles.statusText, { color: status === 'Active' ? "#28A745" : "#7F8C8D" }]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusBtn, status === 'Inactive' && styles.statusInactive]}
              onPress={() => setStatus('Inactive')}
              activeOpacity={0.8}
            >
              <X size={18} color={status === 'Inactive' ? "#E74C3C" : "#7F8C8D"} />
              <Text style={[styles.statusText, { color: status === 'Inactive' ? "#E74C3C" : "#7F8C8D" }]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.84}>
          <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Add Employee'}</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Modal visible={rolePickerOpen} transparent animationType="fade" onRequestClose={()=>setRolePickerOpen(false)}>
        <TouchableOpacity style={styles.rolePickerOverlay} onPress={() => setRolePickerOpen(false)} activeOpacity={1}>
          <Animatable.View animation="fadeInUp" duration={250} style={styles.rolePickerModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.rolePickerTitle}>Select Role</Text>
            {ROLES.map((r, idx) => {
              const RoleIcon = r.icon;
              return (
                <TouchableOpacity
                  key={r.label}
                  style={[styles.roleOption, idx === roleIdx && styles.roleOptionSelected]}
                  onPress={() => { setRoleIdx(idx); setRolePickerOpen(false); }}
                  activeOpacity={0.75}
                >
                  <View style={styles.roleOptionIconContainer}>
                    <RoleIcon size={20} color={idx === roleIdx ? "#2C3E50" : "#7F8C8D"} />
                  </View>
                  <Text style={[styles.roleOptionText, idx === roleIdx && styles.roleOptionTextSelected]}>{r.label}</Text>
                  {idx === roleIdx && <Check size={18} color="#2C3E50" />}
                </TouchableOpacity>
              );
            })}
          </Animatable.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Consistent background
    position: 'relative',
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
  backButton: { // Consistent back button style
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitleContainer: {
    flex: 1, // Allow title to take remaining space
  },
  heading: {
    fontSize: 24, // Consistent heading size
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  inputGroup: {
    marginBottom: 25, // Margin for the entire group of inputs
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light grey/cream background
    borderRadius: 14, // Consistent roundedness
    paddingHorizontal: 16,
    marginBottom: 15, // Margin between input rows
    height: 56, // Fixed height for inputs
    borderWidth: 1, // Subtle border
    borderColor: '#E8E8E8',
    // Subtle shadow for input rows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputIconContainer: { // New container for input icons
    width: 32, // Fixed width for icon container
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50', // Dark text
    backgroundColor: 'transparent',
    paddingVertical: 0, // Remove default vertical padding
  },
  label: {
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text
    fontSize: 16,
    marginBottom: 10,
  },
  statusSection: {
    marginBottom: 25, // Margin below status section
  },
  statusOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12, // Gap between status buttons
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light grey/cream background
    borderRadius: 14, // Consistent roundedness
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2, // Border always present
    borderColor: 'transparent', // Default transparent
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusActive: {
    borderColor: '#28A745', // Green border for active
  },
  statusInactive: {
    borderColor: '#E74C3C', // Red border for inactive
  },
  saveBtn: {
    backgroundColor: '#2C3E50', // Primary dark button color
    alignItems: 'center',
    marginTop: 15, // Adjusted margin
    borderRadius: 14, // Consistent roundedness
    paddingVertical: 14, // Adjusted padding
    // Consistent shadow for primary button
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.08,
  },
  rolePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // It's already inheriting inputRow's background and border
    paddingVertical: 0, // Ensure it doesn't add extra padding
  },
  rolePickerText: { // New style for the text inside role picker
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  rolePickerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // Consistent overlay background
    zIndex: 8,
    justifyContent: 'center', // Center the modal vertically
    alignItems: 'center', // Center the modal horizontally
  },
  rolePickerModal: {
    width: '85%', // Responsive width
    maxWidth: 300, // Max width
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 20, // Consistent roundedness
    zIndex: 9,
    padding: 22,
    // Consistent shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 7,
  },
  rolePickerTitle: {
    fontWeight: 'bold',
    fontSize: 18, // Consistent title size
    color: '#2C3E50', // Dark text
    marginBottom: 16, // Consistent margin
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10, // Slightly rounded
    marginBottom: 8, // Margin between options
    backgroundColor: 'transparent', // Default transparent
  },
  roleOptionSelected: {
    backgroundColor: '#F8F9FA', // Light background for selected option
  },
  roleOptionIconContainer: { // New container for role option icons
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50', // Dark text
    flex: 1, // Allow text to take space
  },
  roleOptionTextSelected: {
    fontWeight: 'bold', // Bold text for selected option
  },
});