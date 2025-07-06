import React from 'react';
import { BarChart3, PieChart, TrendingUp, Activity, CalendarDays, Target } from 'lucide-react';
import { WorkEntry, UserStats } from '../types';

interface ChartsProps {
  entries: WorkEntry[];
  userStats: UserStats[];
}

const Charts: React.FC<ChartsProps> = ({ entries, userStats }) => {
  // Calculate data for charts
  const attendanceData = {
    present: entries.filter(e => e.attendance === 'Present').length,
    absent: entries.filter(e => e.attendance === 'Absent').length
  };

  const totalAttendance = attendanceData.present + attendanceData.absent;
  const presentPercentage = totalAttendance > 0 ? (attendanceData.present / totalAttendance) * 100 : 0;
  const absentPercentage = totalAttendance > 0 ? (attendanceData.absent / totalAttendance) * 100 : 0;

  // Daily progress data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyData = last7Days.map(date => {
    const dayEntries = entries.filter(e => e.date === date && e.attendance === 'Present');
    const totalSeconds = dayEntries.reduce((sum, e) => sum + (e.secondsDone || 0), 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      seconds: totalSeconds,
      entries: dayEntries.length
    };
  });

  const maxSeconds = Math.max(...dailyData.map(d => d.seconds), 1);

  // Calculate overall averages
  const overallWeeklyAvg = userStats.length > 0 
    ? Math.round(userStats.reduce((sum, stat) => sum + stat.weeklyAverage, 0) / userStats.length)
    : 0;
  const overallMonthlyAvg = userStats.length > 0 
    ? Math.round(userStats.reduce((sum, stat) => sum + stat.monthlyAverage, 0) / userStats.length)
    : 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-6 rounded-font">Analytics Dashboard</h2>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white rounded-font">Total Productivity</h3>
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2 rounded-font">
            {entries.reduce((sum, e) => sum + (e.secondsDone || 0), 0).toLocaleString()}
          </div>
          <p className="text-blue-300 text-sm rounded-font-light">Total seconds completed</p>
        </div>

        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white rounded-font">Attendance Rate</h3>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2 rounded-font">
            {presentPercentage.toFixed(1)}%
          </div>
          <p className="text-blue-300 text-sm rounded-font-light">Overall attendance</p>
        </div>

        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white rounded-font">Weekly Average</h3>
            <CalendarDays className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2 rounded-font">
            {overallWeeklyAvg}
          </div>
          <p className="text-blue-300 text-sm rounded-font-light">Seconds per day</p>
        </div>

        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white rounded-font">Monthly Average</h3>
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2 rounded-font">
            {overallMonthlyAvg}
          </div>
          <p className="text-blue-300 text-sm rounded-font-light">Seconds per day</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Pie Chart */}
        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white rounded-font">Attendance Distribution</h3>
            <PieChart className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.3)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${presentPercentage * 2.51} 251.2`}
                  className="apple-transition"
                  style={{ animationDuration: '2s' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white rounded-font">{presentPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-blue-300 rounded-font-light">Present</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
                <span className="text-white rounded-font-light">Present</span>
              </div>
              <span className="text-blue-300 rounded-font">{attendanceData.present} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-white rounded-font-light">Absent</span>
              </div>
              <span className="text-blue-300 rounded-font">{attendanceData.absent} days</span>
            </div>
          </div>
        </div>

        {/* Daily Progress Bar Chart */}
        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white rounded-font">Daily Progress (Last 7 Days)</h3>
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            {dailyData.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium rounded-font">{day.date}</span>
                  <span className="text-blue-300 rounded-font-light">{day.seconds.toLocaleString()}s</span>
                </div>
                <div className="w-full bg-blue-900/30 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full apple-transition"
                    style={{ 
                      width: `${(day.seconds / maxSeconds) * 100}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Performance Table */}
      <div className="glass rounded-2xl p-6 apple-scale glow-blue">
        <h3 className="text-xl font-semibold text-white mb-6 rounded-font">User Performance Ranking</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-800">
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">Rank</th>
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">User</th>
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">Weekly Avg</th>
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">Monthly Avg</th>
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">Total Seconds</th>
                <th className="text-left py-3 px-4 text-blue-300 font-medium rounded-font-light">Performance</th>
              </tr>
            </thead>
            <tbody>
              {userStats
                .sort((a, b) => b.totalSeconds - a.totalSeconds)
                .map((user, index) => (
                  <tr key={user.id} className="border-b border-blue-900/30 hover:bg-blue-900/20 apple-transition">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-white font-medium rounded-font">{user.name}</div>
                        <div className="text-blue-300 text-sm rounded-font-light">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white rounded-font">{user.weeklyAverage}</div>
                      <div className="text-purple-300 text-xs rounded-font-light">sec/day</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white rounded-font">{user.monthlyAverage}</div>
                      <div className="text-cyan-300 text-xs rounded-font-light">sec/day</div>
                    </td>
                    <td className="py-4 px-4 text-white rounded-font">{user.totalSeconds.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-20 bg-blue-900/30 rounded-full h-2 mr-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full apple-transition"
                            style={{ 
                              width: `${Math.min((user.totalSeconds / Math.max(...userStats.map(u => u.totalSeconds))) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-blue-300 text-sm rounded-font-light">
                          {user.presentDays > 0 ? Math.round(user.totalSeconds / user.presentDays) : 0}/day
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Charts;