export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'manager';
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface WorkEntry {
  id: string;
  userId: string;
  date: string;
  attendance: 'Present' | 'Absent' | 'Auto-Absent';
  secondsDone?: number;
  remarks?: string;
  createdAt: string;
  submittedAt?: string;
  isLate?: boolean;
  retroactiveRequest?: RetroactiveRequest;
}

export interface RetroactiveRequest {
  id: string;
  entryId: string;
  userId: string;
  requestedBy: string;
  requestDate: string;
  reason: string;
  originalAttendance: 'Present' | 'Absent' | 'Auto-Absent';
  requestedAttendance: 'Present' | 'Absent';
  requestedSecondsDone?: number;
  requestedRemarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  totalSeconds: number;
  presentDays: number;
  absentDays: number;
  autoAbsentDays: number;
  lastActivity: string;
  weeklyAverage: number;
  monthlyAverage: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
}

export interface AttendanceSettings {
  dailyDeadline: string; // HH:MM format (24-hour)
  timeZone: string;
  allowRetroactive: boolean;
  retroactiveRequiresApproval: boolean;
  autoAbsentAfterDeadline: boolean;
}