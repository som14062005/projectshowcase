import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AccessMonitor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip monitoring for admin routes
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Check access mode every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/settings/access-mode');
        const { requiresPasscode } = response.data;

        // If on OTP page and mode switched to PUBLIC, redirect to home
        if (location.pathname === '/' && !requiresPasscode) {
          console.log('✅ Switched to PUBLIC mode - Redirecting to home');
          const returnTo = location.state?.returnTo || '/home';
          navigate(returnTo, { replace: true });
        }

        // If on protected page and mode switched to SECURE
        if (location.pathname !== '/' && !location.pathname.startsWith('/admin') && requiresPasscode) {
          // ✅ Check if user is authenticated
          const isAuthenticated = sessionStorage.getItem('portfolioAuthenticated');
          
          if (isAuthenticated !== 'true') {
            // Not authenticated - kick them out
            console.log('🔒 Switched to SECURE mode - Not authenticated - Redirecting to OTP');
            sessionStorage.removeItem('portfolioAuthenticated');
            sessionStorage.removeItem('authTime');
            navigate('/', { 
              state: { returnTo: location.pathname },
              replace: true 
            });
          }
        }

        // If mode switched to PUBLIC, clear auth (no longer needed)
        if (!requiresPasscode) {
          sessionStorage.removeItem('portfolioAuthenticated');
          sessionStorage.removeItem('authTime');
        }
      } catch (error) {
        console.error('Error monitoring access:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [location.pathname, navigate]);

  return null;
};

export default AccessMonitor;
