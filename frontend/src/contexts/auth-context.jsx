import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import axios from 'axios';
const BASE_URL = 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log("render")
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const navigate = useNavigate();

  const axiosPrivate = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    instance.interceptors.request.use(
      (config) => {
        if (authToken && !config.headers?.Authorization) config.headers.Authorization = `Bearer ${authToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(
              `${BASE_URL}/api/token/refresh/`,
              {},
              { withCredentials: true }
            );

            const newToken = response.data.data.access_token;
            setAuthToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return instance(originalRequest);
          } catch {
            clearAuthData();
            navigate('/');
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
    return instance;
  }, [authToken]);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setAuthToken(null);
  }, []);

  const setAuthData = useCallback((response) => {
    const token = response?.data?.auth?.access_token;
    const userData = response?.data?.user;

    if (token && userData) {
      setAuthToken(token);
      setUser(userData);
      return true;
    }
    return false;
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/login/`, userData, {
        withCredentials: true,
      });

      if (response.data.success && setAuthData(response.data)) navigate('/dashboard');
      return response;
    } catch (error) {
      return error.response || { data: { success: false, message: 'Login failed' } };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/register/`, userData);
      if (response.data.success) navigate(`/verify-email?email=${encodeURIComponent(userData.email)}`);
      return response;
    } catch (error) {
      return error.response || { data: { success: false, message: 'Registration failed' } };
    }
  };

  const verifyEmail = async (otpData) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/verify-email/`, otpData, {
        withCredentials:true,
      });
      if (response.data.success) setAuthData(response.data);
      return response;
    } catch (error) {
      return error.response || { data: { success: false, message: 'Verification failed' } };
    }
  };

  const resendVerifyEmail = async (emailData) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/resend-verification/`, emailData);
      return response;
    } catch (error) {
      return error.response || { data: { success: false, message: 'Failed to resend verification' } }
    }
  };

  const logout = async () => {
    try {
      await axiosPrivate.post('/user/auth/logout/');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuthData();
    }
  };

  const handleGoogleCallback = async (code, state) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/google/callback/`,
        { code, state },
        { withCredentials: true }
      );

      if (response.data.success && setAuthData(response.data)) {
        navigate('/dashboard');
      }
      return response;
    } catch (error) {
      return error.response || { data: { success: false, message: 'Google auth failed' } };
    }
  };

  const googleLogin = (state) => {
    const googleAuthBaseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    let redirect_uri = 'http://localhost:5173/login';

    if (state === 'from:register') redirect_uri = 'http://localhost:5173/register';

    const params = {
      client_id: '1034638916922-m87ikgv2679tj17bnb7skda96l3s98g1.apps.googleusercontent.com',
      redirect_uri,
      scope: 'openid email profile',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
    };
    const searchParams = new URLSearchParams(params);
    const encodedUrl = `${googleAuthBaseUrl}?${searchParams.toString()}`;
    window.location.href = encodedUrl.toString();
  };

  const value = {
    user,
    authToken,
    login,
    register,
    verifyEmail,
    logout,
    googleLogin,
    handleGoogleCallback,
    resendVerifyEmail,
    axiosPrivate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
