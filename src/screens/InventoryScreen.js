import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { InventoryContext } from '../context/InventoryContext';

export default function InventoryScreen() {
  const { items, addItem, deleteItem } = useContext(InventoryContext);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    if (!name || !price) {
      Alert.alert('Error', 'Enter name & price');
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
    };
    addItem(newItem);
    setName('');
    setPrice('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Inventory Management</Text>

      <TextInput
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Item" onPress={handleAdd} color="#0052cc" />

      <FlatList
        style={{ marginTop: 20 }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>
              {item.name} - ₹{item.price}
            </Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#0052cc' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: { fontSize: 16, fontWeight: '500' },
});
