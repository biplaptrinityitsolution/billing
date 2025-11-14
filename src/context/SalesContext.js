import React, { createContext, useState } from 'react';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  // Add a new sale (called from BillingScreen)
  const addSale = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const newSale = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      items,
      totalAmount,
    };

    setSales((prev) => [...prev, newSale]);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
      {children}
    </SalesContext.Provider>
  );
};
