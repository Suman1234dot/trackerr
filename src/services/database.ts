import { WorkEntry, User, UserStats } from '../types';

export class DatabaseService {
  private static readonly WORK_ENTRIES_KEY = 'syncink_work_entries';
  private static readonly USERS_KEY = 'syncink_users';

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
          email: 'john@syncink.com',
          name: 'John Doe',
          role: 'employee',
          password: 'john123',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          email: 'jane@syncink.com',
          name: 'Jane Smith',
          role: 'employee',
          password: 'jane123',
          createdAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
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
    
    // Also delete user's work entries
    const entries = this.getAllEntries();
    const filteredEntries = entries.filter(e => e.userId !== userId);
    localStorage.setItem(this.WORK_ENTRIES_KEY, JSON.stringify(filteredEntries));
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
    const newEntry: WorkEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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

  static getUserStats(): UserStats[] {
    const users = this.getAllUsers().filter(u => u.role === 'employee');
    const entries = this.getAllEntries();
    const today = new Date();
    
    return users.map(user => {
      const userEntries = entries.filter(e => e.userId === user.id);
      const presentEntries = userEntries.filter(e => e.attendance === 'Present');
      const absentEntries = userEntries.filter(e => e.attendance === 'Absent');
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
        lastActivity: user.lastLogin || user.createdAt,
        weeklyAverage,
        monthlyAverage
      };
    });
  }
}