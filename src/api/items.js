import apiClient from './apiClient';

// --- MOCK DATA ---
let mockItems = [
  { id: 'item1', name: 'Coffee Mug', price: 12.50, categoryId: 'cat1', description: 'Standard coffee mug', imageUrl: '', stock: 25, sku: 'MUG001', image: '☕' },
  { id: 'item2', name: 'Espresso Machine', price: 299.99, categoryId: 'cat1', description: 'High-end espresso maker', imageUrl: '', stock: 5, sku: 'ESP002', image: '⚡' },
  { id: 'item3', name: 'Green Tea (Box)', price: 8.75, categoryId: 'cat2', description: '20 bags of premium green tea', imageUrl: '', stock: 40, sku: 'TEA003', image: '🍃' },
  { id: 'item4', name: 'Milk Frother', price: 35.00, categoryId: 'cat1', description: 'Electric milk frother', imageUrl: '', stock: 15, sku: 'FRO004', image: '🥛' },
  { id: 'item5', name: 'Assorted Pastries', price: 2.50, categoryId: 'cat3', description: 'Per piece', imageUrl: '', stock: 8, sku: 'PAS005', image: '🥐' },
];
// --- END MOCK DATA ---

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
export const getItems = async () => {
  console.log('MOCK API: Fetching items');
  return new Promise(resolve => setTimeout(() => resolve({ data: mockItems }), 500));
};

export const getItemById = async (id) => {
  console.log(`MOCK API: Fetching item ${id}`);
  return new Promise(resolve => setTimeout(() => resolve({ data: mockItems.find(item => item.id === id) }), 500));
};

export const createItem = async (itemData) => {
  console.log('MOCK API: Creating item', itemData);
  return new Promise(resolve => setTimeout(() => {
    const newItem = { id: `item${mockItems.length + 1}`, ...itemData };
    mockItems.push(newItem);
    resolve({ data: newItem });
  }, 500));
};

export const updateItem = async (id, itemData) => {
  console.log(`MOCK API: Updating item ${id}`, itemData);
  return new Promise((resolve, reject) => setTimeout(() => {
    const index = mockItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockItems[index] = { ...mockItems[index], ...itemData };
      resolve({ data: mockItems[index] });
    } else {
      reject({ response: { data: { message: 'Item not found' } } });
    }
  }, 500));
};

export const deleteItem = async (id) => {
  console.log(`MOCK API: Deleting item ${id}`);
  return new Promise((resolve, reject) => setTimeout(() => {
    const initialLength = mockItems.length;
    mockItems = mockItems.filter(item => item.id !== id);
    if (mockItems.length < initialLength) {
      resolve({ data: { message: 'Item deleted successfully' } });
    } else {
      reject({ response: { data: { message: 'Item not found' } } });
    }
  }, 500));
};

export const updateStock = async (id, newStock) => {
  console.log(`MOCK API: Updating stock for item ${id} to ${newStock}`);
  return new Promise((resolve, reject) => setTimeout(() => {
    const index = mockItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockItems[index].stock = newStock;
      resolve({ data: mockItems[index] });
    } else {
      reject({ response: { data: { message: 'Item not found' } } });
    }
  }, 500));
};
// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const getItems = () => apiClient.get('/items');
export const getItemById = (id) => apiClient.get(`/items/${id}`);
export const createItem = (itemData) => apiClient.post('/items', itemData);
export const updateItem = (id, itemData) => apiClient.put(`/items/${id}`, itemData);
export const deleteItem = (id) => apiClient.delete(`/items/${id}`);
*/