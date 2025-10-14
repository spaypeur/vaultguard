import { useState } from 'react';
import api from '../services/api';

export default function ExpertRecovery() {
  const [targets, setTargets] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [opsec, setOpsec] = useState<'private' | 'shared'>('private');
  const [newTarget, setNewTarget] = useState({ label: '', description: '' });
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'playbook' | 'evidence'>('playbook');

  // Fetch data (simulate, or use useEffect+api in production)
  const fetchAll = async () => {
    const { data: t } = await api.get(`/expert-recovery/targets?opsec=${opsec}`);
    setTargets(t);
    if (selectedTarget) {
      const { data: e } = await api.get(`/expert-recovery/evidence?targetId=${selectedTarget.id}&opsec=${opsec}`);
      setEvidence(e);
    }
    const { data: p } = await api.get(`/expert-recovery/playbooks?opsec=${opsec}`);
    setPlaybooks(p);
  };

  // Target management
  const createTarget = async () => {
    const { data } = await api.post('/expert-recovery/targets', { ...newTarget, opsec });
    setTargets([...targets, data]);
    setNewTarget({ label: '', description: '' });
  };
  const addNote = async (targetId: string) => {
    await api.post(`/expert-recovery/targets/${targetId}/notes`, { note });
    setNote('');
    fetchAll();
  };

  // File upload
  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('opsec', opsec);
    if (fileType === 'playbook') {
      formData.append('name', file.name);
      formData.append('description', '');
      await api.post('/expert-recovery/playbooks', formData);
    } else {
      formData.append('targetId', selectedTarget?.id || '');
      await api.post('/expert-recovery/evidence', formData);
    }
    setFile(null);
    fetchAll();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Expert Recovery Operations</h1>
      <div className="mb-6 flex gap-4">
        <button className={`btn ${opsec === 'private' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setOpsec('private')}>Private</button>
        <button className={`btn ${opsec === 'shared' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setOpsec('shared')}>Shared</button>
      </div>
      {/* Target Management */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-2">Targets</h2>
        <div className="flex gap-2 mb-2">
          <input className="input input-bordered" placeholder="Label" value={newTarget.label} onChange={e => setNewTarget({ ...newTarget, label: e.target.value })} />
          <input className="input input-bordered" placeholder="Description" value={newTarget.description} onChange={e => setNewTarget({ ...newTarget, description: e.target.value })} />
          <button className="btn btn-success" onClick={createTarget}>Add Target</button>
        </div>
        <ul className="space-y-2">
          {targets.map(t => (
            <li key={t.id} className={`p-3 rounded-lg ${selectedTarget?.id === t.id ? 'bg-primary-900' : 'bg-gray-800'} cursor-pointer`} onClick={() => setSelectedTarget(t)}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{t.label}</span>
                <span className="text-xs text-gray-400">{t.status}</span>
              </div>
              <div className="text-gray-300 text-sm">{t.description}</div>
            </li>
          ))}
        </ul>
      </div>
      {/* Target Details */}
      {selectedTarget && (
        <div className="mb-8 card">
          <h3 className="text-lg font-semibold text-white mb-2">Target Details</h3>
          <div className="mb-2 text-gray-300">{selectedTarget.description}</div>
          <div className="mb-2">
            <input className="input input-bordered w-full" placeholder="Add note" value={note} onChange={e => setNote(e.target.value)} />
            <button className="btn btn-primary mt-2" onClick={() => addNote(selectedTarget.id)}>Add Note</button>
          </div>
          <ul className="space-y-1 mt-2">
            {selectedTarget.notes?.map((n: string, idx: number) => (
              <li key={idx} className="text-xs text-gray-400">{n}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Playbook Management */}
      <div className="mb-8 card">
        <h3 className="text-lg font-semibold text-white mb-2">Playbooks & Scripts</h3>
        <div className="flex gap-2 mb-2">
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button className="btn btn-primary" onClick={() => { setFileType('playbook'); uploadFile(); }}>Upload Playbook</button>
        </div>
        <ul className="space-y-1">
          {playbooks.map(p => (
            <li key={p.id} className="flex justify-between items-center text-gray-300">
              <span>{p.name}</span>
              <a className="btn btn-xs btn-outline" href={`/api/expert-recovery/playbooks/${p.id}/download`} target="_blank" rel="noopener noreferrer">Download</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Evidence Vault */}
      {selectedTarget && (
        <div className="mb-8 card">
          <h3 className="text-lg font-semibold text-white mb-2">Evidence Vault</h3>
          <div className="flex gap-2 mb-2">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button className="btn btn-primary" onClick={() => { setFileType('evidence'); uploadFile(); }}>Upload Evidence</button>
          </div>
          <ul className="space-y-1">
            {evidence.map(e => (
              <li key={e.id} className="flex justify-between items-center text-gray-300">
                <span>{e.filename}</span>
                <a className="btn btn-xs btn-outline" href={`/api/expert-recovery/evidence/${e.id}/download`} target="_blank" rel="noopener noreferrer">Download</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Audit Log (placeholder, can be extended for real-time) */}
      <div className="mb-8 card">
        <h3 className="text-lg font-semibold text-white mb-2">Audit Log</h3>
        <p className="text-xs text-gray-400">All expert actions are logged and encrypted for OPSEC/legal review.</p>
      </div>
    </div>
  );
}
