import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard({ onLogout }: any) {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const load = async () => {
    const res = await api.getSecrets();
    const data = await res.json();
    setSecrets(data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    await api.addSecret(key, value);
    setKey('');
    setValue('');
    load();
  };

  const remove = async (k: string) => {
    await api.deleteSecret(k);
    load();
  };

  const exportEnv = async () => {
    const res = await api.exportSecrets();
    const text = await res.text();

    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const importEnv = async () => {
    const data = prompt('Paste .env content');
    if (!data) return;

    await api.importSecrets(data);
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={styles.nav}>
        <h2>🔐 Cloakx</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div style={styles.form}>
        <input placeholder="Key" value={key} onChange={(e) => setKey(e.target.value)} />
        <input placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>

      <div>
        <button onClick={exportEnv}>Export</button>
        <button onClick={importEnv}>Import</button>
      </div>

      <ul>
        {secrets.map((s) => (
          <li key={s.key}>
            {s.key}: {s.value}
            <button onClick={() => remove(s.key)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between' },
  form: { margin: '20px 0' },
};