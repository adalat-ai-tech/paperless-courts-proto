import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function CaseLookupPage() {
  const filings = useAppStore(s => s.filings);
  const [query, setQuery] = useState('');

  const results = query.length >= 2
    ? filings.filter(f => {
        const q = query.toLowerCase();
        return f.filing_number?.toLowerCase().includes(q) ||
          f.cnr?.toLowerCase().includes(q) ||
          f.parties.some(p => p.name.toLowerCase().includes(q));
      })
    : [];

  return (
    <div className="p-5 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">CIS Case Lookup</h1>

      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 mb-6 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 transition-all">
        <Search className="size-5 text-gray-400 shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by diary number, CNR, or party name…"
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="text-sm text-gray-400 text-center py-4">Type at least 2 characters to search</p>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {results.map(f => {
            const petitioner = f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
            const respondent = f.parties.find(p => p.party_type === 'respondent')?.name ?? '—';
            return (
              <Link
                key={f.id}
                to={routes.filingDeskCase(f.id)}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-semibold text-sm text-blue-700">{f.filing_number ?? f.id}</div>
                  {f.cnr && <div className="font-mono text-xs text-gray-400">{f.cnr}</div>}
                  <div className="text-sm text-gray-800 mt-0.5 truncate">{petitioner} vs. {respondent}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.case_category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500">{formatDate(f.submitted_at)}</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">Open →</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="size-8 mx-auto mb-2 opacity-40" />
          <div className="text-sm">No cases found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
