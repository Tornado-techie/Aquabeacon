import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/signin" replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user?.role)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;