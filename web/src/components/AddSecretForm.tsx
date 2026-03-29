import { useEffect, useState } from 'react';
import { api } from '../services/api';
import SecretCard from './SecretCard';

export default function AddSecretForm() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [secrets, setSecrets] = useState([]);

  const load = async () => {
    const res = await api.getSecrets();
    const data = await res.json();
    setSecrets(data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!key || !value) return;
    await api.addSecret(key, value);
    setKey('');
    setValue('');
    load();
  };

  return (
    <div>
      {/* Add */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 p-2 rounded bg-white/10"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          className="flex-1 p-2 rounded bg-white/10"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={add} className="bg-blue-500 px-4 rounded">
          Add
        </button>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-3 gap-4">
        {secrets.map((s: any) => (
          <SecretCard key={s.key} data={s} refresh={load} />
        ))}
      </div>
    </div>
  );
}