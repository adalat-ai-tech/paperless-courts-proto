import { FileText, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { SectionInfo } from './types'

interface DocumentIndexProps {
  sections: SectionInfo[]
  selectedDocumentId?: string
  onDocumentSelect: (documentId: string) => void
  className?: string
}

interface DocumentIndexItemProps {
  section: SectionInfo
  isSelected: boolean
  onClick: () => void
}

function StatusIcon({ status }: { status: 'ready' | 'pending' | 'virtual' }) {
  if (status === 'pending') {
    return <Clock className="size-4 text-gray-400" />
  }
  return <FileText className="size-4 text-gray-500" />
}

function DocumentIndexItem({ section, isSelected, onClick }: DocumentIndexItemProps) {
  const isPending = section.status === 'pending'
  const isVirtual = section.type === 'virtual'
  const hasPages = section.pageCount > 0
  const isClickable = !isPending || isVirtual

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'flex items-center gap-3 w-full p-3 text-left rounded-lg transition-colors',
        isSelected && 'bg-blue-50 border border-blue-200',
        !isSelected && isClickable && 'hover:bg-gray-50',
        !isClickable && 'cursor-not-allowed opacity-60'
      )}
    >
      <StatusIcon status={section.status} />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm truncate',
            isSelected && 'text-blue-700 font-medium',
            !isSelected && isClickable && 'text-gray-900',
            !isClickable && 'text-gray-500'
          )}
        >
          {section.documentName}
        </p>
        {section.description && (
          <p className="text-xs text-gray-500 truncate">{section.description}</p>
        )}
      </div>

      {hasPages && (
        <span className="text-xs text-gray-400 flex-shrink-0">
          {section.pageStart === section.pageEnd
            ? `p.${section.pageStart}`
            : `p.${section.pageStart}-${section.pageEnd}`}
        </span>
      )}

      {isPending && !isVirtual && (
        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
          Pending
        </span>
      )}
    </button>
  )
}

/**
 * Document index sidebar component.
 * Shows list of documents with status indicators and page ranges.
 */
export function DocumentIndex({
  sections,
  selectedDocumentId,
  onDocumentSelect,
  className,
}: DocumentIndexProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {sections.map((section) => (
        <DocumentIndexItem
          key={section.documentId}
          section={section}
          isSelected={selectedDocumentId === section.documentId}
          onClick={() => onDocumentSelect(section.documentId)}
        />
      ))}
    </div>
  )
}
