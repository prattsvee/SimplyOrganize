// src/App.tsx
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import authService from './services/authService';

// Lazy load auth pages
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Register = React.lazy(() => import('./pages/Register'));

// Lazy load main pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProjectBoard = React.lazy(() => import('./pages/ProjectBoard'));
const KanbanBoard = React.lazy(() => import('./pages/KanbanBoard'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Settings = React.lazy(() => import('./pages/Settings'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    authService.initializeAuth();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Suspense 
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              !authService.isAuthenticated() ? 
                <Login /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/register" 
            element={
              !authService.isAuthenticated() ? 
                <Register /> : 
                <Navigate to="/" replace />
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:projectId" 
            element={
              <ProtectedRoute>
                <ProjectBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:projectId/board" 
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;