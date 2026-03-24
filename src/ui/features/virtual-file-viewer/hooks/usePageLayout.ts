import { useMemo } from 'react'
import type { VirtualDocument, PageLayoutItem, SectionInfo, LoadedDocument } from '../types'
import { isPDFDocument, isVirtualComponentDocument } from '../types'

/** Roman numeral lookup tables, hoisted to avoid re-allocation per call. */
const ROMAN_VALUES = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1] as const
const ROMAN_NUMERALS = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'] as const

/**
 * Converts a number to lowercase Roman numeral string.
 * Used for preliminary page numbering in court documents.
 */
export function toRomanNumeral(num: number): string {
  let result = ''
  for (let i = 0; i < ROMAN_VALUES.length; i++) {
    while (num >= ROMAN_VALUES[i]) {
      result += ROMAN_NUMERALS[i]
      num -= ROMAN_VALUES[i]
    }
  }
  return result
}

/**
 * Page height estimate in pixels (A4 ratio at ~612 base width)
 * This is used for initial layout before actual page dimensions are known.
 */
const ESTIMATED_PAGE_HEIGHT = 792

/**
 * Gap between pages in pixels
 */
const PAGE_GAP = 16

interface UsePageLayoutOptions {
  documents: VirtualDocument[]
  loadedDocuments: Map<string, LoadedDocument>
  scale: number
}

interface UsePageLayoutResult {
  /** Flat list of all pages across all documents */
  pages: PageLayoutItem[]
  /** Section information for each document */
  sections: SectionInfo[]
  /** Total number of pages */
  totalPages: number
  /** Estimated height for a single page row (for virtualizer) */
  estimatedPageHeight: number
  /** Get section info for a page index */
  getSectionForPageIndex: (pageIndex: number) => SectionInfo | undefined
  /** Get page index for a document's first page */
  getFirstPageIndexForDocument: (documentId: string) => number
}

interface ComputePageLayoutResult {
  pages: PageLayoutItem[]
  sections: SectionInfo[]
  totalPages: number
}

/**
 * Pure function that computes page layout across multiple documents.
 * Handles global page numbering, section boundaries, and
 * Roman/Arabic display numbering for preliminary/main documents.
 *
 * Exported for testing — consumed via usePageLayout hook.
 */
export function computePageLayout(
  documents: VirtualDocument[],
  loadedDocuments: Map<string, LoadedDocument>
): ComputePageLayoutResult {
  const pageList: PageLayoutItem[] = []
  const sectionList: SectionInfo[] = []
  let globalPageNumber = 1
  let preliminaryPageNumber = 1
  let mainPageNumber = 1

  /**
   * Computes the display page number based on whether the document is preliminary.
   * Preliminary documents use Roman numerals (i, ii, iii...),
   * main documents use Arabic numerals (1, 2, 3...).
   */
  function nextDisplayPageNumber(isPreliminary: boolean): string {
    if (isPreliminary) {
      return toRomanNumeral(preliminaryPageNumber++)
    }
    return String(mainPageNumber++)
  }

  for (const doc of documents) {
    const isPreliminary = doc.preliminary === true

    // Handle virtual component documents
    if (isVirtualComponentDocument(doc)) {
      const pageCount = doc.pageCount ?? 1
      const sectionStartIndex = pageList.length
      const sectionStartPage = globalPageNumber

      for (let localPage = 1; localPage <= pageCount; localPage++) {
        pageList.push({
          key: `${doc.id}-page-${localPage}`,
          documentId: doc.id,
          documentName: doc.name,
          localPageNumber: localPage,
          globalPageNumber,
          displayPageNumber: nextDisplayPageNumber(isPreliminary),
          isFirstPageOfDocument: localPage === 1,
        })
        globalPageNumber++
      }

      sectionList.push({
        documentId: doc.id,
        documentName: doc.name,
        description: doc.description,
        type: 'virtual',
        status: 'virtual',
        pageStart: sectionStartPage,
        pageEnd: globalPageNumber - 1,
        pageCount,
        firstPageIndex: sectionStartIndex,
      })
      continue
    }

    // Handle PDF documents
    if (isPDFDocument(doc)) {
      const loadedDoc = loadedDocuments.get(doc.id)
      const pageCount =
        doc.status === 'pending'
          ? 1 // Placeholder gets 1 "page"
          : loadedDoc?.pageCount ?? doc.pageCount ?? 1

      const sectionStartIndex = pageList.length
      const sectionStartPage = globalPageNumber

      for (let localPage = 1; localPage <= pageCount; localPage++) {
        pageList.push({
          key: `${doc.id}-page-${localPage}`,
          documentId: doc.id,
          documentName: doc.name,
          localPageNumber: localPage,
          globalPageNumber,
          displayPageNumber: nextDisplayPageNumber(isPreliminary),
          isFirstPageOfDocument: localPage === 1,
        })
        globalPageNumber++
      }

      sectionList.push({
        documentId: doc.id,
        documentName: doc.name,
        description: doc.description,
        type: 'pdf',
        status: doc.status,
        pageStart: sectionStartPage,
        pageEnd: globalPageNumber - 1,
        pageCount,
        firstPageIndex: sectionStartIndex,
      })
    }
  }

  return {
    pages: pageList,
    sections: sectionList,
    totalPages: globalPageNumber - 1,
  }
}

/**
 * Hook to calculate page layout across multiple documents.
 * Handles global page numbering and section boundaries.
 */
export function usePageLayout({
  documents,
  loadedDocuments,
  scale,
}: UsePageLayoutOptions): UsePageLayoutResult {
  const { pages, sections, totalPages } = useMemo(
    () => computePageLayout(documents, loadedDocuments),
    [documents, loadedDocuments]
  )

  const estimatedPageHeight = useMemo(() => {
    return ESTIMATED_PAGE_HEIGHT * scale + PAGE_GAP
  }, [scale])

  const getSectionForPageIndex = useMemo(() => {
    return (pageIndex: number): SectionInfo | undefined => {
      for (const section of sections) {
        if (
          pageIndex >= section.firstPageIndex &&
          pageIndex < section.firstPageIndex + section.pageCount
        ) {
          return section
        }
      }
      return undefined
    }
  }, [sections])

  const getFirstPageIndexForDocument = useMemo(() => {
    return (documentId: string): number => {
      const section = sections.find((s) => s.documentId === documentId)
      return section?.firstPageIndex ?? 0
    }
  }, [sections])

  return {
    pages,
    sections,
    totalPages,
    estimatedPageHeight,
    getSectionForPageIndex,
    getFirstPageIndexForDocument,
  }
}
