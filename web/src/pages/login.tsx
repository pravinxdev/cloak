import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }: any) {
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await api.login(password);

    if (res.ok) {
      onLogin();
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🔐 Cloakx Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f5f5f5',
  },
  card: {
    padding: 30,
    borderRadius: 12,
    background: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
};