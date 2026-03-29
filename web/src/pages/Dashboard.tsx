import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AddSecretForm from '../components/AddSecretForm';
import ExportPanel from '../components/ExportPanel';
import ImportPanel from '../components/ImportPanel';

export default function Dashboard({ onLogout }: any) {
  const [tab, setTab] = useState('secrets');

  return (
    <div className="flex min-h-screen">
      <Sidebar setTab={setTab} onLogout={onLogout} />

      <div className="flex-1 p-6">
        {tab === 'secrets' && <AddSecretForm />}
        {tab === 'export' && <ExportPanel />}
        {tab === 'import' && <ImportPanel />}
      </div>
    </div>
  );
}