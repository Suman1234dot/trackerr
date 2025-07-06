import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Download, BarChart3, TrendingUp, Plus, Trash2, Edit, CalendarDays, Target, AlertTriangle, Timer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/database';
import { WorkEntry, User, UserStats } from '../types';
import UserManagement from './UserManagement';
import Charts from './Charts';
import RetroactiveRequests from './RetroactiveRequests';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [dateFilter, setDateFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'requests'>('overview');
  const [userStats, setUserStats] = useState<UserStats[]>([]);

  useEffect(() => {
    loadData();
    // Process auto-absent entries on dashboard load
    DatabaseService.processAutoAbsentEntries();
  }, [dateFilter]);

  const loadData = () => {
    setLoading(true);
    const today = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    const allEntries = DatabaseService.getAllEntriesByDateRange(startDateStr, endDateStr);
    const stats = DatabaseService.getUserStats();
    
    setEntries(allEntries);
    setUserStats(stats);
    setLoading(false);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,User,Email,Attendance,Seconds Done,Remarks,Submitted At,Late Submission\n" +
      entries.map(entry => {
        const userData = DatabaseService.getAllUsers().find(u => u.id === entry.userId);
        return `${entry.date},${userData?.name || 'Unknown'},${userData?.email || 'Unknown'},${entry.attendance},${entry.secondsDone || 0},"${entry.remarks || ''}",${entry.submittedAt || ''},${entry.isLate ? 'Yes' : 'No'}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `syncink-work-entries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSeconds = entries.reduce((sum, entry) => sum + (entry.secondsDone || 0), 0);
  const totalPresent = entries.filter(entry => entry.attendance === 'Present').length;
  const totalAbsent = entries.filter(entry => entry.attendance === 'Absent').length;
  const totalAutoAbsent = entries.filter(entry => entry.attendance === 'Auto-Absent').length;
  const totalLateSubmissions = entries.filter(entry => entry.isLate).length;
  const totalUsers = userStats.length;

  // Calculate overall averages
  const overallWeeklyAvg = userStats.length > 0 
    ? Math.round(userStats.reduce((sum, stat) => sum + stat.weeklyAverage, 0) / userStats.length)
    : 0;
  const overallMonthlyAvg = userStats.length > 0 
    ? Math.round(userStats.reduce((sum, stat) => sum + stat.monthlyAverage, 0) / userStats.length)
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'requests', label: 'Requests', icon: AlertTriangle }
  ];

  return (
    <div className="mobile-app-container animated-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-3xl shadow-2xl p-6 mb-6 apple-scale glow-blue">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center mb-4 lg:mb-0">
              <img 
                src="/syncink logo.png" 
                alt="SyncInk Logo" 
                className="w-12 h-12 mr-4 apple-scale"
              />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 rounded-font">Admin Dashboard</h1>
                <p className="text-blue-200 rounded-font-light">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                onClick={exportData}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 apple-transition apple-scale glow-blue rounded-font"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-2xl font-medium apple-transition apple-scale whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white glow-blue'
                      : 'glass-dark text-blue-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="rounded-font">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-xs font-medium rounded-font-light">Total Users</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-xs font-medium rounded-font-light">Total Seconds</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalSeconds.toLocaleString()}</p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-xs font-medium rounded-font-light">Present Days</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalPresent}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-xs font-medium rounded-font-light">Auto-Absent</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalAutoAbsent}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-xs font-medium rounded-font-light">Weekly Avg</p>
                    <p className="text-2xl font-bold text-white rounded-font">{overallWeeklyAvg}</p>
                    <p className="text-xs text-purple-300 rounded-font-light">sec/day</p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-xs font-medium rounded-font-light">Monthly Avg</p>
                    <p className="text-2xl font-bold text-white rounded-font">{overallMonthlyAvg}</p>
                    <p className="text-xs text-cyan-300 rounded-font-light">sec/day</p>
                  </div>
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-xs font-medium rounded-font-light">Late Submissions</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalLateSubmissions}</p>
                  </div>
                  <Timer className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <div className="glass rounded-2xl p-4 apple-scale glow-blue">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-xs font-medium rounded-font-light">Absent Days</p>
                    <p className="text-2xl font-bold text-white rounded-font">{totalAbsent}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* User Summary Table */}
            <div className="glass rounded-3xl shadow-2xl overflow-hidden mb-8 apple-scale glow-blue">
              <div className="px-6 py-4 border-b border-blue-800">
                <h3 className="text-xl font-semibold text-white rounded-font">User Performance Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="glass-dark">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Present
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Auto-Absent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        On Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Late
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Weekly Avg
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Monthly Avg
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider rounded-font-light">
                        Total Seconds
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-800">
                    {userStats.map(userStat => (
                      <tr key={userStat.id} className="hover:bg-blue-900/20 apple-transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white rounded-font">{userStat.name}</div>
                            <div className="text-xs text-blue-300 rounded-font-light">{userStat.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-900/30 text-emerald-300 rounded-font">
                            {userStat.presentDays}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900/30 text-red-300 rounded-font">
                            {userStat.autoAbsentDays}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-300 rounded-font">
                            {userStat.onTimeSubmissions}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900/30 text-orange-300 rounded-font">
                            {userStat.lateSubmissions}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white rounded-font">{userStat.weeklyAverage}</div>
                          <div className="text-xs text-purple-300 rounded-font-light">sec/day</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white rounded-font">{userStat.monthlyAverage}</div>
                          <div className="text-xs text-cyan-300 rounded-font-light">sec/day</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white rounded-font">
                          {userStat.totalSeconds.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="glass rounded-3xl shadow-2xl p-6 apple-scale glow-blue">
              <h3 className="text-xl font-semibold text-white mb-6 rounded-font">Recent Entries</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-blue-300 mt-4 rounded-font-light">Loading entries...</p>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-blue-300">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <p className="rounded-font-light">No entries found for the selected period</p>
                  </div>
                ) : (
                  entries.slice(0, 10).map(entry => {
                    const userData = DatabaseService.getAllUsers().find(u => u.id === entry.userId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-4 glass-dark rounded-2xl apple-transition hover:bg-opacity-60">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${
                            entry.attendance === 'Present' ? 'bg-emerald-400' : 
                            entry.attendance === 'Auto-Absent' ? 'bg-red-500' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-white rounded-font">{userData?.name || 'Unknown User'}</p>
                            <p className="text-sm text-blue-300 rounded-font-light">
                              {new Date(entry.date).toLocaleDateString()}
                              {entry.isLate && <span className="text-orange-400 ml-2">• Late</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium rounded-font ${
                            entry.attendance === 'Auto-Absent' ? 'text-red-400' : 'text-white'
                          }`}>
                            {entry.attendance}
                          </p>
                          {entry.secondsDone && (
                            <p className="text-xs text-blue-300 rounded-font-light">{entry.secondsDone}s</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && <UserManagement onUserChange={loadData} />}
        {activeTab === 'analytics' && <Charts entries={entries} userStats={userStats} />}
        {activeTab === 'requests' && <RetroactiveRequests />}
      </div>
    </div>
  );
};

export default AdminDashboard;