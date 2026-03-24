import { Loader2 } from 'lucide-react'

/**
 * Default loading state component.
 * Displayed while a document is being loaded.
 */
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50">
      <Loader2 className="size-8 animate-spin text-gray-400" />
      <p className="mt-4 text-sm text-gray-500">Loading document...</p>
    </div>
  )
}
