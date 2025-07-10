import React from 'react';
import Landing from '../pages/landing';
import Register from '../pages/register';
import Login from '../pages/login';
import Dashboard from '../pages/dashboard';
import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default Routing;
