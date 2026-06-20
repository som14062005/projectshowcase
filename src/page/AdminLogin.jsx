import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [terminalLines, setTerminalLines] = useState([
    'Portfolio Authentication System v2.0',
    '════════════════════════════════════════════════',
    '',
    'ADMIN LOGIN REQUIRED',
    '',
  ]);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTerminalLines(prev => [...prev, `> Authenticating user: ${username}...`, '']);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/admin-login', {
        username,
        password,
      });

      setTerminalLines(prev => [
        ...prev,
        '✓ Authentication successful!',
        '✓ Token generated',
        '✓ Redirecting to dashboard...',
        '',
      ]);

      // Store token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect after delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Authentication failed';
      setError(errorMsg);
      setTerminalLines(prev => [
        ...prev,
        `✗ ERROR: ${errorMsg}`,
        '✗ Access denied',
        '',
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Terminal Output */}
        <div className="border-2 border-cli-green p-6 mb-6">
          <div className="space-y-1 text-sm mb-4">
            {terminalLines.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="border-2 border-cli-green p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔐</span>
            <h1 className="text-2xl font-bold text-cli-green-bright">Admin Access</h1>
          </div>

          {error && (
            <div className="border-2 border-red-500 bg-red-500 bg-opacity-10 text-red-500 p-4 mb-6 animate-pulse">
              <div className="flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-cli-green mb-2 text-sm">
                [USERNAME]
              </label>
              <div className="flex items-center border-2 border-cli-green focus-within:border-cli-green-bright transition-all">
                <span className="px-3 text-cli-green-dim">$</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-cli-bg text-cli-green p-3 outline-none"
                  placeholder="Enter username"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-cli-green mb-2 text-sm">
                [PASSWORD]
              </label>
              <div className="flex items-center border-2 border-cli-green focus-within:border-cli-green-bright transition-all">
                <span className="px-3 text-cli-green-dim">*</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-cli-bg text-cli-green p-3 outline-none"
                  placeholder="Enter password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 font-bold text-lg transition-all ${
                loading
                  ? 'bg-cli-green-dim text-cli-bg cursor-not-allowed'
                  : 'bg-cli-green text-cli-bg hover:bg-cli-green-bright'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin">⟳</span>
                  <span>AUTHENTICATING...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span>→</span>
                  <span>LOGIN</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-cli-green-dim">
            <div className="text-xs text-cli-green-dim space-y-1">
              <div>→ Default credentials: admin / admin123</div>
              <div>→ Contact administrator for access</div>
            </div>
          </div>
        </div>

        {/* Back to Portfolio */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-cli-green-dim hover:text-cli-green transition-all text-sm"
          >
            ← Back to Portfolio Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
