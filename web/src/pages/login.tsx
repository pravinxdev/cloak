import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }: any) {
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await api.login(password);
    if (res.ok) onLogin();
    else alert('Invalid password');
  };

  return (
    <div className="h-screen flex items-center justify-center">

      <div className="glass p-8 rounded-2xl w-80 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🔐 Cloakx
        </h2>

        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-2 mb-4 rounded bg-white/10 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 transition py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}