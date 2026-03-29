import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import { api } from './services/api';
import Login from './pages/login';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = async () => {
    await api.logout();
    setLoggedIn(false);
  };

  return loggedIn ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;