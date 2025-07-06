import { WorkEntry, User, UserStats, RetroactiveRequest, AttendanceSettings } from '../types';

export class DatabaseService {
  private static readonly WORK_ENTRIES_KEY = 'syncink_work_entries';
  private static readonly USERS_KEY = 'syncink_users';
  private static readonly RETROACTIVE_REQUESTS_KEY = 'syncink_retroactive_requests';
  private static readonly ATTENDANCE_SETTINGS_KEY = 'syncink_attendance_settings';

  static initializeDefaultUsers(): void {
    const existingUsers = this.getAllUsers();
    if (existingUsers.length === 0) {
      const defaultUsers: User[] = [
        {
          id: '1',
          email: 'admin@syncink.com',
          name: 'Admin User',
          role: 'admin',
          password: 'admin123',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'manager@syncink.com',
          name: 'Manager User',
          role: 'manager',
          password: 'manager123',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          email: 'john@syncink.com',
          name: 'John Doe',
          role: 'employee',
          password: 'john123',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          email: 'jane@syncink.com',
          name: 'Jane Smith',
          role: 'employee',
          password: 'jane123',
          createdAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Initialize default attendance settings
    const existingSettings = this.getAttendanceSettings();
    if (!existingSettings) {
      const defaultSettings: AttendanceSettings = {
        dailyDeadline: '18:00', // 6:00 PM
        timeZone: 'Asia/Kolkata',
        allowRetroactive: true,
        retroactiveRequiresApproval: true,
        autoAbsentAfterDeadline: true
      };
      localStorage.setItem(this.ATTENDANCE_SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }

  static getAttendanceSettings(): AttendanceSettings | null {
    const settings = localStorage.getItem(this.ATTENDANCE_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  }

  static updateAttendanceSettings(settings: AttendanceSettings): void {
    localStorage.setItem(this.ATTENDANCE_SETTINGS_KEY, JSON.stringify(settings));
  }

  static isSubmissionOnTime(submissionTime: Date): boolean {
    const settings = this.getAttendanceSettings();
    if (!settings) return true;

    const [hours, minutes] = settings.dailyDeadline.split(':').map(Number);
    const deadline = new Date(submissionTime);
    deadline.setHours(hours, minutes, 0, 0);

    return submissionTime <= deadline;
  }

  static processAutoAbsentEntries(): void {
    const settings = this.getAttendanceSettings();
    if (!settings || !settings.autoAbsentAfterDeadline) return;

    const today = new Date().toISOString().split('T')[0];
    const [hours, minutes] = settings.dailyDeadline.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);

    // Only process if current time is past deadline
    if (new Date() <= deadline) return;

    const employees = this.getAllUsers().filter(u => u.role === 'employee');
    const existingEntries = this.getAllEntries();

    employees.forEach(employee => {
      const hasEntry = existingEntries.some(entry => 
        entry.userId === employee.id && entry.date === today
      );

      if (!hasEntry) {
        const autoAbsentEntry: Omit<WorkEntry, 'id' | 'createdAt'> = {
          userId: employee.id,
          date: today,
          attendance: 'Auto-Absent',
          submittedAt: new Date().toISOString(),
          isLate: false
        };
        this.addEntry(autoAbsentEntry);
      }
    });
  }

  static getAllUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static authenticateUser(email: string, password: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }

  static addUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getAllUsers();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  static updateUser(updatedUser: User): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  static deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
    
    // Also delete user's work entries and retroactive requests
    const entries = this.getAllEntries();
    const filteredEntries = entries.filter(e => e.userId !== userId);
    localStorage.setItem(this.WORK_ENTRIES_KEY, JSON.stringify(filteredEntries));

    const requests = this.getAllRetroactiveRequests();
    const filteredRequests = requests.filter(r => r.userId !== userId);
    localStorage.setItem(this.RETROACTIVE_REQUESTS_KEY, JSON.stringify(filteredRequests));
  }

  static getAllEntries(): WorkEntry[] {
    const entries = localStorage.getItem(this.WORK_ENTRIES_KEY);
    return entries ? JSON.parse(entries) : [];
  }

  static getEntriesByUserId(userId: string): WorkEntry[] {
    return this.getAllEntries().filter(entry => entry.userId === userId);
  }

  static addEntry(entry: Omit<WorkEntry, 'id' | 'createdAt'>): WorkEntry {
    const entries = this.getAllEntries();
    const submissionTime = new Date();
    const isOnTime = this.isSubmissionOnTime(submissionTime);
    
    const newEntry: WorkEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      submittedAt: submissionTime.toISOString(),
      isLate: !isOnTime && entry.attendance !== 'Auto-Absent'
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.WORK_ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
  }

  static hasEntryForDate(userId: string, date: string): boolean {
    const entries = this.getEntriesByUserId(userId);
    return entries.some(entry => entry.date === date);
  }

  static getEntriesByDateRange(userId: string, startDate: string, endDate: string): WorkEntry[] {
    const entries = this.getEntriesByUserId(userId);
    return entries.filter(entry => entry.date >= startDate && entry.date <= endDate);
  }

  static getAllEntriesByDateRange(startDate: string, endDate: string): WorkEntry[] {
    const entries = this.getAllEntries();
    return entries.filter(entry => entry.date >= startDate && entry.date <= endDate);
  }

  // Retroactive Request Management
  static getAllRetroactiveRequests(): RetroactiveRequest[] {
    const requests = localStorage.getItem(this.RETROACTIVE_REQUESTS_KEY);
    return requests ? JSON.parse(requests) : [];
  }

  static addRetroactiveRequest(request: Omit<RetroactiveRequest, 'id'>): RetroactiveRequest {
    const requests = this.getAllRetroactiveRequests();
    const newRequest: RetroactiveRequest = {
      ...request,
      id: Date.now().toString()
    };
    
    requests.push(newRequest);
    localStorage.setItem(this.RETROACTIVE_REQUESTS_KEY, JSON.stringify(requests));
    return newRequest;
  }

  static updateRetroactiveRequest(updatedRequest: RetroactiveRequest): void {
    const requests = this.getAllRetroactiveRequests();
    const index = requests.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = updatedRequest;
      localStorage.setItem(this.RETROACTIVE_REQUESTS_KEY, JSON.stringify(requests));

      // If approved, update the original entry
      if (updatedRequest.status === 'approved') {
        const entries = this.getAllEntries();
        const entryIndex = entries.findIndex(e => e.id === updatedRequest.entryId);
        if (entryIndex !== -1) {
          entries[entryIndex] = {
            ...entries[entryIndex],
            attendance: updatedRequest.requestedAttendance,
            secondsDone: updatedRequest.requestedSecondsDone,
            remarks: updatedRequest.requestedRemarks,
            retroactiveRequest: updatedRequest
          };
          localStorage.setItem(this.WORK_ENTRIES_KEY, JSON.stringify(entries));
        }
      }
    }
  }

  static getPendingRetroactiveRequests(): RetroactiveRequest[] {
    return this.getAllRetroactiveRequests().filter(r => r.status === 'pending');
  }

  static getUserStats(): UserStats[] {
    const users = this.getAllUsers().filter(u => u.role === 'employee');
    const entries = this.getAllEntries();
    const today = new Date();
    
    return users.map(user => {
      const userEntries = entries.filter(e => e.userId === user.id);
      const presentEntries = userEntries.filter(e => e.attendance === 'Present');
      const absentEntries = userEntries.filter(e => e.attendance === 'Absent');
      const autoAbsentEntries = userEntries.filter(e => e.attendance === 'Auto-Absent');
      const onTimeSubmissions = userEntries.filter(e => !e.isLate && e.attendance !== 'Auto-Absent').length;
      const lateSubmissions = userEntries.filter(e => e.isLate).length;
      const totalSeconds = presentEntries.reduce((sum, e) => sum + (e.secondsDone || 0), 0);
      
      // Calculate weekly average (last 7 days)
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      
      const weeklyEntries = userEntries.filter(e => 
        e.date >= weekStartStr && e.date <= todayStr && e.attendance === 'Present'
      );
      const weeklySeconds = weeklyEntries.reduce((sum, e) => sum + (e.secondsDone || 0), 0);
      const weeklyAverage = weeklyEntries.length > 0 ? Math.round(weeklySeconds / weeklyEntries.length) : 0;
      
      // Calculate monthly average (last 30 days)
      const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      
      const monthlyEntries = userEntries.filter(e => 
        e.date >= monthStartStr && e.date <= todayStr && e.attendance === 'Present'
      );
      const monthlySeconds = monthlyEntries.reduce((sum, e) => sum + (e.secondsDone || 0), 0);
      const monthlyAverage = monthlyEntries.length > 0 ? Math.round(monthlySeconds / monthlyEntries.length) : 0;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalSeconds,
        presentDays: presentEntries.length,
        absentDays: absentEntries.length,
        autoAbsentDays: autoAbsentEntries.length,
        lastActivity: user.lastLogin || user.createdAt,
        weeklyAverage,
        monthlyAverage,
        onTimeSubmissions,
        lateSubmissions
      };
    });
  }
}