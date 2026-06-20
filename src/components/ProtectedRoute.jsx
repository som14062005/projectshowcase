import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [location.pathname]);

  const checkAccess = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/settings/access-mode');
      const { requiresPasscode } = response.data;

      if (requiresPasscode) {
        // ✅ SECURE MODE - Check if user is authenticated
        const isAuthenticated = sessionStorage.getItem('portfolioAuthenticated');
        const authTime = sessionStorage.getItem('authTime');

        if (isAuthenticated === 'true' && authTime) {
          // Check if auth is still valid (e.g., 1 hour)
          const oneHour = 60 * 60 * 1000;
          const timeElapsed = Date.now() - parseInt(authTime);

          if (timeElapsed < oneHour) {
            // ✅ Valid authentication - Allow access
            console.log('✅ Authenticated in SECURE mode - Access granted');
            setHasAccess(true);
            setLoading(false);
            return;
          } else {
            // Authentication expired
            console.log('⏰ Authentication expired');
            sessionStorage.removeItem('portfolioAuthenticated');
            sessionStorage.removeItem('authTime');
          }
        }

        // ❌ Not authenticated - Redirect to OTP
        console.log('🔒 SECURE mode - Not authenticated - Redirecting to OTP');
        navigate('/', { 
          state: { returnTo: location.pathname },
          replace: true 
        });
      } else {
        // ✅ PUBLIC MODE - Allow access
        console.log('✅ PUBLIC mode - Access granted');
        setHasAccess(true);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/', { 
        state: { returnTo: location.pathname },
        replace: true 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex items-center justify-center">
        <div className="text-2xl animate-pulse">⟳ Verifying access...</div>
      </div>
    );
  }

  return hasAccess ? children : null;
};

export default ProtectedRoute;
