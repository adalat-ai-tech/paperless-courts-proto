export const Stages = {
  FILING: "filing",
  PREPARATION: "preparation",
  SCRUTINY: "scrutiny",
  DEFECT_CURE: "defect_cure",
  SCANNING: "scanning",
} as const;

export type Stage = (typeof Stages)[keyof typeof Stages];

export const Actions = {
  FILING_CREATE: "filing:create",
  PREPARATION_EDIT: "preparation:edit",
  PREPARATION_SUBMIT: "preparation:submit",
  SCRUTINY_CHECKLIST: "scrutiny:checklist",
  SCRUTINY_APPROVE: "scrutiny:approve",
  SCRUTINY_REJECT: "scrutiny:reject",
  SCRUTINY_NOTE_DEFECTS: "scrutiny:note_defects",
  SCRUTINY_MESSAGE: "scrutiny:message",
  DEFECT_EDIT_CASE_FILE: "defect:edit_case_file",
  DEFECT_MARK_REMOVED: "defect:mark_removed",
  DEFECT_RETURN: "defect:return",
  DEFECT_REJECT: "defect:reject",
  DEFECT_MESSAGE: "defect:message",
  SCANNING_UPLOAD_PDF: "scanning:upload_pdf",
  ANY_VIEW_METADATA: "any:view_metadata",
  ANY_VIEW_CASE_FILE: "any:view_case_file",
  ANY_DOCS_RECEIVED: "any:docs_received",
  ANY_CASE_LOOKUP: "any:case_lookup",
  SYSTEM_MANAGE_STAFF: "system:manage_staff",
  SYSTEM_VIEW_AUDIT: "system:view_audit",
  SYSTEM_MANAGE_COURT_CONFIG: "system:manage_court_config",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];
