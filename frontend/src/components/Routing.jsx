import React from 'react';
import Landing from '../pages/landing';
import Register from '@/pages/register';
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import OTPVerification from '@/pages/register-redirect';
import DjangoCookieAPI from '@/pages/cookie';
import StockTicker from './StockTicker';
import StockSearch from './ui/StockSearch';

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={< OTPVerification/>} />
      <Route path="/cookie" element={<DjangoCookieAPI />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path='/abc' element={<StockTicker />} />
      <Route path='/search' element={<StockSearch />} />
    </Routes>
  );
}

export default Routing;
