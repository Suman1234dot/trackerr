import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import EmployeeForm from './components/EmployeeForm';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import BottomProfile from './components/BottomProfile';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'form' | 'dashboard'>('form');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="mobile-app-container">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="apple-transition">
        {user.role === 'admin' ? (
          currentView === 'dashboard' ? <AdminDashboard /> : <EmployeeForm />
        ) : (
          <EmployeeForm />
        )}
      </div>

      <BottomProfile />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;