import React from 'react';
import { LogOut, User, Shield, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bottom-profile-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`profile-avatar ${user.role === 'admin' ? 'admin' : ''}`}>
              {user.role === 'admin' ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="status-indicator"></div>
          </div>
          
          <div className="flex-1">
            <div className="text-white font-semibold rounded-font mobile-text-sm">
              {user.name}
            </div>
            <div className="text-blue-300 text-xs rounded-font-light capitalize">
              {user.role} • Online
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 glass-dark rounded-xl hover:bg-blue-800/30 apple-transition apple-scale">
            <Settings className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={logout}
            className="p-2 glass-dark rounded-xl hover:bg-red-800/30 apple-transition apple-scale"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomProfile;