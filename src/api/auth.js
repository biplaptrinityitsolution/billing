import apiClient from './apiClient';
// Use the API_URL from environment variables
import { API_BASE_USER_URL, API_BASE_AUTH_URL } from '@env';

// --- MOCK API FUNCTIONS (Replace with actual backend calls) ---
// Demo accounts for login:
// Admin -> email: admin@example.com, password: adminpassword
// Employee -> email: employee@example.com, password: emppassword
const DUMMY_USERS = [
  {
    token: 'admin_jwt_token_123',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
    username: 'Administrator',
  },
  {
    token: 'employee_jwt_token_456',
    email: 'employee@example.com',
    password: 'emppassword',
    role: 'employee',
    username: 'Employee One',
  },
];

export const loginUserApi = async (phone, password) => {
  // const url = `${API_BASE_AUTH_URL}/authentication`

  const myHeaders = new Headers();
  myHeaders.append('accept', '*/*');
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    username: phone || '',
    password: password || '',
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  try {
    const response = await fetch(
      "http://103.150.136.204/EBillingRestAPI/api/v1/auth/authentication",
      requestOptions,
    );

    

    if (!response.ok) {
      throw { message: 'Login failed' };
    }

    const result = await response.json();

    console.log('Registration API Response:', result);

    return result;
  } catch (error) {
    throw error;
  }
};

export const registerOwnerApi = async payload => {
  // const url = `${API_BASE_USER_URL}/saveUserAuth`

  try {
    
    const { name, phone, password } = payload || {};
    const raw = JSON.stringify({
      user_name: phone || '',
      user_password: password || '',
      user_full_name: name || '',
    });

    console.log("raw", raw);

    const myHeaders = new Headers();
    myHeaders.append('accept', '*/*');
    myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch(
      "http://103.150.136.204/EBillingRestAPI/api/v1/auth/saveUserAuth",
      requestOptions,
    );

    console.log('Registration API Response:', response);

    if (!response.ok) {
      throw new Error({ message: 'Login failed'  || 'Registration failed'});  
    }
    const resultJson = await response.json();

    console.log("resuljson",resultJson);

    return resultJson;

  } catch (error) {
    throw error;
  }
};

export const registerEmployeeApi = async employeeData => {
  console.log(`MOCK API: Registering employee: ${employeeData.email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (DUMMY_USERS.some(u => u.email === employeeData.email)) {
        reject({
          response: {
            data: {
              message: 'Email already registered.',
            },
          },
        });
      } else {
        // In a real app, this would create a new user in your DB and return a token
        resolve({
          data: {
            message: 'Employee registered successfully (mock)!',
          },
        });
      }
    }, 1500);
  });
};

export const forgotPasswordApi = async email => {
  console.log(`MOCK API: Sending password reset to ${email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (DUMMY_USERS.some(u => u.email === email)) {
        resolve({
          data: {
            message: `Password reset link sent to ${email} (mock)!`,
          },
        });
      } else {
        reject({
          response: {
            data: {
              message: 'No account found with that email address.',
            },
          },
        });
      }
    }, 2000);
  });
};

// --- END MOCK API FUNCTIONS ---

// Example of how to integrate with apiClient (uncomment and use when backend is ready)
/*
export const loginUser = (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

export const registerEmployee = (employeeData) => {
  return apiClient.post('/auth/register/employee', employeeData); // Admin-only endpoint
};

export const forgotPassword = (email) => {
  return apiClient.post('/auth/forgot-password', { email });
};

*/
