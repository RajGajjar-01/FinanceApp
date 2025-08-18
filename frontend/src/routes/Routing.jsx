import React, { lazy } from 'react';
import { Routes, Route } from 'react-router';
import Landing from '@/pages/landing/landing_page';
import Register from '@/pages/auth/register';
import Login from '@/pages/auth/login';
import Dashboard2 from '@/pages/maindash';

const Dashboard = lazy(() => import('../pages/dashoard/dashboad_page'));
const OTPVerification = lazy(() => import('@/pages/auth/register-redirect'));
const Main = lazy(() => import('@/pages/dashoard/main2'));
const Tracker = lazy(() => import('@/pages/dashoard/tracker'));

import ProtectedRoute from './ProtectedRoute';

import { Suspense } from 'react';
import PageLoader from '../components/page-loader';

function Routing() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<OTPVerification />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/maindash" element={<Dashboard2/>} />
          <Route path="/main" element={<Main />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default Routing;
