import React, { lazy } from 'react';
import { Routes, Route } from 'react-router';
import Landing from '@/pages/landing/landing_page';
import Register from '@/pages/auth/register';
import Login from '@/pages/auth/login';
import Dashboard2 from '@/pages/dashoard/dashboard_page';

const Profile = lazy(() => import('../pages/auth/profile_page'));
const OTPVerification = lazy(() => import('@/pages/auth/register-redirect'));
const Dashboard = lazy(() => import('@/pages/dashoard/dashboard_page'));
const Tracker = lazy(() => import('@/pages/tracker/tracker-page'));
const Portfolio = lazy(() => import('@/pages/portfolio/portfolio-page'));

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
          <Route path="/maindash" element={<Dashboard2 />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default Routing;
