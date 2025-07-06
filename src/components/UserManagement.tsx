import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Mail, User, Shield, Calendar, Settings } from 'lucide-react';
import { DatabaseService } from '../services/database';
import { User as UserType, AttendanceSettings } from '../types';

interface UserManagementProps {
  onUserChange: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserChange }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee' | 'manager'
  });

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, []);

  const loadUsers = () => {
    const allUsers = DatabaseService.getAllUsers();
    setUsers(allUsers);
  };

  const loadSettings = () => {
    const settings = DatabaseService.getAttendanceSettings();
    setAttendanceSettings(settings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      const updatedUser: UserType = {
        ...editingUser,
        ...formData
      };
      DatabaseService.updateUser(updatedUser);
    } else {
      // Add new user
      DatabaseService.addUser(formData);
    }
    
    resetForm();
    loadUsers();
    onUserChange();
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their work entries.')) {
      DatabaseService.deleteUser(userId);
      loadUsers();
      onUserChange();
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee'
    });
    setEditingUser(null);
    setShowAddModal(false);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceSettings) {
      DatabaseService.updateAttendanceSettings(attendanceSettings);
      setShowSettingsModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white rounded-font">User Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl hover:from-purple-700 hover:to-purple-800 apple-transition apple-scale glow-blue rounded-font"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition apple-scale glow-blue rounded-font"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="glass rounded-2xl p-6 apple-scale glow-blue">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 
                  user.role === 'manager' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white rounded-font">{user.name}</h3>
                  <p className="text-sm text-blue-300 capitalize rounded-font-light">{user.role}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 glass-dark rounded-lg hover:bg-blue-800/30 apple-transition"
                >
                  <Edit className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 glass-dark rounded-lg hover:bg-red-800/30 apple-transition"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-blue-300">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-blue-300">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              {user.lastLogin && (
                <div className="flex items-center text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Last login {new Date(user.lastLogin).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-8 w-full max-w-md apple-scale glow-blue">
            <h3 className="text-2xl font-bold text-white mb-6 rounded-font">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                  placeholder="Enter password"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' | 'manager' })}
                  className="w-full px-4 py-3 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 glass-dark text-blue-300 rounded-2xl hover:bg-blue-800/30 apple-transition rounded-font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition apple-scale glow-blue rounded-font"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Settings Modal */}
      {showSettingsModal && attendanceSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-8 w-full max-w-md apple-scale glow-blue">
            <h3 className="text-2xl font-bold text-white mb-6 rounded-font">Attendance Settings</h3>
            
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                  Daily Deadline
                </label>
                <input
                  type="time"
                  value={attendanceSettings.dailyDeadline}
                  onChange={(e) => setAttendanceSettings({ 
                    ...attendanceSettings, 
                    dailyDeadline: e.target.value 
                  })}
                  className="w-full px-4 py-3 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                  required
                />
                <p className="text-xs text-blue-400 mt-1 rounded-font-light">
                  Submissions after this time will be marked as late
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={attendanceSettings.autoAbsentAfterDeadline}
                    onChange={(e) => setAttendanceSettings({ 
                      ...attendanceSettings, 
                      autoAbsentAfterDeadline: e.target.checked 
                    })}
                    className="w-4 h-4 text-blue-600 bg-transparent border-blue-300 rounded focus:ring-blue-500 apple-transition"
                  />
                  <span className="ml-2 text-sm text-blue-200 rounded-font-light">
                    Auto-mark absent after deadline
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={attendanceSettings.allowRetroactive}
                    onChange={(e) => setAttendanceSettings({ 
                      ...attendanceSettings, 
                      allowRetroactive: e.target.checked 
                    })}
                    className="w-4 h-4 text-blue-600 bg-transparent border-blue-300 rounded focus:ring-blue-500 apple-transition"
                  />
                  <span className="ml-2 text-sm text-blue-200 rounded-font-light">
                    Allow retroactive requests
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={attendanceSettings.retroactiveRequiresApproval}
                    onChange={(e) => setAttendanceSettings({ 
                      ...attendanceSettings, 
                      retroactiveRequiresApproval: e.target.checked 
                    })}
                    className="w-4 h-4 text-blue-600 bg-transparent border-blue-300 rounded focus:ring-blue-500 apple-transition"
                    disabled={!attendanceSettings.allowRetroactive}
                  />
                  <span className="ml-2 text-sm text-blue-200 rounded-font-light">
                    Retroactive requests require approval
                  </span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-3 glass-dark text-blue-300 rounded-2xl hover:bg-blue-800/30 apple-transition rounded-font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition apple-scale glow-blue rounded-font"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;