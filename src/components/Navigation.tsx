import React from 'react';
import { BarChart3, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'form' | 'dashboard';
  onViewChange: (view: 'form' | 'dashboard') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuth();

  return (
    <nav className="mobile-nav">
      <div className="max-w-7xl mx-auto mobile-padding">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/syncink logo.png" 
                alt="SyncInk Logo" 
                className="h-10 w-10 mr-3 apple-scale"
              />
              <span className="text-xl font-bold text-white rounded-font">SyncInk Tracker</span>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onViewChange('form')}
                className={`px-4 py-2 rounded-xl text-sm font-medium apple-transition apple-scale tab-indicator ${
                  currentView === 'form' ? 'active' : ''
                } ${
                  currentView === 'form'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white glow-blue'
                    : 'text-blue-300 hover:text-white glass-dark'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                <span className="rounded-font-light">Entry</span>
              </button>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-medium apple-transition apple-scale tab-indicator ${
                  currentView === 'dashboard' ? 'active' : ''
                } ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white glow-blue'
                    : 'text-blue-300 hover:text-white glass-dark'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                <span className="rounded-font-light">Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;