import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PageContainerProps {
  children: ReactNode
  footer?: ReactNode
  isFirstPage?: boolean
  /** Formatted page number to display as an on-page overlay (e.g., "i", "1") */
  pageNumber?: string
  className?: string
}

/**
 * Container wrapper for each page.
 * Handles positioning of the page content, on-page number overlay, and optional footer.
 */
export function PageContainer({
  children,
  footer,
  isFirstPage,
  pageNumber,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col',
        isFirstPage && 'border-t-4 border-blue-500',
        className
      )}
    >
      {/* Page content */}
      <div className="flex justify-center bg-gray-100 p-4 pb-0">
        <div className="relative">
          {children}
        </div>
      </div>

      {/* Page number in the gap between pages */}
      {pageNumber && (
        <div className="flex justify-center bg-gray-100 py-1">
          <span className="text-[10px] text-gray-400">
            {pageNumber}
          </span>
        </div>
      )}

      {/* Footer overlay */}
      {footer}
    </div>
  )
}
