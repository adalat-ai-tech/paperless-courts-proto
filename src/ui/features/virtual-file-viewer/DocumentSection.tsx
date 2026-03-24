interface DocumentSectionProps {
  name: string
  description?: string
  pageStart: number
  pageEnd: number
}

/**
 * Section divider component.
 * Shows document name and page range at the start of each document.
 */
export function DocumentSection({
  name,
  description,
  pageStart,
  pageEnd,
}: DocumentSectionProps) {
  const pageRange = pageStart === pageEnd ? `Page ${pageStart}` : `Pages ${pageStart}-${pageEnd}`

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 border-b border-gray-200">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
        {description && (
          <p className="text-xs text-gray-500 truncate">{description}</p>
        )}
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{pageRange}</span>
    </div>
  )
}
