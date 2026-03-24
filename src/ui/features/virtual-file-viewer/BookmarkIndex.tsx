import { Bookmark as BookmarkIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Bookmark } from './types'

interface BookmarkIndexProps {
  bookmarks: Bookmark[]
  activeBookmarkId?: string
  onBookmarkSelect: (bookmarkId: string) => void
  className?: string
}

export function BookmarkIndex({
  bookmarks,
  activeBookmarkId,
  onBookmarkSelect,
  className,
}: BookmarkIndexProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {bookmarks.map((bookmark) => {
        const isActive = activeBookmarkId === bookmark.id
        return (
          <button
            key={bookmark.id}
            onClick={() => onBookmarkSelect(bookmark.id)}
            className={cn(
              'flex items-center gap-3 w-full p-3 text-left rounded-lg transition-colors',
              isActive && 'bg-blue-50 border border-blue-200',
              !isActive && 'hover:bg-gray-50'
            )}
          >
            <BookmarkIcon className="size-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm truncate',
                  isActive ? 'text-blue-700 font-medium' : 'text-gray-900'
                )}
              >
                {bookmark.label}
              </p>
              {bookmark.description && (
                <p className="text-xs text-gray-500 truncate">
                  {bookmark.description}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {bookmark.pageStart === bookmark.pageEnd
                ? `p.${bookmark.pageStart}`
                : `p.${bookmark.pageStart}-${bookmark.pageEnd}`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
