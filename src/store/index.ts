import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MOCK_FILINGS, MOCK_STAFF, MOCK_ROLES, MOCK_AUDIT, MOCK_CHECKLIST, MOCK_SETTINGS } from './mock-data';
import type { Filing, StaffMember, RoleDefinition, AuditEntry, ChecklistItem, CourtSettings, Defect } from './types';

export type RoleName = 'superadmin' | 'registrar' | 'filing_officer' | 'preparation_officer' | 'scrutiny_officer' | 'defect_officer' | 'scanning_officer';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
}

interface AppState {
  // Auth
  currentUser: CurrentUser | null;
  login: (role: RoleName) => void;
  logout: () => void;

  // Filings
  filings: Filing[];
  addFiling: (filing: Filing) => void;
  updateFiling: (id: string, updates: Partial<Filing>) => void;
  resolveDefect: (filingId: string, defectId: string) => void;
  addDefect: (filingId: string, defect: Defect) => void;

  // Staff
  staff: StaffMember[];
  addStaff: (s: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;

  // Roles
  roles: RoleDefinition[];
  updateRolePermissions: (roleId: string, permissions: string[]) => void;

  // Audit
  auditLog: AuditEntry[];
  addAuditEntry: (entry: AuditEntry) => void;

  // Checklist
  checklist: ChecklistItem[];
  addChecklistItem: (item: ChecklistItem) => void;
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void;

  // Settings
  settings: CourtSettings;
  updateSettings: (updates: Partial<CourtSettings>) => void;
}

const USER_BY_ROLE: Record<RoleName, CurrentUser> = {
  superadmin: { id: 'superadmin-1', name: 'Vyshnav Superadmin', email: 'vyshnav.superadmin@court.in', role: 'superadmin' },
  registrar: { id: 'registrar-1', name: 'Vyshnav Registrar', email: 'vyshnav.registrar@court.in', role: 'registrar' },
  filing_officer: { id: 'filing-1', name: 'Vyshnav Filing', email: 'vyshnav.filing@court.in', role: 'filing_officer' },
  preparation_officer: { id: 'preparation-1', name: 'Vyshnav Preparation', email: 'vyshnav.preparation@court.in', role: 'preparation_officer' },
  scrutiny_officer: { id: 'scrutiny-1', name: 'Vyshnav Scrutiny', email: 'vyshnav.scrutiny@court.in', role: 'scrutiny_officer' },
  defect_officer: { id: 'defect-1', name: 'Vyshnav Defect', email: 'vyshnav.defect@court.in', role: 'defect_officer' },
  scanning_officer: { id: 'scanning-1', name: 'Vyshnav Scanning', email: 'vyshnav.scanning@court.in', role: 'scanning_officer' },
};

let nextAuditId = 61;

export const useAppStore = create<AppState>()(
  immer((set) => ({
    currentUser: USER_BY_ROLE.superadmin,
    login: (role) => set((s) => { s.currentUser = USER_BY_ROLE[role]; }),
    logout: () => set((s) => { s.currentUser = null; }),

    filings: [...MOCK_FILINGS],
    addFiling: (filing) => set((s) => { s.filings.push(filing); }),
    updateFiling: (id, updates) => set((s) => {
      const idx = s.filings.findIndex(f => f.id === id);
      if (idx !== -1) Object.assign(s.filings[idx], updates);
    }),
    resolveDefect: (filingId, defectId) => set((s) => {
      const filing = s.filings.find(f => f.id === filingId);
      if (filing) {
        const defect = filing.defects.find(d => d.id === defectId);
        if (defect) defect.resolved = true;
      }
    }),
    addDefect: (filingId, defect) => set((s) => {
      const filing = s.filings.find(f => f.id === filingId);
      if (filing) filing.defects.push(defect);
    }),

    staff: [...MOCK_STAFF],
    addStaff: (s2) => set((s) => { s.staff.push(s2); }),
    updateStaff: (id, updates) => set((s) => {
      const idx = s.staff.findIndex(x => x.id === id);
      if (idx !== -1) Object.assign(s.staff[idx], updates);
    }),

    roles: [...MOCK_ROLES],
    updateRolePermissions: (roleId, permissions) => set((s) => {
      const role = s.roles.find(r => r.id === roleId);
      if (role) role.permissions = permissions;
    }),

    auditLog: [...MOCK_AUDIT],
    addAuditEntry: (entry) => set((s) => { s.auditLog.unshift(entry); }),

    checklist: [...MOCK_CHECKLIST],
    addChecklistItem: (item) => set((s) => { s.checklist.push(item); }),
    updateChecklistItem: (id, updates) => set((s) => {
      const idx = s.checklist.findIndex(c => c.id === id);
      if (idx !== -1) Object.assign(s.checklist[idx], updates);
    }),

    settings: { ...MOCK_SETTINGS },
    updateSettings: (updates) => set((s) => { Object.assign(s.settings, updates); }),
  }))
);

// Helper to add audit entry
export function logAudit(actor: string, actorRole: string, action: string, resourceType: string, resourceId: string, description: string) {
  useAppStore.getState().addAuditEntry({
    id: `a${nextAuditId++}`,
    actor,
    actor_role: actorRole,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    description,
    timestamp: new Date().toISOString(),
  });
}
