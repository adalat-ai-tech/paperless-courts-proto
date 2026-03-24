// Hardcoded fallback for immediate display (no async wait)
const COURT_NAMES: Record<string, string> = {
  orhc: 'High Court of Orissa',
  klhc: 'High Court of Kerala',
  karn: 'High Court of Karnataka',
  andh: 'High Court of Andhra Pradesh',
  tela: 'High Court of Telangana',
  tami: 'High Court of Tamil Nadu',
  maha: 'High Court of Maharashtra',
}

/**
 * Get display name for a court slug.
 * Returns full name if known, otherwise returns uppercased slug.
 */
export function getCourtName(slug?: string): string {
  if (!slug) return '—'
  const normalized = slug.toLowerCase()
  return COURT_NAMES[normalized] ?? slug.toUpperCase()
}
