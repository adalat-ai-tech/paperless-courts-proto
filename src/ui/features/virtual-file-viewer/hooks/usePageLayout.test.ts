import { describe, it, expect } from 'vitest'
import { toRomanNumeral, computePageLayout } from './usePageLayout'
import type { VirtualDocument, LoadedDocument } from '../types'

// ---------------------------------------------------------------------------
// toRomanNumeral
// ---------------------------------------------------------------------------

describe('toRomanNumeral', () => {
  it('should convert single-digit numbers', () => {
    expect(toRomanNumeral(1)).toBe('i')
    expect(toRomanNumeral(2)).toBe('ii')
    expect(toRomanNumeral(3)).toBe('iii')
    expect(toRomanNumeral(4)).toBe('iv')
    expect(toRomanNumeral(5)).toBe('v')
    expect(toRomanNumeral(6)).toBe('vi')
    expect(toRomanNumeral(7)).toBe('vii')
    expect(toRomanNumeral(8)).toBe('viii')
    expect(toRomanNumeral(9)).toBe('ix')
  })

  it('should convert tens', () => {
    expect(toRomanNumeral(10)).toBe('x')
    expect(toRomanNumeral(14)).toBe('xiv')
    expect(toRomanNumeral(40)).toBe('xl')
    expect(toRomanNumeral(50)).toBe('l')
    expect(toRomanNumeral(90)).toBe('xc')
  })

  it('should convert larger numbers', () => {
    expect(toRomanNumeral(100)).toBe('c')
    expect(toRomanNumeral(500)).toBe('d')
    expect(toRomanNumeral(1000)).toBe('m')
    expect(toRomanNumeral(1994)).toBe('mcmxciv')
  })

  it('should handle typical preliminary page counts', () => {
    // Most case files have < 10 preliminary pages
    expect(toRomanNumeral(1)).toBe('i')
    expect(toRomanNumeral(2)).toBe('ii')
    expect(toRomanNumeral(3)).toBe('iii')
    expect(toRomanNumeral(12)).toBe('xii')
    expect(toRomanNumeral(20)).toBe('xx')
  })
})

// ---------------------------------------------------------------------------
// computePageLayout — display page numbering
// ---------------------------------------------------------------------------

describe('computePageLayout', () => {
  const emptyLoaded = new Map<string, LoadedDocument>()

  describe('preliminary documents use Roman numerals', () => {
    it('should assign Roman numerals to preliminary virtual documents', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: true,
        },
      ]

      const { pages } = computePageLayout(docs, emptyLoaded)

      expect(pages).toHaveLength(1)
      expect(pages[0].displayPageNumber).toBe('i')
      expect(pages[0].globalPageNumber).toBe(1)
    })

    it('should assign Roman numerals to preliminary PDF placeholders', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: true,
        },
        {
          id: 'index',
          name: 'Index',
          type: 'pdf',
          status: 'pending',
          preliminary: true,
        },
      ]

      const { pages } = computePageLayout(docs, emptyLoaded)

      expect(pages).toHaveLength(2)
      expect(pages[0].displayPageNumber).toBe('i')
      expect(pages[1].displayPageNumber).toBe('ii')
    })
  })

  describe('main documents use Arabic numerals', () => {
    it('should assign Arabic numerals to non-preliminary documents', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'petition',
          name: 'Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 3 }),
        },
      ]

      const loaded = new Map<string, LoadedDocument>([
        ['petition', { id: 'petition', blob: new Blob(), pageCount: 3 }],
      ])

      const { pages } = computePageLayout(docs, loaded)

      expect(pages).toHaveLength(3)
      expect(pages[0].displayPageNumber).toBe('1')
      expect(pages[1].displayPageNumber).toBe('2')
      expect(pages[2].displayPageNumber).toBe('3')
    })
  })

  describe('mixed preliminary and main numbering', () => {
    it('should use separate counters for preliminary and main sections', () => {
      const docs: VirtualDocument[] = [
        // Preliminary: Docket (1 page) + Index placeholder (1 page)
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: true,
        },
        {
          id: 'index',
          name: 'Index',
          type: 'pdf',
          status: 'pending',
          preliminary: true,
        },
        // Main: Petition (3 pages)
        {
          id: 'petition',
          name: 'Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 3 }),
        },
      ]

      const loaded = new Map<string, LoadedDocument>([
        ['petition', { id: 'petition', blob: new Blob(), pageCount: 3 }],
      ])

      const { pages, totalPages } = computePageLayout(docs, loaded)

      expect(totalPages).toBe(5)

      // Preliminary pages: Roman numerals
      expect(pages[0].displayPageNumber).toBe('i')   // Docket
      expect(pages[1].displayPageNumber).toBe('ii')  // Index placeholder

      // Main pages: Arabic numerals starting from 1
      expect(pages[2].displayPageNumber).toBe('1')   // Petition p1
      expect(pages[3].displayPageNumber).toBe('2')   // Petition p2
      expect(pages[4].displayPageNumber).toBe('3')   // Petition p3

      // Global numbers are always sequential
      expect(pages[0].globalPageNumber).toBe(1)
      expect(pages[1].globalPageNumber).toBe(2)
      expect(pages[2].globalPageNumber).toBe(3)
      expect(pages[3].globalPageNumber).toBe(4)
      expect(pages[4].globalPageNumber).toBe(5)
    })

    it('should handle realistic case file document order', () => {
      const docs: VirtualDocument[] = [
        // Preliminary
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: true,
        },
        {
          id: 'index',
          name: 'Index',
          type: 'pdf',
          status: 'pending',
          preliminary: true,
        },
        // Main documents
        {
          id: 'petition',
          name: 'Writ Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 28 }),
        },
        {
          id: 'affidavit',
          name: 'Affidavit',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 5 }),
        },
        {
          id: 'annexure-0',
          name: 'Annexure P-1',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 10 }),
        },
      ]

      const loaded = new Map<string, LoadedDocument>([
        ['petition', { id: 'petition', blob: new Blob(), pageCount: 28 }],
        ['affidavit', { id: 'affidavit', blob: new Blob(), pageCount: 5 }],
        ['annexure-0', { id: 'annexure-0', blob: new Blob(), pageCount: 10 }],
      ])

      const { pages, totalPages } = computePageLayout(docs, loaded)

      // 1 (docket) + 1 (index) + 28 + 5 + 10 = 45 total
      expect(totalPages).toBe(45)

      // Preliminary: i, ii
      expect(pages[0].displayPageNumber).toBe('i')
      expect(pages[1].displayPageNumber).toBe('ii')

      // Petition starts at Arabic 1
      expect(pages[2].displayPageNumber).toBe('1')
      // Petition last page
      expect(pages[29].displayPageNumber).toBe('28')

      // Affidavit continues Arabic numbering: 29
      expect(pages[30].displayPageNumber).toBe('29')
      // Affidavit last page
      expect(pages[34].displayPageNumber).toBe('33')

      // Annexure continues: 34
      expect(pages[35].displayPageNumber).toBe('34')
      // Last page of case file
      expect(pages[44].displayPageNumber).toBe('43')
    })
  })

  describe('documents without preliminary flag default to main', () => {
    it('should use Arabic numerals when preliminary is not set', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'doc',
          name: 'Doc',
          type: 'virtual',
          render: () => null,
          pageCount: 2,
          // no preliminary flag
        },
      ]

      const { pages } = computePageLayout(docs, emptyLoaded)

      expect(pages[0].displayPageNumber).toBe('1')
      expect(pages[1].displayPageNumber).toBe('2')
    })

    it('should use Arabic numerals when preliminary is false', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'doc',
          name: 'Doc',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: false,
        },
      ]

      const { pages } = computePageLayout(docs, emptyLoaded)

      expect(pages[0].displayPageNumber).toBe('1')
    })
  })

  describe('section info', () => {
    it('should compute section page ranges with global numbers', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'docket',
          name: 'Docket',
          type: 'virtual',
          render: () => null,
          pageCount: 1,
          preliminary: true,
        },
        {
          id: 'petition',
          name: 'Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 5 }),
        },
      ]

      const loaded = new Map<string, LoadedDocument>([
        ['petition', { id: 'petition', blob: new Blob(), pageCount: 5 }],
      ])

      const { sections } = computePageLayout(docs, loaded)

      expect(sections).toHaveLength(2)

      // Docket section
      expect(sections[0].documentId).toBe('docket')
      expect(sections[0].pageStart).toBe(1)
      expect(sections[0].pageEnd).toBe(1)
      expect(sections[0].pageCount).toBe(1)

      // Petition section
      expect(sections[1].documentId).toBe('petition')
      expect(sections[1].pageStart).toBe(2)
      expect(sections[1].pageEnd).toBe(6)
      expect(sections[1].pageCount).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle empty document list', () => {
      const { pages, sections, totalPages } = computePageLayout([], emptyLoaded)

      expect(pages).toHaveLength(0)
      expect(sections).toHaveLength(0)
      expect(totalPages).toBe(0)
    })

    it('should handle unloaded ready PDF as loading placeholder', () => {
      const docs: VirtualDocument[] = [
        {
          id: 'petition',
          name: 'Petition',
          type: 'pdf',
          status: 'ready',
          load: async () => ({ blob: new Blob(), pageCount: 10 }),
        },
      ]

      // Not yet loaded — empty map
      const { pages } = computePageLayout(docs, emptyLoaded)

      // Should have 1 loading placeholder page
      expect(pages).toHaveLength(1)
      expect(pages[0].key).toBe('petition-page-1')
      expect(pages[0].displayPageNumber).toBe('1')
    })
  })
})
