import apiClient from './apiClient';

// --- MOCK DATA ---
let mockBills = [];
// --- END MOCK DATA ---

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
export const createBill = async (billData) => {
  console.log('MOCK API: Creating bill', billData);
  return new Promise(resolve => setTimeout(() => {
    const newBill = { id: `bill${mockBills.length + 1}`, date: new Date().toISOString(), ...billData };
    mockBills.push(newBill);
    resolve({ data: newBill });
  }, 1000));
};

export const getBills = async (filters) => {
  console.log('MOCK API: Fetching bills with filters', filters);
  return new Promise(resolve => setTimeout(() => {
    // Implement simple filtering if needed for mock
    let filteredBills = mockBills;
    if (filters?.employeeId) {
      filteredBills = filteredBills.filter(bill => bill.employeeId === filters.employeeId);
    }
    // ... more filters
    resolve({ data: filteredBills });
  }, 500));
};

export const getBillById = async (id) => {
  console.log(`MOCK API: Fetching bill ${id}`);
  return new Promise(resolve => setTimeout(() => resolve({ data: mockBills.find(bill => bill.id === id) }), 500));
};
// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const createBill = (billData) => apiClient.post('/bills', billData);
export const getBills = (filters) => apiClient.get('/bills', { params: filters });
export const getBillById = (id) => apiClient.get(`/bills/${id}`);
*/