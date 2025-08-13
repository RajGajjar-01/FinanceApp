import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';


const axios2 =  axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});


const handleError = (error, defaultMessage) => {
  if (error.response) {
    const errorMessage = error.response.data?.message || defaultMessage;
    return { 
      success: false, 
      error: errorMessage,
      status: error.response.status,
    };
  } else if (error.request) {
    return { 
      success: false, 
      error: 'Network error. Please try again.',
    };
  } else {
    return { 
      success: false, 
      error: 'An unexpected error occurred.',
    };
  }
};

const getErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return defaultMessage;
};

export const login = async (credentials) => {
  try {
    const response = await axios2.post('/user/auth/login/', credentials);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('/user/auth/register/', userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'Registration failed');
  }
};

export const logout = async () => {
  try {
    const response = await axiosPrivate.post('/user/auth/logout/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: getErrorMessage(error, 'Logout failed'),
      forceLogout: true,
    };
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosPrivate.post('/api/token/refresh/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'Token refresh failed');
  }
};

export { handleError, getErrorMessage };

const testLogin = async () => {
  const result = await login({
    "login": "ShinyViper295005969",
    "password": "SecurePass123!123123@"
  });
  console.log('Login result:', result);
};
testLogin();

const testRefresh = async () => {
  const result = await refreshToken();
  console.log('Refresh result:', result);
};
testRefresh();


