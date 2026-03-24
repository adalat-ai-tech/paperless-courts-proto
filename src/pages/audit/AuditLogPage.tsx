import { useState } from 'react';
import { useAppStore } from '@/store';
import { formatDateTime, prettifyRole } from '@/lib/utils';
import { Search } from 'lucide-react';

const ACTION_OPTIONS = [
  'All Actions',
  'FILING_CREATED', 'FILING_SUBMITTED', 'FILING_DRAFT_SAVED',
  'SCANNING_STARTED', 'SCANNING_COMPLETED', 'PDF_UPLOADED',
  'PREPARATION_STARTED', 'PREPARATION_SUBMITTED',
  'SCRUTINY_STARTED', 'SCRUTINY_APPROVED', 'SCRUTINY_REJECTED', 'DEFECTS_NOTED',
  'DEFECT_CURE_STARTED', 'DEFECT_RESOLVED', 'DEFECT_ADDED',
  'CASE_REGISTERED', 'CNR_ASSIGNED',
  'STAFF_CREATED', 'STAFF_DEACTIVATED',
  'SETTINGS_UPDATED', 'SYSTEM_CONFIG_UPDATED',
  'LOGIN',
];

const RESOURCE_OPTIONS = ['All Types', 'filing', 'staff', 'settings', 'role', 'checklist', 'auth', 'system', 'dashboard'];

export default function AuditLogPage() {
  const auditLog = useAppStore(s => s.auditLog);
  const [actorQ, setActorQ] = useState('');
  const [actionF, setActionF] = useState('All Actions');
  const [resourceF, setResourceF] = useState('All Types');

  const filtered = auditLog.filter(e => {
    const matchActor = !actorQ || e.actor.toLowerCase().includes(actorQ.toLowerCase()) || e.description.toLowerCase().includes(actorQ.toLowerCase());
    const matchAction = actionF === 'All Actions' || e.action === actionF;
    const matchResource = resourceF === 'All Types' || e.resource_type === resourceF;
    return matchActor && matchAction && matchResource;
  });

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Audit Log</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            placeholder="Search actor, description…"
            value={actorQ}
            onChange={e => setActorQ(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select value={actionF} onChange={e => setActionF(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
          {ACTION_OPTIONS.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={resourceF} onChange={e => setResourceF(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
          {RESOURCE_OPTIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex items-center text-xs text-gray-500 px-2">
          {filtered.length} entries
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Timestamp</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Resource</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => (
              <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">
                  {formatDateTime(entry.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{entry.actor}</div>
                  <div className="text-xs text-gray-400">{prettifyRole(entry.actor_role)}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs hidden lg:table-cell">
                  <span className="text-gray-500">{entry.resource_type}</span>
                  <span className="font-mono text-gray-700 ml-1">{entry.resource_id}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-[300px] truncate">{entry.description}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No audit entries found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
