import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function ScrutinyQueuePage() {
  const filings = useAppStore(s => s.filings);
  const cases = filings.filter(f => f.internal_stage === 'scrutiny');

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Scrutiny Queue</h1>
        <span className="text-sm text-gray-500">{cases.length} awaiting scrutiny</span>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="size-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No cases awaiting scrutiny</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map(f => {
            const petitioner = f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
            const respondent = f.parties.find(p => p.party_type === 'respondent')?.name ?? '—';
            const totalPages = f.sections.reduce((a, s) => a + s.pages, 0);
            return (
              <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="font-mono text-sm font-semibold text-gray-900 mb-1">{f.filing_number ?? f.id}</div>
                <div className="text-sm text-gray-800 font-medium truncate">{petitioner}</div>
                <div className="text-xs text-gray-500 truncate mb-1">vs. {respondent}</div>
                <div className="text-xs text-gray-400 mb-3">{f.case_category} · {totalPages} pages</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">{formatDate(f.submitted_at)}</div>
                  <Link
                    to={routes.scrutinyCase(f.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Scrutinise →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
