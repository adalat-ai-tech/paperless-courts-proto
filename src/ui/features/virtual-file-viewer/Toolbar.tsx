import { Download, Minus, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '../../components/button'
import { cn } from '../../lib/utils'

interface ToolbarProps {
  scale: number
  minScale: number
  maxScale: number
  onZoomIn: () => void
  onZoomOut: () => void
  className?: string
  onDownload?: () => void
  onToggleIndex?: () => void
  indexOpen?: boolean
}

/**
 * Toolbar component with zoom controls and page indicator.
 */
export function Toolbar({
  scale,
  minScale,
  maxScale,
  onZoomIn,
  onZoomOut,
  className,
  onDownload,
  onToggleIndex,
  indexOpen,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200',
        className
      )}
    >
      {/* Left: TOC toggle */}
      <div>
        {onToggleIndex && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleIndex}
            className="h-8 w-8 p-0"
            title={indexOpen ? 'Hide table of contents' : 'Show table of contents'}
          >
            {indexOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* Zoom controls & actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={scale <= minScale}
          className="h-8 w-8 p-0"
          title="Zoom out"
        >
          <Minus className="size-4" />
        </Button>

        <span className="text-sm text-gray-600 w-14 text-center">
          {Math.round(scale * 100)}%
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={scale >= maxScale}
          className="h-8 w-8 p-0"
          title="Zoom in"
        >
          <Plus className="size-4" />
        </Button>

        {onDownload && (
          <>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="h-8 px-2 gap-1.5"
              title="Download PDF"
            >
              <Download className="size-4" />
              <span className="text-xs">Download</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
