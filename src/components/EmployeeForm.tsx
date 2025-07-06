import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertTriangle, Timer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/database';

const EmployeeForm: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<'Present' | 'Absent'>('Present');
  const [secondsDone, setSecondsDone] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [timeUntilDeadline, setTimeUntilDeadline] = useState<string>('');
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      const alreadySubmitted = DatabaseService.hasEntryForDate(user.id, today);
      setHasSubmitted(alreadySubmitted);
      
      // Process auto-absent entries
      DatabaseService.processAutoAbsentEntries();
    }
  }, [user, today]);

  useEffect(() => {
    const updateDeadlineTimer = () => {
      const settings = DatabaseService.getAttendanceSettings();
      if (!settings) return;

      const [hours, minutes] = settings.dailyDeadline.split(':').map(Number);
      const deadline = new Date();
      deadline.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setIsAfterDeadline(true);
        setTimeUntilDeadline('Deadline passed');
      } else {
        setIsAfterDeadline(false);
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilDeadline(`${hoursLeft}h ${minutesLeft}m remaining`);
      }
    };

    updateDeadlineTimer();
    const interval = setInterval(updateDeadlineTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    // Simulate API call with smooth animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const entry = {
        userId: user.id,
        date: today,
        attendance,
        secondsDone: attendance === 'Present' ? secondsDone : undefined,
        remarks: attendance === 'Present' ? remarks : undefined
      };

      const newEntry = DatabaseService.addEntry(entry);
      setHasSubmitted(true);
      
      if (newEntry.isLate) {
        setSubmitMessage('Entry submitted successfully! Note: Submitted after deadline.');
      } else {
        setSubmitMessage('Entry submitted successfully!');
      }
      
      // Reset form
      setSecondsDone(0);
      setRemarks('');
    } catch (error) {
      setSubmitMessage('Error submitting entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadlineInfo = () => {
    const settings = DatabaseService.getAttendanceSettings();
    if (!settings) return null;

    const [hours, minutes] = settings.dailyDeadline.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);
    
    return {
      time: deadline.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      passed: isAfterDeadline
    };
  };

  const deadlineInfo = getDeadlineInfo();

  if (hasSubmitted) {
    const userEntry = DatabaseService.getEntriesByUserId(user!.id).find(e => e.date === today);
    const isAutoAbsent = userEntry?.attendance === 'Auto-Absent';
    
    return (
      <div className="mobile-app-container animated-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-8 text-center apple-scale glow-blue">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 pulse-blue ${
            isAutoAbsent ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            {isAutoAbsent ? (
              <AlertTriangle className="w-10 h-10 text-white" />
            ) : (
              <CheckCircle className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 rounded-font">
            {isAutoAbsent ? 'Auto-Marked Absent' : 'Already Submitted'}
          </h2>
          <p className="text-blue-200 mb-6 rounded-font-light">
            {isAutoAbsent 
              ? 'You were automatically marked absent for missing the deadline.'
              : 'You have already submitted your entry for today.'
            }
          </p>
          <div className="glass-dark p-4 rounded-2xl">
            <p className="text-sm text-blue-300 rounded-font-light">
              Date: {new Date(today).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {userEntry?.isLate && (
              <p className="text-sm text-orange-400 mt-2 rounded-font-light">
                ⚠️ Submitted after deadline
              </p>
            )}
          </div>
          {isAutoAbsent && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-2xl">
              <p className="text-yellow-300 text-sm rounded-font-light">
                💡 Need to change this? Contact your manager for retroactive approval.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-app-container animated-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-8 apple-scale glow-blue">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/syncink logo.png" 
              alt="SyncInk Logo" 
              className="w-16 h-16 mx-auto mb-4 apple-scale"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 rounded-font">Kaam Kitna Kiya?</h1>
          <p className="text-blue-200 rounded-font-light">Welcome back, {user?.name}</p>
        </div>

        {/* Deadline Warning */}
        {deadlineInfo && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            deadlineInfo.passed 
              ? 'bg-red-900/20 border-red-600/30' 
              : 'bg-yellow-900/20 border-yellow-600/30'
          }`}>
            <div className="flex items-center">
              <Timer className={`w-5 h-5 mr-3 ${
                deadlineInfo.passed ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <div>
                <p className={`text-sm font-medium rounded-font ${
                  deadlineInfo.passed ? 'text-red-300' : 'text-yellow-300'
                }`}>
                  Daily Deadline: {deadlineInfo.time}
                </p>
                <p className={`text-xs rounded-font-light ${
                  deadlineInfo.passed ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {deadlineInfo.passed 
                    ? '⚠️ Submission after deadline will be marked as late'
                    : `⏰ ${timeUntilDeadline}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-dark p-4 rounded-2xl flex items-center apple-transition">
            <Calendar className="w-6 h-6 text-blue-400 mr-4" />
            <div>
              <label className="block text-sm font-medium text-blue-200 rounded-font-light">Today's Date</label>
              <p className="text-white font-medium rounded-font">
                {new Date(today).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-4 rounded-font-light">
              Attendance Status
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAttendance('Present')}
                className={`p-6 rounded-2xl border-2 apple-transition apple-scale ${
                  attendance === 'Present'
                    ? 'border-green-500 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 glow-blue'
                    : 'border-blue-800 glass-dark text-blue-300 hover:border-blue-600'
                }`}
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-3" />
                <span className="text-sm font-medium rounded-font">Present</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendance('Absent')}
                className={`p-6 rounded-2xl border-2 apple-transition apple-scale ${
                  attendance === 'Absent'
                    ? 'border-red-500 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 glow-blue'
                    : 'border-blue-800 glass-dark text-blue-300 hover:border-blue-600'
                }`}
              >
                <XCircle className="w-8 h-8 mx-auto mb-3" />
                <span className="text-sm font-medium rounded-font">Absent</span>
              </button>
            </div>
          </div>

          {attendance === 'Present' && (
            <div className="space-y-6 apple-transition">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3 rounded-font-light">
                  Seconds Done
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6" />
                  <input
                    type="number"
                    value={secondsDone}
                    onChange={(e) => setSecondsDone(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full pl-14 pr-4 py-4 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                    placeholder="Enter seconds completed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3 rounded-font-light">
                  Remarks (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-blue-400 w-6 h-6" />
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="w-full pl-14 pr-4 py-4 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition resize-none rounded-font-light"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {submitMessage && (
            <div className="flex items-center text-green-400 text-sm glass-dark p-4 rounded-2xl">
              <CheckCircle className="w-5 h-5 mr-3" />
              <span className="rounded-font-light">{submitMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition disabled:opacity-50 disabled:cursor-not-allowed font-medium apple-scale glow-blue rounded-font"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                <span className="rounded-font-light">Submitting...</span>
              </div>
            ) : (
              <span className="rounded-font">Submit Entry</span>
            )}
          </button>

          {/* Deadline Notice */}
          <div className="text-center text-xs text-blue-400 rounded-font-light">
            📋 Submit attendance through SyncInk Tracker by {deadlineInfo?.time} daily
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;