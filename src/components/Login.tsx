import React, { useState } from 'react';
import { Mail, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login({ ...credentials, rememberMe });
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const demoCredentials = [
    { label: 'Admin Demo', email: 'admin@syncink.com', password: 'admin123' },
    { label: 'Employee Demo', email: 'john@syncink.com', password: 'john123' }
  ];

  return (
    <div className="mobile-app-container animated-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-8 apple-transition glow-blue">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/syncink logo.png" 
              alt="SyncInk Logo" 
              className="w-20 h-20 mx-auto mb-4 apple-scale"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 apple-transition rounded-font">SyncInk Tracker</h1>
          <p className="text-blue-200 rounded-font-light">Track your daily work progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-4 pr-12 py-4 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white apple-transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-transparent border-blue-300 rounded focus:ring-blue-500 apple-transition"
              />
              <span className="ml-2 text-sm text-blue-200 rounded-font-light">Remember me</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center text-red-400 text-sm glass-dark p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="rounded-font-light">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition disabled:opacity-50 disabled:cursor-not-allowed font-medium apple-scale glow-blue rounded-font"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span className="rounded-font-light">Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                <span className="rounded-font">Sign In</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-blue-800 pt-6">
          <p className="text-sm text-blue-200 mb-4 rounded-font-light">Demo Credentials:</p>
          <div className="space-y-3">
            {demoCredentials.map((demo, index) => (
              <div key={index} className="glass-dark p-4 rounded-xl apple-transition hover:bg-opacity-60">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-blue-100 rounded-font">{demo.label}:</span>
                  <div className="text-right text-blue-300 rounded-font-light">
                    <div>{demo.email}</div>
                    <div>{demo.password}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;