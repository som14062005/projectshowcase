import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      console.log('❌ No admin token - Redirecting to login');
      navigate('/admin/login', { replace: true });
      return;
    }

    // Token exists, allow access
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex items-center justify-center">
        <div className="text-2xl animate-pulse">⟳ Verifying admin access...</div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
