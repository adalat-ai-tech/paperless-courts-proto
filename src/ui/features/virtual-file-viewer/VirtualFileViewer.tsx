import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import type { VirtualFileViewerProps, PDFDocument } from './types'
import { isPDFDocument, isVirtualComponentDocument } from './types'
import { usePageLayout } from './hooks/usePageLayout'
import { useDocumentLoader } from './hooks/useDocumentLoader'
import { useVirtualScroll } from './hooks/useVirtualScroll'
import { LoadingState } from './defaults/LoadingState'
import { ErrorState } from './defaults/ErrorState'
import { PlaceholderState } from './defaults/PlaceholderState'
import { PageFooter } from './PageFooter'
import { DocumentSection } from './DocumentSection'
import { PageContainer } from './PageContainer'
import { Toolbar } from './Toolbar'
import { BookmarkIndex } from './BookmarkIndex'
import { DocumentIndex } from './DocumentIndex'

/**
 * Default page width for rendering.
 * This can be adjusted based on container width.
 */
const DEFAULT_PAGE_WIDTH = 612

/**
 * VirtualFileViewer - A component that combines multiple PDFs into one continuous scrollable view.
 *
 * Features:
 * - Virtual scrolling for performance with large documents
 * - Lazy loading of documents as they scroll into view
 * - Global page numbering across all documents
 * - Section dividers between documents
 * - Customizable zoom controls
 * - Document index sidebar
 * - Render props for PDF rendering
 *
 * @example
 * ```tsx
 * <VirtualFileViewer
 *   documents={documents}
 *   renderPage={({ blob, localPageNumber, scale, width }) => (
 *     <PDFPage blob={blob} pageNumber={localPageNumber} scale={scale} width={width} />
 *   )}
 * />
 * ```
 */
export function VirtualFileViewer({
  documents,
  renderPage,
  renderFooterSlot,
  renderLoading,
  renderError,
  renderPlaceholder,
  initialScale = 1.0,
  minScale = 0.5,
  maxScale = 2.0,
  showIndex = true,
  onDocumentSelect,
  selectedDocumentId: controlledSelectedId,
  height = '100%',
  className,
  bookmarks,
  onBookmarkSelect,
  onDownload,
  showPageNumbers = true,
  collapsibleIndex = false,
  defaultIndexOpen = true,
}: VirtualFileViewerProps) {
  // Zoom state
  const [scale, setScale] = useState(initialScale)

  // TOC/index sidebar open state (only meaningful when collapsibleIndex=true)
  const [indexOpen, setIndexOpen] = useState(collapsibleIndex ? defaultIndexOpen : true)

  // Selected document state (controlled or uncontrolled)
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    documents[0]?.id
  )
  const selectedDocumentId = controlledSelectedId ?? internalSelectedId

  // Document loading
  const {
    loadedDocuments,
    loadDocument,
    retryDocument,
    isLoaded,
    isLoading,
    getError,
  } = useDocumentLoader(documents)

  // Page layout calculation
  const {
    pages,
    sections,
    totalPages,
    estimatedPageHeight,
    getSectionForPageIndex,
    getFirstPageIndexForDocument,
  } = usePageLayout({ documents, loadedDocuments, scale })


  // Track active bookmark based on current scroll position.
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | undefined>(
    bookmarks?.[0]?.id
  )

  // When a user clicks a bookmark, suppress scroll-based overrides.
  // The virtualizer triggers multiple re-renders as it measures elements,
  // and the first visible page after scrolling may belong to the previous
  // section. We lock the active bookmark until the user scrolls manually.
  const lockedBookmarkRef = useRef<string | null>(null)

  // Handle visible range changes to update current page
  const handleVisibleRangeChange = useCallback(
    (startIndex: number, _endIndex: number) => {
      if (pages[startIndex]) {
        const globalPage = pages[startIndex].globalPageNumber

        // Only update bookmark from scroll if not locked by a click
        if (bookmarks && bookmarks.length > 0 && !lockedBookmarkRef.current) {
          const active = bookmarks.find(
            (b) => globalPage >= b.pageStart && globalPage <= b.pageEnd
          )
          if (active) {
            setActiveBookmarkId(active.id)
          }
        }

        // Update selected document based on scroll position
        const section = getSectionForPageIndex(startIndex)
        if (section && section.documentId !== selectedDocumentId) {
          setInternalSelectedId(section.documentId)
          onDocumentSelect?.(section.documentId)
        }
      }
    },
    [pages, getSectionForPageIndex, selectedDocumentId, onDocumentSelect, bookmarks]
  )

  // Virtual scrolling
  const { parentRef, virtualItems, totalSize, scrollToPage, scrollToDocument, measureElement } =
    useVirtualScroll({
      pages,
      estimatedPageHeight,
      getFirstPageIndexForDocument,
      onVisibleRangeChange: handleVisibleRangeChange,
    })

  // Load visible PDF documents (skip virtual component documents)
  useEffect(() => {
    const visibleDocIds = new Set<string>()

    for (const virtualItem of virtualItems) {
      const page = pages[virtualItem.index]
      if (page) {
        visibleDocIds.add(page.documentId)
      }
    }

    // Load each visible PDF document
    for (const docId of visibleDocIds) {
      const doc = documents.find((d) => d.id === docId)
      if (doc && isPDFDocument(doc) && doc.status === 'ready' && doc.load && !isLoaded(docId) && !isLoading(docId)) {
        loadDocument(docId)
      }
    }
  }, [virtualItems, pages, documents, isLoaded, isLoading, loadDocument])

  // Handle document selection from index
  const handleDocumentSelect = useCallback(
    (documentId: string) => {
      setInternalSelectedId(documentId)
      onDocumentSelect?.(documentId)
      scrollToDocument(documentId)
    },
    [onDocumentSelect, scrollToDocument]
  )

  // Handle bookmark selection
  const handleBookmarkSelect = useCallback(
    (bookmarkId: string) => {
      const bookmark = bookmarks?.find((b) => b.id === bookmarkId)
      if (bookmark) {
        // Lock this bookmark so scroll-based updates don't override it.
        // Unlock when the user manually scrolls (wheel/touch) or clicks another bookmark.
        lockedBookmarkRef.current = bookmarkId
        setActiveBookmarkId(bookmarkId)
        onBookmarkSelect?.(bookmarkId)
        // scrollToPage is 0-indexed, bookmark.pageStart is 1-indexed
        scrollToPage(bookmark.pageStart - 1)

        // Unlock when the user manually scrolls, or after a timeout in case
        // the virtualizer settles at a different position due to height estimation.
        const el = parentRef.current
        const timeoutId = setTimeout(() => {
          lockedBookmarkRef.current = null
        }, 600)
        if (el) {
          const unlock = () => {
            clearTimeout(timeoutId)
            lockedBookmarkRef.current = null
            el.removeEventListener('wheel', unlock)
            el.removeEventListener('touchstart', unlock)
          }
          el.addEventListener('wheel', unlock, { once: true, passive: true })
          el.addEventListener('touchstart', unlock, { once: true, passive: true })
        }
      }
    },
    [bookmarks, onBookmarkSelect, scrollToPage, parentRef]
  )

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(maxScale, s + 0.1))
  }, [maxScale])

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(minScale, s - 0.1))
  }, [minScale])

  // Calculate page width based on scale
  const pageWidth = useMemo(() => DEFAULT_PAGE_WIDTH * scale, [scale])

  // Default renderers
  const defaultRenderLoading = useCallback(() => <LoadingState />, [])
  const defaultRenderError = useCallback(
    (error: Error, retry: () => void) => <ErrorState error={error} onRetry={retry} />,
    []
  )
  const defaultRenderPlaceholder = useCallback(
    (doc: PDFDocument) => <PlaceholderState document={doc} />,
    []
  )

  const actualRenderLoading = renderLoading ?? defaultRenderLoading
  const actualRenderError = renderError ?? defaultRenderError
  const actualRenderPlaceholder = renderPlaceholder ?? defaultRenderPlaceholder

  // Render a single page
  const renderPageItem = useCallback(
    (pageIndex: number) => {
      const page = pages[pageIndex]
      if (!page) return null

      const doc = documents.find((d) => d.id === page.documentId)
      if (!doc) return null

      const section = sections.find((s) => s.documentId === page.documentId)

      // Render footer slot
      const footerSlot = renderFooterSlot?.({
        globalPageNumber: page.globalPageNumber,
        displayPageNumber: page.displayPageNumber,
        sectionLabel: page.documentName,
        totalPages,
      })

      // Handle virtual component documents
      if (isVirtualComponentDocument(doc)) {
        return (
          <PageContainer
            isFirstPage={page.isFirstPageOfDocument}
            pageNumber={showPageNumbers ? page.displayPageNumber : undefined}
            footer={
              <PageFooter
                globalPageNumber={page.globalPageNumber}
                displayPageNumber={page.displayPageNumber}
                sectionLabel={page.documentName}
                totalPages={totalPages}
                slot={footerSlot}
              />
            }
          >
            {page.isFirstPageOfDocument && section && (
              <div className="absolute top-0 left-0 right-0 -translate-y-full">
                <DocumentSection
                  name={section.documentName}
                  description={section.description}
                  pageStart={section.pageStart}
                  pageEnd={section.pageEnd}
                />
              </div>
            )}
            {doc.render()}
          </PageContainer>
        )
      }

      // Handle PDF documents
      if (isPDFDocument(doc)) {
        // Render placeholder for pending documents
        if (doc.status === 'pending') {
          return actualRenderPlaceholder(doc)
        }

        // Check loading state
        const loading = isLoading(page.documentId)
        if (loading) {
          return actualRenderLoading()
        }

        // Check error state
        const error = getError(page.documentId)
        if (error) {
          return actualRenderError(error, () => retryDocument(page.documentId))
        }

        // Check if document is loaded
        const loadedDoc = loadedDocuments.get(page.documentId)
        if (!loadedDoc) {
          // Not loaded yet, show loading state
          return actualRenderLoading()
        }

        // Render the PDF page
        return (
          <PageContainer
            isFirstPage={page.isFirstPageOfDocument}
            pageNumber={showPageNumbers ? page.displayPageNumber : undefined}
            footer={
              <PageFooter
                globalPageNumber={page.globalPageNumber}
                displayPageNumber={page.displayPageNumber}
                sectionLabel={page.documentName}
                totalPages={totalPages}
                slot={footerSlot}
              />
            }
          >
            {page.isFirstPageOfDocument && section && (
              <div className="absolute top-0 left-0 right-0 -translate-y-full">
                <DocumentSection
                  name={section.documentName}
                  description={section.description}
                  pageStart={section.pageStart}
                  pageEnd={section.pageEnd}
                />
              </div>
            )}
            {renderPage({
              documentId: page.documentId,
              documentName: page.documentName,
              localPageNumber: page.localPageNumber,
              globalPageNumber: page.globalPageNumber,
              displayPageNumber: page.displayPageNumber,
              scale,
              width: pageWidth,
              blob: loadedDoc.blob,
            })}
          </PageContainer>
        )
      }

      return null
    },
    [
      pages,
      documents,
      sections,
      loadedDocuments,
      isLoading,
      getError,
      retryDocument,
      totalPages,
      scale,
      pageWidth,
      renderPage,
      renderFooterSlot,
      actualRenderLoading,
      actualRenderError,
      actualRenderPlaceholder,
      showPageNumbers,
    ]
  )

  return (
    <div
      className={cn('flex flex-col bg-white rounded-lg border border-gray-200', className)}
      style={{ height }}
    >
      {/* Toolbar */}
      <Toolbar
        scale={scale}
        minScale={minScale}
        maxScale={maxScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onDownload={onDownload}
        onToggleIndex={collapsibleIndex && showIndex ? () => setIndexOpen((o) => !o) : undefined}
        indexOpen={indexOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Document Index / Bookmark Sidebar */}
        {showIndex && (!collapsibleIndex || indexOpen) && (
          <div className="w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto p-3 bg-gray-50">
            {bookmarks && bookmarks.length > 0 ? (
              <BookmarkIndex
                bookmarks={bookmarks}
                activeBookmarkId={activeBookmarkId}
                onBookmarkSelect={handleBookmarkSelect}
              />
            ) : (
              <DocumentIndex
                sections={sections}
                selectedDocumentId={selectedDocumentId}
                onDocumentSelect={handleDocumentSelect}
              />
            )}
          </div>
        )}

        {/* Virtual Scroll Container */}
        <div ref={parentRef} className="flex-1 overflow-y-auto bg-gray-200">
          <div
            style={{
              height: totalSize,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => (
              <div
                key={virtualItem.key}
                ref={measureElement}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderPageItem(virtualItem.index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualFileViewer
