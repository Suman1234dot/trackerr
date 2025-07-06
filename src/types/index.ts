export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface WorkEntry {
  id: string;
  userId: string;
  date: string;
  attendance: 'Present' | 'Absent';
  secondsDone?: number;
  remarks?: string;
  createdAt: string;
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
  lastActivity: string;
  weeklyAverage: number;
  monthlyAverage: number;
}