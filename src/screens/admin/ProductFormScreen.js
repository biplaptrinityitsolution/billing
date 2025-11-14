// src/screens/admin/ProductFormScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {
  Package,
  Tag,
  DollarSign,
  FolderKanban,
  Layers,
  CheckCircle,
  Check,
} from 'lucide-react-native';
import { AlertContext } from '../../context/AuthContext';
import { InventoryContext } from '../../context/InventoryContext';

export default function ProductFormScreen({ product, onClose }) {
  const navigation = useNavigation();
  const route = useRoute();
  const alertCtx = useContext(AlertContext);
  const { categories, addProduct, editProduct } = useContext(InventoryContext);

  // Support both modal usage (with product prop) and navigation usage (with route params)
  const editing = product || (route.params && route.params.product);
  const init = editing ? product || route.params.product : {};
  const [name, setName] = useState(init.name || '');
  const [price, setPrice] = useState(init.price ? String(init.price) : '');
  const [category, setCategory] = useState(
    init.category || (categories[0] && categories[0].name),
  );
  const [stock, setStock] = useState(
    init.stock !== undefined ? String(init.stock) : '',
  );
  const [desc, setDesc] = useState(init.desc || '');
  const [catPickerOpen, setCatPickerOpen] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !category) {
      alertCtx.showAlert({
        title: 'Missing Info',
        message: 'Name, price, and category are required.',
        type: 'warning',
      });
      return;
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      alertCtx.showAlert({
        title: 'Price Error',
        message: 'Please enter a valid price.',
        type: 'warning',
      });
      return;
    }
    if (stock && (isNaN(Number(stock)) || Number(stock) < 0)) {
      alertCtx.showAlert({
        title: 'Stock Error',
        message: 'Stock must be a positive number.',
        type: 'warning',
      });
      return;
    }
    const prod = {
      name: name.trim(),
      price: Number(price),
      category,
      stock: stock ? Number(stock) : 0,
      desc,
    };
    if (editing) {
      editProduct(init.id, prod);
      alertCtx.showAlert({
        title: 'Product Updated',
        message: `${name} was updated.`,
        type: 'success',
      });
    } else {
      addProduct(prod);
      alertCtx.showAlert({
        title: 'Product Added',
        message: `${name} was added!`,
        type: 'success',
      });
    }

    // Close modal if used in modal, otherwise navigate back
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  const renderCategoryOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.catOption,
        category === item.name && styles.catOptionSelected,
      ]}
      onPress={() => {
        setCategory(item.name);
        setCatPickerOpen(false);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.catBadge, { backgroundColor: item.color + '33' }]}>
        {' '}
        <FolderKanban size={18} color={item.color} />{' '}
      </View>
      <Text style={styles.catOptionText}>{item.name}</Text>
      {category === item.name && <Check size={18} color={item.color} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* header/gradient omitted per your edit */}
      <Animatable.View animation="fadeInUp" delay={100} style={styles.formCard}>
        <View style={styles.inputRow}>
          <Tag size={18} color="#7f53ac" />
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#bbb"
          />
        </View>
        <View style={styles.inputRow}>
          <DollarSign size={18} color="#7f53ac" />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputRow}>
          <FolderKanban size={18} color="#7f53ac" />
          <TouchableOpacity
            style={[
              styles.input,
              { flexDirection: 'row', alignItems: 'center' },
            ]}
            activeOpacity={0.81}
            onPress={() => setCatPickerOpen(true)}
          >
            <Text style={[styles.input, { marginLeft: 0 }]}>
              {category || 'Choose category'}
            </Text>
            <Layers size={15} color="#b4abff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        <Modal visible={catPickerOpen} transparent animationType="fade">
          <TouchableOpacity
            style={styles.catPickerOverlay}
            onPress={() => setCatPickerOpen(false)}
            activeOpacity={1}
          />
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.catPickerModal}
          >
            <Text style={styles.catPickerTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={renderCategoryOption}
              style={{ width: '100%' }}
            />
          </Animatable.View>
        </Modal>
        <View style={styles.inputRow}>
          <Package size={18} color="#7f53ac" />
          <TextInput
            style={styles.input}
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            placeholderTextColor="#bbb"
            keyboardType="number-pad"
          />
        </View>
        {/* Placeholder for image... */}
        <View style={styles.inputRow}>
          <Image
            source={require('../../../assets/images/empty_box.png')}
            style={{ width: 44, height: 44, borderRadius: 13, marginRight: 13 }}
          />
          <Text style={{ color: '#bbb' }}>Add product images in future</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                height: 58,
                textAlignVertical: 'top',
                paddingTop: 11,
                minHeight: 48,
              },
            ]}
            placeholder="Description (optional)"
            value={desc}
            onChangeText={setDesc}
            placeholderTextColor="#bbb"
            multiline
          />
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.86}
        >
          <CheckCircle size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>
            {editing ? 'Save Changes' : 'Add Product'}
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F8FB' },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 19,
    padding: 25,
    marginHorizontal: 19,
    shadowColor: '#888',
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 2,
    marginBottom: 28,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6fc',
    borderRadius: 11,
    paddingHorizontal: 13,
    marginBottom: 15,
    shadowColor: '#efeefd',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#2c3651',
    backgroundColor: 'transparent',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    alignSelf: 'center',
    marginTop: 11,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 34,
    elevation: 2,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: 'bold',
    letterSpacing: 0.08,
  },
  // Category Picker Specific
  catPickerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0009',
    zIndex: 8,
  },
  catPickerModal: {
    position: 'absolute',
    left: 25,
    right: 25,
    top: '32%',
    backgroundColor: '#fff',
    borderRadius: 14,
    zIndex: 9,
    padding: 22,
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#667eea',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  catPickerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#667eea',
    marginBottom: 14,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 9,
    marginBottom: 3,
  },
  catOptionSelected: { backgroundColor: '#eef0fa' },
  catBadge: {
    width: 31,
    height: 31,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  catOptionText: { fontSize: 16, fontWeight: '600', color: '#2a3266', flex: 1 },
});
