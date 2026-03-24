import { useState } from 'react';
import { useAppStore } from '@/store';
import { prettifyRole } from '@/lib/utils';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const ALL_PERMISSIONS = [
  { key: 'filing:create', label: 'Create Filing' },
  { key: 'preparation:edit', label: 'Edit Preparation' },
  { key: 'preparation:submit', label: 'Submit Preparation' },
  { key: 'scrutiny:checklist', label: 'Scrutiny Checklist' },
  { key: 'scrutiny:approve', label: 'Approve Filing' },
  { key: 'scrutiny:reject', label: 'Reject Filing' },
  { key: 'scrutiny:note_defects', label: 'Note Defects' },
  { key: 'scrutiny:message', label: 'Scrutiny Message' },
  { key: 'defect:edit_case_file', label: 'Edit Case (Defect)' },
  { key: 'defect:mark_removed', label: 'Mark Defect Resolved' },
  { key: 'defect:return', label: 'Return to Advocate' },
  { key: 'defect:reject', label: 'Reject (Defect)' },
  { key: 'defect:message', label: 'Defect Message' },
  { key: 'scanning:upload_pdf', label: 'Upload PDF' },
  { key: 'any:view_metadata', label: 'View Metadata' },
  { key: 'any:view_case_file', label: 'View Case File' },
  { key: 'any:docs_received', label: 'Mark Docs Received' },
  { key: 'any:case_lookup', label: 'Case Lookup' },
  { key: 'system:manage_staff', label: 'Manage Staff' },
  { key: 'system:view_audit', label: 'View Audit' },
  { key: 'system:manage_court_config', label: 'Court Config' },
];

export default function RolesPage() {
  const roles = useAppStore(s => s.roles);
  const updateRolePermissions = useAppStore(s => s.updateRolePermissions);
  const [localPerms, setLocalPerms] = useState(() =>
    Object.fromEntries(roles.map(r => [r.id, new Set(r.permissions)]))
  );
  const [dirty, setDirty] = useState(false);

  function toggle(roleId: string, perm: string) {
    setLocalPerms(prev => {
      const next = { ...prev };
      const set = new Set(prev[roleId]);
      if (set.has(perm)) set.delete(perm);
      else set.add(perm);
      next[roleId] = set;
      return next;
    });
    setDirty(true);
  }

  function handleSave() {
    roles.forEach(r => updateRolePermissions(r.id, [...localPerms[r.id]]));
    setDirty(false);
    toast.success('Role permissions saved');
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
        {dirty && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Save className="size-4" />
            Save Changes
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-w-[900px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-48">Permission</th>
                {roles.map(r => (
                  <th key={r.id} className="px-3 py-3 text-xs font-semibold text-gray-700 text-center whitespace-nowrap">
                    {prettifyRole(r.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map(perm => (
                <tr key={perm.key} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs text-gray-700">{perm.label}</td>
                  {roles.map(r => (
                    <td key={r.id} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={localPerms[r.id]?.has(perm.key) ?? false}
                        onChange={() => toggle(r.id, perm.key)}
                        className="size-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
