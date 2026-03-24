import { useRef, useCallback, useEffect } from 'react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import type { PageLayoutItem } from '../types'

interface UseVirtualScrollOptions {
  pages: PageLayoutItem[]
  estimatedPageHeight: number
  overscan?: number
  getFirstPageIndexForDocument: (documentId: string) => number
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
}

interface UseVirtualScrollResult {
  /** Ref to attach to the scroll container */
  parentRef: React.RefObject<HTMLDivElement | null>
  /** Virtual items to render */
  virtualItems: VirtualItem[]
  /** Total size of all items */
  totalSize: number
  /** Scroll to a specific page index */
  scrollToPage: (pageIndex: number) => void
  /** Scroll to a document's first page */
  scrollToDocument: (documentId: string) => void
  /** Get the current visible range */
  getVisibleRange: () => { startIndex: number; endIndex: number }
  /** Measure an element after render */
  measureElement: (element: HTMLElement | null) => void
}

/**
 * Hook wrapping @tanstack/react-virtual for page virtualization.
 * Provides methods to scroll to specific pages or documents.
 */
export function useVirtualScroll({
  pages,
  estimatedPageHeight,
  overscan = 3,
  getFirstPageIndexForDocument,
  onVisibleRangeChange,
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedPageHeight,
    overscan,
    // Enable dynamic measurement
    measureElement: (element) => {
      if (!element) return estimatedPageHeight
      return element.getBoundingClientRect().height
    },
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Track visible range changes
  useEffect(() => {
    if (onVisibleRangeChange && virtualItems.length > 0) {
      const startIndex = virtualItems[0].index
      const endIndex = virtualItems[virtualItems.length - 1].index
      onVisibleRangeChange(startIndex, endIndex)
    }
  }, [virtualItems, onVisibleRangeChange])

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      virtualizer.scrollToIndex(pageIndex, { align: 'start', behavior: 'auto' })
    },
    [virtualizer]
  )

  const scrollToDocument = useCallback(
    (documentId: string) => {
      const pageIndex = getFirstPageIndexForDocument(documentId)
      scrollToPage(pageIndex)
    },
    [getFirstPageIndexForDocument, scrollToPage]
  )

  const getVisibleRange = useCallback(() => {
    if (virtualItems.length === 0) {
      return { startIndex: 0, endIndex: 0 }
    }
    return {
      startIndex: virtualItems[0].index,
      endIndex: virtualItems[virtualItems.length - 1].index,
    }
  }, [virtualItems])

  const measureElement = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        virtualizer.measureElement(element)
      }
    },
    [virtualizer]
  )

  return {
    parentRef,
    virtualItems,
    totalSize,
    scrollToPage,
    scrollToDocument,
    getVisibleRange,
    measureElement,
  }
}
