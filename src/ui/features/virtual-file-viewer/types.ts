import type { ReactNode } from 'react'

/**
 * Result returned by the document loader function.
 */
export interface DocumentLoadResult {
  /** The PDF blob data */
  blob: Blob
  /** Number of pages in the PDF */
  pageCount: number
}

/**
 * Base properties shared by all document types.
 */
interface VirtualDocumentBase {
  /** Unique identifier for the document */
  id: string
  /** Display name for the document */
  name: string
  /** Optional description text */
  description?: string
  /** Whether this document belongs to the preliminary section (uses Roman numeral pagination) */
  preliminary?: boolean
}

/**
 * A PDF document that can be loaded from a remote source.
 */
export interface PDFDocument extends VirtualDocumentBase {
  /** Discriminator for PDF documents */
  type: 'pdf'
  /** Document status: 'ready' means loadable, 'pending' means placeholder */
  status: 'ready' | 'pending'
  /** Loader function - optional for pending docs */
  load?: () => Promise<DocumentLoadResult>
  /** Pre-set page count from DB metadata — used for stable layout before blob loads */
  pageCount?: number
}

/**
 * A virtual document rendered as a React component.
 * Used for documents generated on-the-fly (e.g., docket cover page).
 */
export interface VirtualComponentDocument extends VirtualDocumentBase {
  /** Discriminator for virtual component documents */
  type: 'virtual'
  /** Render function that returns the document content */
  render: () => ReactNode
  /** Number of pages (default: 1) */
  pageCount?: number
}

/**
 * Represents a document in the virtual file viewer.
 * Can be either a PDF document or a virtual component document.
 */
export type VirtualDocument = PDFDocument | VirtualComponentDocument

/**
 * Type guard to check if a document is a PDF document.
 */
export function isPDFDocument(doc: VirtualDocument): doc is PDFDocument {
  return doc.type === 'pdf'
}

/**
 * Type guard to check if a document is a virtual component document.
 */
export function isVirtualComponentDocument(doc: VirtualDocument): doc is VirtualComponentDocument {
  return doc.type === 'virtual'
}

/**
 * Props passed to the page render function.
 * The app provides this render function to control how PDFs are displayed.
 */
export interface PageRenderProps {
  /** Document ID this page belongs to */
  documentId: string
  /** Document name for display purposes */
  documentName: string
  /** Page number within the document (1-indexed) */
  localPageNumber: number
  /** Page number across all documents (1-indexed) */
  globalPageNumber: number
  /** Formatted page number (Roman numeral for preliminary, Arabic for main) */
  displayPageNumber: string
  /** Current zoom scale (e.g., 1.0 = 100%) */
  scale: number
  /** Available width for rendering */
  width: number
  /** The loaded PDF blob */
  blob: Blob
}

/**
 * Props passed to the footer slot render function.
 */
export interface FooterSlotProps {
  /** Current page number across all documents (1-indexed) */
  globalPageNumber: number
  /** Formatted page number (Roman numeral for preliminary, Arabic for main) */
  displayPageNumber: string
  /** Current section/document label */
  sectionLabel: string
  /** Total number of pages across all documents */
  totalPages: number
}

/**
 * Internal state for a loaded document.
 */
export interface LoadedDocument {
  id: string
  blob: Blob
  pageCount: number
}

/**
 * Loading state for each document.
 */
export interface DocumentLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error'
  error?: Error
}

/**
 * Page layout information for a single page.
 */
export interface PageLayoutItem {
  /** Unique key for this page */
  key: string
  /** Document this page belongs to */
  documentId: string
  /** Document name */
  documentName: string
  /** Page number within document (1-indexed) */
  localPageNumber: number
  /** Page number across all documents (1-indexed) */
  globalPageNumber: number
  /** Formatted page number (Roman numeral for preliminary, Arabic for main) */
  displayPageNumber: string
  /** Whether this page starts a new section */
  isFirstPageOfDocument: boolean
}

/**
 * Section information for the document index.
 */
export interface SectionInfo {
  documentId: string
  documentName: string
  description?: string
  /** Document type: 'pdf' for PDF documents, 'virtual' for component documents */
  type: 'pdf' | 'virtual'
  /** Status for PDF documents (not applicable for virtual documents) */
  status: 'ready' | 'pending' | 'virtual'
  pageStart: number
  pageEnd: number
  pageCount: number
  /** Index of first page in the flat page list */
  firstPageIndex: number
}

/**
 * A bookmark pointing to a page range within the combined document.
 * Used for section navigation in a single-PDF view (e.g., TOC sections).
 */
export interface Bookmark {
  /** Unique identifier */
  id: string
  /** Display label (e.g., "Main Petition") */
  label: string
  /** Optional description */
  description?: string
  /** First page of this section (1-indexed global page number) */
  pageStart: number
  /** Last page of this section (1-indexed global page number) */
  pageEnd: number
}

/**
 * Props for the VirtualFileViewer component.
 */
export interface VirtualFileViewerProps {
  /** Array of documents to display */
  documents: VirtualDocument[]

  /**
   * Render function for PDF pages.
   * The app provides this to control PDF rendering using their preferred library.
   */
  renderPage: (props: PageRenderProps) => ReactNode

  /**
   * Optional render function for additional footer content.
   * Useful for adding defect markers or custom annotations.
   */
  renderFooterSlot?: (props: FooterSlotProps) => ReactNode

  /**
   * Custom loading state component.
   * Default: spinner with "Loading document..." text.
   */
  renderLoading?: () => ReactNode

  /**
   * Custom error state component.
   * Default: error icon with message and retry button.
   */
  renderError?: (error: Error, retry: () => void) => ReactNode

  /**
   * Custom placeholder for pending PDF documents.
   * Default: gray box with document name and "Auto-generated" badge.
   */
  renderPlaceholder?: (doc: PDFDocument) => ReactNode

  /** Initial zoom scale (default: 1.0) */
  initialScale?: number

  /** Minimum zoom scale (default: 0.5) */
  minScale?: number

  /** Maximum zoom scale (default: 2.0) */
  maxScale?: number

  /** Whether to show the document index sidebar (default: true) */
  showIndex?: boolean

  /** Callback when a document is selected in the index */
  onDocumentSelect?: (documentId: string) => void

  /** Currently selected document ID (controlled mode) */
  selectedDocumentId?: string

  /** Height of the viewer container */
  height?: number | string

  /** Additional CSS classes */
  className?: string

  /**
   * Bookmarks for section navigation within a single document.
   * When provided, the sidebar shows bookmarks instead of the document index.
   */
  bookmarks?: Bookmark[]

  /** Callback when a bookmark is selected */
  onBookmarkSelect?: (bookmarkId: string) => void

  /** Callback to download the current document. When provided, a download button appears in the toolbar. */
  onDownload?: () => void

  /** Whether to show on-page number overlays (default: true) */
  showPageNumbers?: boolean

  /** Whether the index sidebar has a toggle button to collapse/expand (default: false) */
  collapsibleIndex?: boolean

  /** Initial open state of the index sidebar when collapsibleIndex is true (default: true) */
  defaultIndexOpen?: boolean
}
