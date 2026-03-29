import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard({ onLogout }: any) {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showValues, setShowValues] = useState(false);

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const load = async () => {
    const res = await api.getSecrets();
    const data = await res.json();
    setSecrets(data);
    setFiltered(data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setFiltered(
      secrets.filter((s) =>
        s.key.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, secrets]);

  const add = async () => {
    if (!key || !value) return;
    await api.addSecret(key, value);
    setKey('');
    setValue('');
    load();
  };

  const remove = async (k: string) => {
    await api.deleteSecret(k);
    load();
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
  };

  return (
    <div style={styles.container}>
      {/* 🔝 Navbar */}
      <div style={styles.nav}>
        <h2>🔐 Cloakx</h2>
        <div>
          <button onClick={() => setShowValues(!showValues)}>
            {showValues ? 'Hide' : 'Show'}
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* ➕ Add form */}
      <div style={styles.form}>
        <input
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={add}>Add</button>
      </div>

      {/* 🔍 Search */}
      <input
        style={styles.search}
        placeholder="Search secrets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📦 Secrets */}
      <div style={styles.grid}>
        {filtered.map((s) => (
          <div key={s.key} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{s.key}</strong>
              <button onClick={() => remove(s.key)}>❌</button>
            </div>

            <div style={styles.value}>
              {showValues ? s.value : '••••••••'}
            </div>

            <button onClick={() => copy(s.value)}>📋 Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    fontFamily: 'sans-serif',
  },

  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  form: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  },

  search: {
    width: '100%',
    padding: 8,
    marginBottom: 20,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 15,
  },

  card: {
    padding: 15,
    border: '1px solid #ddd',
    borderRadius: 10,
    background: '#fafafa',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  value: {
    marginBottom: 10,
    fontFamily: 'monospace',
  },
};