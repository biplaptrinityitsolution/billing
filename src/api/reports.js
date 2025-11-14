import apiClient from './apiClient';

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
export const getSalesSummary = async (dateRange = {}) => {
  console.log('MOCK API: Fetching sales summary for', dateRange);
  return new Promise(resolve => setTimeout(() => resolve({
    data: {
      totalSales: 54321.00,
      totalTransactions: 1234,
      averageTransaction: 44.02,
      topSellingItems: [
        { name: 'Coffee Mug', sales: 1500, count: 120 },
        { name: 'Espresso Machine', sales: 899.97, count: 3 },
      ],
      salesByMonth: [
        { month: 'Jan', sales: 5000 }, { month: 'Feb', sales: 6000 },
        { month: 'Mar', sales: 7500 }, { month: 'Apr', sales: 8000 },
      ]
    }
  }), 1000));
};

export const getEmployeePerformance = async (employeeId, dateRange = {}) => {
  console.log(`MOCK API: Fetching performance for employee ${employeeId}`);
  return new Promise(resolve => setTimeout(() => resolve({
    data: {
      employeeName: employeeId === 'emp1' ? 'John Doe' : 'Jane Smith',
      totalSales: 15200.00,
      totalTransactions: 350,
      averageTransaction: 43.43,
      itemsSold: [
        { name: 'Coffee Mug', count: 50 },
        { name: 'Green Tea (Box)', count: 30 },
      ]
    }
  }), 1000));
};
// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const getSalesSummary = (dateRange) => apiClient.get('/reports/sales/summary', { params: dateRange });
export const getEmployeePerformance = (employeeId, dateRange) => apiClient.get(`/reports/employee/${employeeId}/performance`, { params: dateRange });
*/