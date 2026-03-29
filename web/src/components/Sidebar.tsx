export default function Sidebar({ setTab, onLogout }: any) {
  return (
    <div className="w-64 glass p-5">
      <h2 className="text-xl font-bold mb-6">🔐 Cloakx</h2>

      <button onClick={() => setTab('secrets')}>Secrets</button>
      <button onClick={() => setTab('export')}>Export</button>
      <button onClick={() => setTab('import')}>Import</button>

      <button onClick={onLogout} className="mt-6 text-red-400">
        Logout
      </button>
    </div>
  );
}