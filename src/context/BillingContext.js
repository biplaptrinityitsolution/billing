// src/context/BillingContext.js
import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BillingContext = createContext();

export function BillingProvider({ children }) {
  const [bills, setBills] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);

  // Load bills from storage on mount
  useEffect(() => {
    loadBills();
  }, []);

  // Save bills to storage whenever bills change
  useEffect(() => {
    saveBills();
  }, [bills]);

  const loadBills = async () => {
    try {
      const storedBills = await AsyncStorage.getItem('bills');
      if (storedBills) {
        setBills(JSON.parse(storedBills));
      } else {
        // Initialize with sample bills
        const sampleBills = [
          {
            id: 'BILL-001',
            customerName: 'John Doe',
            customerPhone: '+1234567890',
            items: [
              { id: '1', name: 'Pizza Margherita', price: 15.99, quantity: 2, category: 'Pizza' },
              { id: '2', name: 'Coca Cola', price: 2.99, quantity: 2, category: 'Beverages' }
            ],
            subtotal: 37.96,
            tax: 3.04,
            total: 41.00,
            status: 'completed',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 'BILL-002',
            customerName: 'Jane Smith',
            customerPhone: '+1987654321',
            items: [
              { id: '3', name: 'Burger Deluxe', price: 12.99, quantity: 1, category: 'Burgers' },
              { id: '4', name: 'French Fries', price: 4.99, quantity: 1, category: 'Sides' }
            ],
            subtotal: 17.98,
            tax: 1.44,
            total: 19.42,
            status: 'pending',
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            updatedAt: new Date(Date.now() - 30 * 60 * 1000)
          },
          {
            id: 'BILL-003',
            customerName: 'Mike Johnson',
            customerPhone: '+1122334455',
            items: [
              { id: '5', name: 'Caesar Salad', price: 8.99, quantity: 2, category: 'Salads' },
              { id: '6', name: 'Orange Juice', price: 3.99, quantity: 1, category: 'Beverages' }
            ],
            subtotal: 21.97,
            tax: 1.76,
            total: 23.73,
            status: 'completed',
            createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
            updatedAt: new Date(Date.now() - 45 * 60 * 1000)
          }
        ];
        setBills(sampleBills);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const saveBills = async () => {
    try {
      await AsyncStorage.setItem('bills', JSON.stringify(bills));
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  // Generate unique bill ID
  const generateBillId = () => {
    const count = bills.length + 1;
    return `BILL-${count.toString().padStart(3, '0')}`;
  };

  // Add item to cart
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  // Update item quantity in cart
  const updateCartItemQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, [removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calculate cart totals
  const calculateCartTotals = useCallback(() => {
    let subtotalBeforeDiscount = 0; // The sum of (original_price * quantity)
    let subtotalAfterDiscount = 0;  // The sum of (discounted_price * quantity)
    let totalCgst = 0;
    let totalSgst = 0;

    cart.forEach(item => {
        const itemOriginalPricePerUnit = item.price;
        const itemDiscountPercentage = item.discount || 0;
        const itemTaxRatePercentage = item.taxRate || 0; // Assuming item.taxRate is the *total* GST % for the item

        const discountedPricePerUnit = itemOriginalPricePerUnit * (1 - itemDiscountPercentage / 100);

        // Add to subtotal after discount
        subtotalAfterDiscount += discountedPricePerUnit * item.quantity;

        // Calculate tax for this item based on its specific tax rate
        const itemTaxAmount = (discountedPricePerUnit * item.quantity) * (itemTaxRatePercentage / 100);
        totalCgst += itemTaxAmount / 2; // Assuming CGST is half of total GST
        totalSgst += itemTaxAmount / 2; // Assuming SGST is half of total GST
    });

    const totalTax = totalCgst + totalSgst;
    const total = subtotalAfterDiscount + totalTax;

    return {
        subtotal: subtotalAfterDiscount, // Subtotal is now after discount
        cgst: totalCgst,
        sgst: totalSgst,
        tax: totalTax,
        total: total,
    };
}, [cart]); // cart is the dependency, so it recalculates when cart changes

  // Create new bill
  const createBill = useCallback((customerInfo) => {
    const { subtotal, cgst, sgst, tax, total } = calculateCartTotals();
    const newBill = {
      id: generateBillId(),
      customerName: customerInfo.name || 'Walk-in Customer',
      customerPhone: customerInfo.phone || '',
      items: [...cart],
      subtotal,
      cgst,
      sgst,
      tax,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setBills(prevBills => [newBill, ...prevBills]);
    clearCart();
    return newBill;
  }, [cart, calculateCartTotals, clearCart]);

  // Update existing bill
  const updateBill = useCallback((billId, updates) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? { ...bill, ...updates, updatedAt: new Date() }
          : bill
      )
    );
  }, []);

  // Delete bill
  const deleteBill = useCallback((billId) => {
    setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
  }, []);

  // Get bill by ID
  const getBillById = useCallback((billId) => {
    return bills.find(bill => bill.id === billId);
  }, [bills]);

  // Load bill for editing
  const loadBillForEdit = useCallback((billId) => {
    const bill = getBillById(billId);
    if (bill) {
      setCart(bill.items);
      setCurrentBill(bill);
    }
    return bill;
  }, [getBillById]);

  // Complete bill (mark as completed)
  const completeBill = useCallback((billId) => {
    updateBill(billId, { status: 'completed' });
  }, [updateBill]);

  // Get bills by status
  const getBillsByStatus = useCallback((status) => {
    return bills.filter(bill => bill.status === status);
  }, [bills]);

  // Get today's bills
  const getTodaysBills = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      billDate.setHours(0, 0, 0, 0);
      return billDate.getTime() === today.getTime();
    });
  }, [bills]);

  // Get today's sales total
  const getTodaysSales = useCallback(() => {
    const todaysBills = getTodaysBills();
    return todaysBills
      .filter(bill => bill.status === 'completed')
      .reduce((sum, bill) => sum + bill.total, 0);
  }, [getTodaysBills]);

  return (
    <BillingContext.Provider value={{
      // State
      bills,
      cart,
      currentBill,
      
      // Cart operations
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      calculateCartTotals,
      
      // Bill operations
      createBill,
      updateBill,
      deleteBill,
      getBillById,
      loadBillForEdit,
      completeBill,
      
      // Queries
      getBillsByStatus,
      getTodaysBills,
      getTodaysSales,
      
      // Utility
      setCurrentBill
    }}>
      {children}
    </BillingContext.Provider>
  );
}
