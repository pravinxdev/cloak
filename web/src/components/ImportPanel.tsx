import { useState } from 'react';
import { api } from '../services/api';

export default function ImportPanel() {
  const [data, setData] = useState('');

  const handleImport = async () => {
    await api.importSecrets(data);
    alert('Imported!');
  };

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-lg mb-4">Import Secrets</h2>

      <textarea
        className="w-full p-2 mb-4 bg-black/30 rounded"
        rows={5}
        placeholder="Paste .env content"
        onChange={(e) => setData(e.target.value)}
      />

      <button onClick={handleImport} className="bg-blue-500 px-4 py-2 rounded">
        Import
      </button>
    </div>
  );
}