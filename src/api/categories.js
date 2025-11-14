import apiClient from './apiClient';

// --- MOCK DATA ---
let mockCategories = [
  { id: 'cat1', name: 'Coffee' },
  { id: 'cat2', name: 'Tea' },
  { id: 'cat3', name: 'Bakery' },
  { id: 'cat4', name: 'Snacks' },
];
// --- END MOCK DATA ---

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
export const getCategories = async () => {
  console.log('MOCK API: Fetching categories');
  return new Promise(resolve => setTimeout(() => resolve({ data: mockCategories }), 500));
};

export const getCategoryById = async (id) => {
  console.log(`MOCK API: Fetching category ${id}`);
  return new Promise(resolve => setTimeout(() => resolve({ data: mockCategories.find(cat => cat.id === id) }), 500));
};

export const createCategory = async (categoryData) => {
  console.log('MOCK API: Creating category', categoryData);
  return new Promise(resolve => setTimeout(() => {
    const newCategory = { id: `cat${mockCategories.length + 1}`, ...categoryData };
    mockCategories.push(newCategory);
    resolve({ data: newCategory });
  }, 500));
};

export const updateCategory = async (id, categoryData) => {
  console.log(`MOCK API: Updating category ${id}`, categoryData);
  return new Promise((resolve, reject) => setTimeout(() => {
    const index = mockCategories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...categoryData };
      resolve({ data: mockCategories[index] });
    } else {
      reject({ response: { data: { message: 'Category not found' } } });
    }
  }, 500));
};

export const deleteCategory = async (id) => {
  console.log(`MOCK API: Deleting category ${id}`);
  return new Promise((resolve, reject) => setTimeout(() => {
    const initialLength = mockCategories.length;
    mockCategories = mockCategories.filter(cat => cat.id !== id);
    if (mockCategories.length < initialLength) {
      resolve({ data: { message: 'Category deleted successfully' } });
    } else {
      reject({ response: { data: { message: 'Category not found' } } });
    }
  }, 500));
};
// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const getCategories = () => apiClient.get('/categories');
export const getCategoryById = (id) => apiClient.get(`/categories/${id}`);
export const createCategory = (categoryData) => apiClient.post('/categories', categoryData);
export const updateCategory = (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);
*/