import { FileText } from 'lucide-react'
import type { PDFDocument } from '../types'

interface PlaceholderStateProps {
  document: PDFDocument
}

/**
 * Default placeholder state component.
 * Displayed for pending documents (e.g., auto-generated docs).
 */
export function PlaceholderState({ document }: PlaceholderStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <FileText className="size-12 text-gray-400" />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-900">{document.name}</p>
        {document.description && (
          <p className="mt-1 text-xs text-gray-500">{document.description}</p>
        )}
        <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Auto-generated
        </span>
      </div>
    </div>
  )
}
