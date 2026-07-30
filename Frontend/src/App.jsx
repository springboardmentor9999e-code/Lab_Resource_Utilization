import { useState } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import { PermissionsProvider } from './context/PermissionsContext';
function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'login' | 'register' | 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  return (
    <>
      {currentView === 'home' && (
        <Home 
          onNavigate={handleNavigate}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onNavigate={handleNavigate} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
      {currentView === 'register' && (
        <Register 
          onNavigate={handleNavigate} 
          onRegisterSuccess={handleRegisterSuccess} 
        />
      )}
      {currentView === 'dashboard' && (
        <PermissionsProvider user={currentUser}>
          {currentUser?.roleId === 1 ? (
            <StudentDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
            />
          ) : (
            <Dashboard 
              user={currentUser} 
              onLogout={handleLogout} 
            />
          )}
        </PermissionsProvider>
      )}
    </>
  );
}

export default App;
