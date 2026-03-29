import { useState } from 'react';
import { api } from '../services/api';

export default function SecretCard({ data, refresh }: any) {
  const [show, setShow] = useState(false);

  const remove = async () => {
    await api.deleteSecret(data.key);
    refresh();
  };

  const copy = () => {
    navigator.clipboard.writeText(data.value);
  };

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">{data.key}</span>
        <button onClick={remove}>❌</button>
      </div>

      <div className="font-mono mb-3">
        {show ? data.value : '••••••••'}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setShow(!show)}>👁️</button>
        <button onClick={copy}>📋</button>
      </div>
    </div>
  );
}