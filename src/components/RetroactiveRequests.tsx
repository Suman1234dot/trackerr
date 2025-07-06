import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, MessageSquare, Calendar, User, AlertTriangle } from 'lucide-react';
import { DatabaseService } from '../services/database';
import { RetroactiveRequest, WorkEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';

const RetroactiveRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RetroactiveRequest[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestedAttendance, setRequestedAttendance] = useState<'Present' | 'Absent'>('Present');
  const [requestedSeconds, setRequestedSeconds] = useState<number>(0);
  const [requestedRemarks, setRequestedRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      setRequests(DatabaseService.getPendingRetroactiveRequests());
    }
    
    if (user?.role === 'employee') {
      const userRequests = DatabaseService.getAllRetroactiveRequests()
        .filter(r => r.userId === user.id);
      setRequests(userRequests);
      
      // Get auto-absent entries for this user
      const userEntries = DatabaseService.getEntriesByUserId(user.id)
        .filter(e => e.attendance === 'Auto-Absent');
      setEntries(userEntries);
    }
  };

  const handleRequestRetroactive = (entry: WorkEntry) => {
    setSelectedEntry(entry);
    setRequestedAttendance('Present');
    setRequestedSeconds(0);
    setRequestedRemarks('');
    setRequestReason('');
    setShowRequestModal(true);
  };

  const submitRetroactiveRequest = () => {
    if (!selectedEntry || !user || !requestReason.trim()) return;

    const request: Omit<RetroactiveRequest, 'id'> = {
      entryId: selectedEntry.id,
      userId: user.id,
      requestedBy: user.name,
      requestDate: new Date().toISOString(),
      reason: requestReason,
      originalAttendance: selectedEntry.attendance,
      requestedAttendance,
      requestedSecondsDone: requestedAttendance === 'Present' ? requestedSeconds : undefined,
      requestedRemarks: requestedAttendance === 'Present' ? requestedRemarks : undefined,
      status: 'pending'
    };

    DatabaseService.addRetroactiveRequest(request);
    setShowRequestModal(false);
    loadData();
  };

  const handleApproveRequest = (request: RetroactiveRequest) => {
    const updatedRequest: RetroactiveRequest = {
      ...request,
      status: 'approved',
      reviewedBy: user?.name,
      reviewedAt: new Date().toISOString(),
      reviewComments: 'Approved by manager'
    };

    DatabaseService.updateRetroactiveRequest(updatedRequest);
    loadData();
  };

  const handleRejectRequest = (request: RetroactiveRequest, reason: string) => {
    const updatedRequest: RetroactiveRequest = {
      ...request,
      status: 'rejected',
      reviewedBy: user?.name,
      reviewedAt: new Date().toISOString(),
      reviewComments: reason
    };

    DatabaseService.updateRetroactiveRequest(updatedRequest);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  if (user?.role === 'employee') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white rounded-font">Retroactive Requests</h2>

        {/* Auto-Absent Entries */}
        {entries.length > 0 && (
          <div className="glass rounded-2xl p-6 apple-scale glow-blue">
            <h3 className="text-xl font-semibold text-white mb-4 rounded-font">Auto-Absent Days</h3>
            <div className="space-y-4">
              {entries.map(entry => {
                const hasRequest = requests.some(r => r.entryId === entry.id);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 glass-dark rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-white font-medium rounded-font">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                        <p className="text-red-400 text-sm rounded-font-light">Auto-marked absent</p>
                      </div>
                    </div>
                    {!hasRequest ? (
                      <button
                        onClick={() => handleRequestRetroactive(entry)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 apple-transition apple-scale"
                      >
                        Request Change
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-sm">
                        Request Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request History */}
        <div className="glass rounded-2xl p-6 apple-scale glow-blue">
          <h3 className="text-xl font-semibold text-white mb-4 rounded-font">Request History</h3>
          {requests.length === 0 ? (
            <p className="text-blue-300 text-center py-8 rounded-font-light">No requests found</p>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="p-4 glass-dark rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium rounded-font">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-blue-300 text-sm mb-2 rounded-font-light">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p className="text-blue-300 text-sm rounded-font-light">
                    <strong>Requested:</strong> {request.originalAttendance} → {request.requestedAttendance}
                  </p>
                  {request.reviewComments && (
                    <p className="text-blue-300 text-sm mt-2 rounded-font-light">
                      <strong>Review:</strong> {request.reviewComments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Modal */}
        {showRequestModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-3xl p-8 w-full max-w-md apple-scale glow-blue">
              <h3 className="text-2xl font-bold text-white mb-6 rounded-font">Request Retroactive Change</h3>
              
              <div className="space-y-6">
                <div className="glass-dark p-4 rounded-2xl">
                  <p className="text-blue-300 text-sm rounded-font-light">
                    Date: {new Date(selectedEntry.date).toLocaleDateString()}
                  </p>
                  <p className="text-red-400 text-sm rounded-font-light">
                    Current: {selectedEntry.attendance}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                    Reason for Change *
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition resize-none rounded-font-light"
                    placeholder="Explain why this change is needed..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                    Requested Status
                  </label>
                  <select
                    value={requestedAttendance}
                    onChange={(e) => setRequestedAttendance(e.target.value as 'Present' | 'Absent')}
                    className="w-full px-4 py-3 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                {requestedAttendance === 'Present' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                        Seconds Done
                      </label>
                      <input
                        type="number"
                        value={requestedSeconds}
                        onChange={(e) => setRequestedSeconds(parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition rounded-font-light"
                        placeholder="Enter seconds completed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 rounded-font-light">
                        Remarks
                      </label>
                      <textarea
                        value={requestedRemarks}
                        onChange={(e) => setRequestedRemarks(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 glass-dark rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 apple-transition resize-none rounded-font-light"
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-3 glass-dark text-blue-300 rounded-2xl hover:bg-blue-800/30 apple-transition rounded-font-light"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRetroactiveRequest}
                    disabled={!requestReason.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 apple-transition apple-scale glow-blue disabled:opacity-50 rounded-font"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Manager/Admin view
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white rounded-font">Pending Retroactive Requests</h2>

      {requests.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center apple-scale glow-blue">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-blue-300 rounded-font-light">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const userData = DatabaseService.getAllUsers().find(u => u.id === request.userId);
            return (
              <div key={request.id} className="glass rounded-2xl p-6 apple-scale glow-blue">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white rounded-font">
                        {userData?.name || 'Unknown User'}
                      </h3>
                      <p className="text-blue-300 text-sm rounded-font-light">
                        {userData?.email}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="glass-dark p-4 rounded-xl">
                    <p className="text-blue-300 text-sm rounded-font-light">Request Date</p>
                    <p className="text-white font-medium rounded-font">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="glass-dark p-4 rounded-xl">
                    <p className="text-blue-300 text-sm rounded-font-light">Change Request</p>
                    <p className="text-white font-medium rounded-font">
                      {request.originalAttendance} → {request.requestedAttendance}
                    </p>
                  </div>
                </div>

                <div className="glass-dark p-4 rounded-xl mb-4">
                  <p className="text-blue-300 text-sm mb-2 rounded-font-light">Reason:</p>
                  <p className="text-white rounded-font-light">{request.reason}</p>
                </div>

                {request.requestedAttendance === 'Present' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="glass-dark p-4 rounded-xl">
                      <p className="text-blue-300 text-sm rounded-font-light">Requested Seconds</p>
                      <p className="text-white font-medium rounded-font">
                        {request.requestedSecondsDone || 0}
                      </p>
                    </div>
                    <div className="glass-dark p-4 rounded-xl">
                      <p className="text-blue-300 text-sm rounded-font-light">Requested Remarks</p>
                      <p className="text-white font-medium rounded-font">
                        {request.requestedRemarks || 'None'}
                      </p>
                    </div>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleRejectRequest(request, 'Request denied by manager')}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 apple-transition apple-scale"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveRequest(request)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 apple-transition apple-scale glow-blue"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RetroactiveRequests;