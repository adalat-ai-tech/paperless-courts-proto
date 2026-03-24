import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/button'

interface ErrorStateProps {
  error: Error
  onRetry: () => void
}

/**
 * Default error state component.
 * Displayed when document loading fails.
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-red-50">
      <AlertCircle className="size-8 text-red-400" />
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-red-700">Failed to load document</p>
        <p className="mt-1 text-xs text-red-500 max-w-[300px] truncate">
          {error.message}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4 gap-2"
      >
        <RefreshCw className="size-4" />
        Retry
      </Button>
    </div>
  )
}
