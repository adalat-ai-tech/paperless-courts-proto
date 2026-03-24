import { useAppStore } from '@/store';
import type { RoleName } from '@/store';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Stages, Actions } from './constants';

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  superadmin: Object.values(Actions),
  registrar: ['any:view_metadata', 'any:view_case_file', 'any:docs_received', 'any:case_lookup', 'system:manage_staff', 'system:view_audit', 'system:manage_court_config'],
  filing_officer: ['any:view_metadata', 'any:view_case_file', 'any:case_lookup', 'filing:create'],
  preparation_officer: ['any:view_metadata', 'any:view_case_file', 'preparation:edit', 'preparation:submit'],
  scrutiny_officer: ['any:view_metadata', 'any:view_case_file', 'scrutiny:checklist', 'scrutiny:approve', 'scrutiny:reject', 'scrutiny:note_defects', 'scrutiny:message'],
  defect_officer: ['any:view_metadata', 'any:view_case_file', 'defect:edit_case_file', 'defect:mark_removed', 'defect:return', 'defect:reject', 'defect:message'],
  scanning_officer: ['any:view_metadata', 'scanning:upload_pdf', 'any:case_lookup'],
};

const ROLE_STAGES: Record<RoleName, string[]> = {
  superadmin: Object.values(Stages),
  registrar: Object.values(Stages),
  filing_officer: [Stages.FILING],
  preparation_officer: [Stages.PREPARATION],
  scrutiny_officer: [Stages.SCRUTINY],
  defect_officer: [Stages.DEFECT_CURE],
  scanning_officer: [Stages.SCANNING],
};

export function useAuth() {
  const user = useAppStore(s => s.currentUser);
  const login = useAppStore(s => s.login);
  const logout = useAppStore(s => s.logout);

  const canPerform = (action: string) => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] ?? [];
    return perms.includes(action);
  };

  const canAccess = (stage: string) => {
    if (!user) return false;
    const stages = ROLE_STAGES[user.role] ?? [];
    return stages.includes(stage);
  };

  return { user, login, logout, canPerform, canAccess };
}

interface CanProps {
  canPerform?: string;
  canAccess?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ canPerform: action, canAccess: stage, children, fallback = null }: CanProps) {
  const { canPerform, canAccess } = useAuth();

  if (action && !canPerform(action)) return createElement('span', null, fallback);
  if (stage && !canAccess(stage)) return createElement('span', null, fallback);

  return createElement('span', null, children);
}

export function ProtectedRoute() {
  const user = useAppStore(s => s.currentUser);
  if (!user) return createElement(Navigate, { to: '/login', replace: true });
  return createElement(Outlet);
}

interface WithAccessProps {
  canPerform?: string;
  canAccess?: string;
  children: ReactNode;
}

export function WithAccess({ canPerform: action, canAccess: stage, children }: WithAccessProps) {
  const { canPerform, canAccess } = useAuth();

  if (action && !canPerform(action)) return createElement(Navigate, { to: '/access-denied', replace: true });
  if (stage && !canAccess(stage)) return createElement(Navigate, { to: '/access-denied', replace: true });

  return createElement('span', null, children);
}

export function getDefaultRoute(role: RoleName): string {
  switch (role) {
    case 'superadmin':
    case 'registrar':
      return '/dashboard';
    case 'filing_officer':
      return '/filing-desk/queue';
    case 'preparation_officer':
      return '/preparation/queue';
    case 'scrutiny_officer':
      return '/scrutiny/queue';
    case 'defect_officer':
      return '/defect-cure/queue';
    case 'scanning_officer':
      return '/scanning/case-lookup';
    default:
      return '/dashboard';
  }
}
