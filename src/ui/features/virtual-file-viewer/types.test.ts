import { describe, it, expect } from 'vitest'
import { isPDFDocument, isVirtualComponentDocument } from './types'
import type { VirtualDocument, PDFDocument, VirtualComponentDocument } from './types'

describe('VirtualDocument type guards', () => {
  describe('isPDFDocument', () => {
    it('should return true for PDF documents', () => {
      const pdfDoc: PDFDocument = {
        id: 'test-pdf',
        name: 'Test PDF',
        type: 'pdf',
        status: 'ready',
        load: async () => ({ blob: new Blob(), pageCount: 1 }),
      }

      expect(isPDFDocument(pdfDoc)).toBe(true)
    })

    it('should return true for pending PDF documents', () => {
      const pendingDoc: PDFDocument = {
        id: 'test-pending',
        name: 'Pending PDF',
        type: 'pdf',
        status: 'pending',
        description: 'Auto-generated',
      }

      expect(isPDFDocument(pendingDoc)).toBe(true)
    })

    it('should return false for virtual component documents', () => {
      const virtualDoc: VirtualComponentDocument = {
        id: 'test-virtual',
        name: 'Test Virtual',
        type: 'virtual',
        render: () => null,
      }

      expect(isPDFDocument(virtualDoc)).toBe(false)
    })
  })

  describe('isVirtualComponentDocument', () => {
    it('should return true for virtual component documents', () => {
      const virtualDoc: VirtualComponentDocument = {
        id: 'test-virtual',
        name: 'Test Virtual',
        type: 'virtual',
        render: () => null,
        pageCount: 1,
      }

      expect(isVirtualComponentDocument(virtualDoc)).toBe(true)
    })

    it('should return false for PDF documents', () => {
      const pdfDoc: PDFDocument = {
        id: 'test-pdf',
        name: 'Test PDF',
        type: 'pdf',
        status: 'ready',
      }

      expect(isVirtualComponentDocument(pdfDoc)).toBe(false)
    })
  })

  describe('VirtualDocument union', () => {
    it('should allow creating mixed document arrays', () => {
      const documents: VirtualDocument[] = [
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
        },
        {
          id: 'petition',
          name: 'Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 5 }),
        },
        {
          id: 'index',
          name: 'Index',
          type: 'pdf',
          status: 'pending',
          description: 'Auto-generated',
        },
      ]

      expect(documents).toHaveLength(3)
      expect(isVirtualComponentDocument(documents[0])).toBe(true)
      expect(isPDFDocument(documents[1])).toBe(true)
      expect(isPDFDocument(documents[2])).toBe(true)
    })

    it('should narrow types correctly with type guards', () => {
      const doc: VirtualDocument = {
        id: 'test',
        name: 'Test',
        type: 'virtual',
        render: () => null,
      }

      if (isVirtualComponentDocument(doc)) {
        // TypeScript should know doc.render exists
        expect(typeof doc.render).toBe('function')
      }

      const pdfDoc: VirtualDocument = {
        id: 'test-pdf',
        name: 'Test PDF',
        type: 'pdf',
        status: 'ready',
      }

      if (isPDFDocument(pdfDoc)) {
        // TypeScript should know doc.status exists
        expect(pdfDoc.status).toBe('ready')
      }
    })
  })
})
