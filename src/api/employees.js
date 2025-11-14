import apiClient from './apiClient';

// --- MOCK DATA ---
let mockEmployees = [
  { id: 'emp1', name: 'John Doe', email: 'employee@example.com', role: 'employee' },
  { id: 'emp2', name: 'Jane Smith', email: 'jane.s@example.com', role: 'employee' },
];
// --- END MOCK DATA ---

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
export const getEmployees = async () => {
  console.log('MOCK API: Fetching employees');
  return new Promise(resolve => setTimeout(() => resolve({ data: mockEmployees }), 500));
};

export const getEmployeeById = async (id) => {
  console.log(`MOCK API: Fetching employee ${id}`);
  return new Promise(resolve => setTimeout(() => resolve({ data: mockEmployees.find(emp => emp.id === id) }), 500));
};

export const createEmployee = async (employeeData) => {
  console.log('MOCK API: Creating employee', employeeData);
  return new Promise(resolve => setTimeout(() => {
    const newEmployee = { id: `emp${mockEmployees.length + 1}`, ...employeeData, role: 'employee' }; // New employees default to employee role
    mockEmployees.push(newEmployee);
    resolve({ data: newEmployee });
  }, 500));
};

export const updateEmployee = async (id, employeeData) => {
  console.log(`MOCK API: Updating employee ${id}`, employeeData);
  return new Promise((resolve, reject) => setTimeout(() => {
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...employeeData };
      resolve({ data: mockEmployees[index] });
    } else {
      reject({ response: { data: { message: 'Employee not found' } } });
    }
  }, 500));
};

export const deleteEmployee = async (id) => {
  console.log(`MOCK API: Deleting employee ${id}`);
  return new Promise((resolve, reject) => setTimeout(() => {
    const initialLength = mockEmployees.length;
    mockEmployees = mockEmployees.filter(emp => emp.id !== id);
    if (mockEmployees.length < initialLength) {
      resolve({ data: { message: 'Employee deleted successfully' } });
    } else {
      reject({ response: { data: { message: 'Employee not found' } } });
    }
  }, 500));
};
// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const getEmployees = () => apiClient.get('/employees');
export const getEmployeeById = (id) => apiClient.get(`/employees/${id}`);
export const createEmployee = (employeeData) => apiClient.post('/employees', employeeData);
export const updateEmployee = (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData);
export const deleteEmployee = (id) => apiClient.delete(`/employees/${id}`);
*/