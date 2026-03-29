import { api } from '../services/api';

export default function ExportPanel() {
  const handleExport = async () => {
    const res = await api.exportSecrets();
    const text = await res.text();
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-lg mb-4">Export Secrets</h2>

      <button onClick={handleExport} className="bg-green-500 px-4 py-2 rounded">
        Copy .env
      </button>
    </div>
  );
}