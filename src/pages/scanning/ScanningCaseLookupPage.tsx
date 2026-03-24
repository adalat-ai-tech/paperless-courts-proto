import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { ScanLine, Search } from 'lucide-react';

export default function ScanningCaseLookupPage() {
  const filings = useAppStore(s => s.filings);
  const [query, setQuery] = useState('');

  const pending = filings.filter(f => f.internal_stage === 'scanning');
  const results = query.length >= 2
    ? filings.filter(f => {
        const q = query.toLowerCase();
        return f.filing_number?.toLowerCase().includes(q) ||
          f.cnr?.toLowerCase().includes(q) ||
          f.parties.some(p => p.name.toLowerCase().includes(q));
      })
    : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Scanning — Case Lookup</h1>

      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 mb-6 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 transition-all max-w-xl">
        <Search className="size-5 text-gray-400 shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by diary number, CNR, or party name…"
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {query.length >= 2 && results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 max-w-xl">
          {results.map(f => (
            <Link key={f.id} to={routes.scanningCase(f.id)}
              className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-mono font-semibold text-sm text-blue-700">{f.filing_number ?? f.id}</div>
                <div className="text-sm text-gray-700 truncate">
                  {f.parties.find(p => p.party_type === 'petitioner')?.name} vs. {f.parties.find(p => p.party_type === 'respondent')?.name}
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium">Open →</span>
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 text-gray-400 max-w-xl">
          <Search className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No cases found</p>
        </div>
      )}

      <div className="max-w-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Pending Scanning ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <ScanLine className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No cases awaiting scanning</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {pending.map(f => (
              <Link key={f.id} to={routes.scanningCase(f.id)}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-cyan-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-semibold text-sm text-gray-800">{f.filing_number ?? f.id}</div>
                  <div className="text-xs text-gray-500">{f.case_category}</div>
                  <div className="text-xs text-gray-500">{formatDate(f.submitted_at)}</div>
                </div>
                <span className="text-xs text-cyan-700 font-medium bg-cyan-50 px-2 py-1 rounded-lg">Scan →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
