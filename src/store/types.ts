export type CISState = 'draft' | 'filed' | 'registered';
export type InternalStage = 'filing' | 'preparation' | 'scrutiny' | 'defect_cure' | 'scanning' | null;
export type FilingState = 'draft' | 'submitted_filing' | 'preparation' | 'scrutiny' | 'defects_noted' | 'defect_cure' | 'scanning' | 'registered_case' | 'rejected' | 'waiting_advocate';

export interface Party {
  name: string;
  party_type: 'petitioner' | 'respondent';
  address?: string;
}

export interface Advocate {
  name: string;
  bar_enrollment: string;
  phone: string;
  email?: string;
}

export interface Defect {
  id: string;
  code: string;
  description: string;
  resolved: boolean;
  notes?: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  pages: number;
  order: number;
}

export interface Filing {
  id: string;
  filing_number?: string;
  cnr?: string;
  case_category: string;
  case_type: string;
  cis_state: CISState;
  internal_stage: InternalStage;
  filing_state: FilingState;
  parties: Party[];
  advocate: Advocate;
  sections: DocumentSection[];
  defects: Defect[];
  submitted_at: string;
  registered_at?: string;
  defect_cure_deadline?: string;
  defect_cure_day?: number;
  pdf_url?: string;
  assigned_to?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
  created_at: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
  stage_access: string[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChecklistItem {
  id: string;
  code: string;
  description: string;
  category: string;
  active: boolean;
  state?: string;
}

export interface CourtSettings {
  court_name: string;
  court_short_name: string;
  case_number_prefix: string;
  filing_timing_mode: 'strict' | 'flexible';
  assignment_mode: 'manual' | 'auto' | 'conveyor';
  defect_cure_days: number;
  timezone: string;
}
