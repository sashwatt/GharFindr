import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('You need to login as admin first');
    }
  }, [user, location]);

  // Not logged in: show toast and redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in as user: show toast, but do not redirect
  if (user.role !== 'admin') {
    return null; // Renders nothing, stays on the same page
  }

  // Logged in as admin
  return children;
};

export default AdminRoute;
