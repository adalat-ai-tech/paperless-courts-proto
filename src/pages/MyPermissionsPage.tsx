import { useAuth } from '@/lib/auth';
import { prettifyRole } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

const STAGE_ENTRIES: [string, string][] = [
  ['Filing', 'filing'],
  ['Scanning', 'scanning'],
  ['Preparation', 'preparation'],
  ['Scrutiny', 'scrutiny'],
  ['Defect Cure', 'defect_cure'],
];

const ACTION_ENTRIES: [string, string][] = [
  ['Create Filing', 'filing:create'],
  ['Edit Preparation', 'preparation:edit'],
  ['Submit Preparation', 'preparation:submit'],
  ['Scrutiny Checklist', 'scrutiny:checklist'],
  ['Approve Filing', 'scrutiny:approve'],
  ['Reject Filing', 'scrutiny:reject'],
  ['Note Defects', 'scrutiny:note_defects'],
  ['Edit Case (Defect)', 'defect:edit_case_file'],
  ['Mark Defect Resolved', 'defect:mark_removed'],
  ['Return to Advocate', 'defect:return'],
  ['Reject (Defect)', 'defect:reject'],
  ['Upload PDF', 'scanning:upload_pdf'],
  ['View Metadata', 'any:view_metadata'],
  ['View Case File', 'any:view_case_file'],
  ['Case Lookup', 'any:case_lookup'],
  ['Manage Staff', 'system:manage_staff'],
  ['View Audit', 'system:view_audit'],
  ['Court Config', 'system:manage_court_config'],
];

export default function MyPermissionsPage() {
  const { user, canPerform, canAccess } = useAuth();

  if (!user) return null;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Permissions</h1>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as <strong>{user.name}</strong> — {prettifyRole(user.role)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-blue-600" />
            Stage Access
          </h2>
          <div className="space-y-2">
            {STAGE_ENTRIES.map(([label, stage]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${canAccess(stage) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {canAccess(stage) ? 'Allowed' : 'Denied'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-indigo-600" />
            Action Permissions
          </h2>
          <div className="space-y-1.5">
            {ACTION_ENTRIES.map(([label, action]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-xs text-gray-700">{label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${canPerform(action) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {canPerform(action) ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
