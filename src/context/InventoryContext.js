import React, { createContext, useState, useCallback } from 'react';

export const InventoryContext = createContext();

const INIT_CATEGORIES = [
  { id: '1', name: 'Beverages', color: '#007bff', productCount: 34 },
  { id: '2', name: 'Snacks', color: '#ff9f43', productCount: 15 },
  { id: '3', name: 'Electronics', color: '#6c5ce7', productCount: 8 },
  { id: '4', name: 'Groceries', color: '#00b894', productCount: 22 },
];

const INIT_EMPLOYEES = [
  { id: '1', name: 'Amit Patel', email: 'amit@company.com', role: 'Cashier', phone: '9821123123', status: 'Active' },
  { id: '2', name: 'Priya Sharma', email: 'priya@company.com', role: 'Manager', phone: '9898989898', status: 'Active' },
  { id: '3', name: 'Sanjay Kumar', email: 'sanjay@company.com', role: 'Chef', phone: '9876543210', status: 'Inactive' },
];

const INIT_PRODUCTS = [
  { id: '1', name: 'Organic Coffee Beans', price: 12.99, category: 'Beverages', stock: 0, desc: 'Best Arabica beans.' },
  { id: '2', name: 'Veg Chips', price: 2.99, category: 'Snacks', stock: 34, desc: 'Healthy snack' },
];

export function InventoryProvider({ children }) {
  const [categories, setCategories] = useState(INIT_CATEGORIES);
  const [employees, setEmployees] = useState(INIT_EMPLOYEES);
  const [products, setProducts] = useState(INIT_PRODUCTS);

  const addCategory = useCallback((data) => {
    setCategories(prev => [
      ...prev,
      { id: (Date.now() + Math.random()).toString(), ...data, productCount: 0 }
    ]);
  }, []);

  const editCategory = useCallback((id, updates) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, []);

  const getCategoryById = useCallback((id) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const addEmployee = useCallback((data) => {
    setEmployees(prev => [
      ...prev,
      { id: (Date.now() + Math.random()).toString(), ...data }
    ]);
  }, []);

  const editEmployee = useCallback((id, updates) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === id ? { ...emp, ...updates } : emp
    ));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  }, []);

  const getEmployeeById = useCallback((id) => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  const addProduct = useCallback((data) => {
    setProducts(prev => [
      ...prev,
      { id: (Date.now() + Math.random()).toString(), ...data }
    ]);
  }, []);

  const editProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(prod =>
      prod.id === id ? { ...prod, ...updates } : prod
    ));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  }, []);

  const getProductById = useCallback((id) => {
    return products.find(prod => prod.id === id);
  }, [products]);

  return (
    <InventoryContext.Provider value={{
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      getCategoryById,
      setCategories,
      employees,
      addEmployee,
      editEmployee,
      deleteEmployee,
      getEmployeeById,
      setEmployees,
      products,
      addProduct,
      editProduct,
      deleteProduct,
      getProductById,
      setProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
}
