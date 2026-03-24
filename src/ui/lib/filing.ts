/**
 * Shared filing utilities for consistent display across portals.
 */

/**
 * Generates a display ID for a filing.
 * If filingNumber is provided (e.g. "WP(C)/4412/2026"), returns it directly.
 * Otherwise falls back to FR-{first-8-chars-of-uuid}-{year}.
 *
 * @param filingId - The filing UUID
 * @param dateStr - ISO date string (e.g., "2026-01-20T10:00:00Z") or Date object
 * @param filingNumber - CIS-assigned filing number (e.g. "WP(C)/4412/2026")
 * @returns Formatted display ID
 */
export function formatFilingDisplayId(
  filingId: string | undefined | null,
  dateStr?: string | Date | null,
  filingNumber?: string | null,
): string {
  if (filingNumber) return filingNumber

  const idPart = filingId?.slice(0, 8) || '-'

  let year: string
  if (dateStr instanceof Date) {
    year = dateStr.getFullYear().toString()
  } else if (dateStr) {
    // Extract year from ISO string (YYYY-MM-DD...)
    year = dateStr.substring(0, 4)
  } else {
    year = new Date().getFullYear().toString()
  }

  return `FR-${idPart}-${year}`
}
