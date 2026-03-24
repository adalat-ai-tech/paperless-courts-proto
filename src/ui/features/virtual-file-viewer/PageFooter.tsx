import type { ReactNode } from 'react'

interface PageFooterProps {
  globalPageNumber: number
  displayPageNumber: string
  sectionLabel: string
  totalPages: number
  slot?: ReactNode
}

/**
 * Footer overlay for each page.
 * Shows page number and section label, with optional slot for custom content.
 */
export function PageFooter({
  displayPageNumber,
  sectionLabel,
  totalPages,
  slot,
}: PageFooterProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/70 text-white text-xs">
      <span className="truncate max-w-[200px]">{sectionLabel}</span>
      <div className="flex items-center gap-4">
        {slot}
        <span>
          Page {displayPageNumber} of {totalPages}
        </span>
      </div>
    </div>
  )
}
