import React, { lazy } from 'react';
import { Routes, Route } from 'react-router';

// Lazy load pages (loaded only when route is visited)
const Landing = lazy(() => import('../pages/Landing/landing'));
const LandingPage = lazy(() => import('../pages/Landing/landing_demo'));
const LandingDemo = lazy(() => import('../pages/Landing/landing_demo1'));
const Register = lazy(() => import('../pages/Auth/register'));
const Login = lazy(() => import('../pages/Auth/login'));
const Dashboard = lazy(() => import('../pages/Dashboard/dashboard'));
const OTPVerification = lazy(() => import('@/pages/Auth/register-redirect'));
const DjangoCookieAPI = lazy(() => import('@/pages/cookie'));

import ProtectedRoute from './ProtectedRoute';

import { Suspense } from 'react';
import PageLoader from '../components/page-loader';

function Routing() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* <Route path="/" element={<Landing />} /> */}
          {/* <Route path="/" element={<LandingPage />} /> */}
          <Route path="/" element={<LandingDemo />} />
          <Route path="/cookie" element={<DjangoCookieAPI />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<OTPVerification />} />
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
