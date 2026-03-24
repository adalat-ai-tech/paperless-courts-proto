import { useCallback, useRef, useState } from 'react'
import type { VirtualDocument, LoadedDocument, DocumentLoadState } from '../types'
import { isPDFDocument } from '../types'

interface UseDocumentLoaderResult {
  /** Map of loaded documents by ID */
  loadedDocuments: Map<string, LoadedDocument>
  /** Loading state for each document */
  loadingStates: Map<string, DocumentLoadState>
  /** Load a document by ID */
  loadDocument: (documentId: string) => Promise<void>
  /** Retry loading a failed document */
  retryDocument: (documentId: string) => Promise<void>
  /** Check if a document is loaded */
  isLoaded: (documentId: string) => boolean
  /** Check if a document is loading */
  isLoading: (documentId: string) => boolean
  /** Get error for a document */
  getError: (documentId: string) => Error | undefined
}

/**
 * Hook to manage document loading with caching.
 * Calls the document's load() function lazily and caches the result.
 */
export function useDocumentLoader(
  documents: VirtualDocument[]
): UseDocumentLoaderResult {
  // Use refs for cache to avoid re-renders on every document load
  const loadedDocsRef = useRef<Map<string, LoadedDocument>>(new Map())
  const [loadedDocuments, setLoadedDocuments] = useState<Map<string, LoadedDocument>>(
    new Map()
  )
  const [loadingStates, setLoadingStates] = useState<Map<string, DocumentLoadState>>(
    new Map()
  )

  // Map of documents by ID for quick lookup
  const documentsMap = new Map(documents.map((d) => [d.id, d]))

  const loadDocument = useCallback(
    async (documentId: string): Promise<void> => {
      const doc = documentsMap.get(documentId)
      // Only load PDF documents that are ready and have a load function
      if (!doc || !isPDFDocument(doc) || doc.status === 'pending' || !doc.load) {
        return
      }

      // Check if already loaded
      if (loadedDocsRef.current.has(documentId)) {
        return
      }

      // Check if already loading
      const currentState = loadingStates.get(documentId)
      if (currentState?.status === 'loading') {
        return
      }

      // Set loading state
      setLoadingStates((prev) => {
        const next = new Map(prev)
        next.set(documentId, { status: 'loading' })
        return next
      })

      try {
        const result = await doc.load()
        const loaded: LoadedDocument = {
          id: documentId,
          blob: result.blob,
          pageCount: result.pageCount,
        }

        // Update cache ref and state
        loadedDocsRef.current.set(documentId, loaded)
        setLoadedDocuments((prev) => {
          const next = new Map(prev)
          next.set(documentId, loaded)
          return next
        })
        setLoadingStates((prev) => {
          const next = new Map(prev)
          next.set(documentId, { status: 'loaded' })
          return next
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setLoadingStates((prev) => {
          const next = new Map(prev)
          next.set(documentId, { status: 'error', error })
          return next
        })
      }
    },
    [documentsMap, loadingStates]
  )

  const retryDocument = useCallback(
    async (documentId: string): Promise<void> => {
      // Clear error state first
      setLoadingStates((prev) => {
        const next = new Map(prev)
        next.set(documentId, { status: 'idle' })
        return next
      })
      // Then try loading again
      await loadDocument(documentId)
    },
    [loadDocument]
  )

  const isLoaded = useCallback(
    (documentId: string): boolean => {
      return loadedDocuments.has(documentId)
    },
    [loadedDocuments]
  )

  const isLoading = useCallback(
    (documentId: string): boolean => {
      return loadingStates.get(documentId)?.status === 'loading'
    },
    [loadingStates]
  )

  const getError = useCallback(
    (documentId: string): Error | undefined => {
      const state = loadingStates.get(documentId)
      return state?.status === 'error' ? state.error : undefined
    },
    [loadingStates]
  )

  return {
    loadedDocuments,
    loadingStates,
    loadDocument,
    retryDocument,
    isLoaded,
    isLoading,
    getError,
  }
}
