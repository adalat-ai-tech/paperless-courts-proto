import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

const STATE_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  submitted_filing: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  preparation: { label: 'Preparation', cls: 'bg-orange-100 text-orange-700' },
  scrutiny: { label: 'Scrutiny', cls: 'bg-indigo-100 text-indigo-700' },
  defects_noted: { label: 'Defective', cls: 'bg-red-100 text-red-700' },
  defect_cure: { label: 'Defect Cure', cls: 'bg-amber-100 text-amber-700' },
  scanning: { label: 'Scanning', cls: 'bg-cyan-100 text-cyan-700' },
  registered_case: { label: 'Registered', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  waiting_advocate: { label: 'Waiting Advocate', cls: 'bg-yellow-100 text-yellow-700' },
};

export default function CaseFilesListPage() {
  const filings = useAppStore(s => s.filings);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = filings.filter(f => {
    const q = query.toLowerCase();
    const matchQ = !q || f.filing_number?.toLowerCase().includes(q) || f.cnr?.toLowerCase().includes(q) ||
      f.parties.some(p => p.name.toLowerCase().includes(q)) || f.case_category.toLowerCase().includes(q);
    const matchF = filter === 'all' || f.filing_state === filter;
    return matchQ && matchF;
  });

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Case Register</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            placeholder="Search cases, parties…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="all">All States</option>
          <option value="draft">Draft</option>
          <option value="scrutiny">Scrutiny</option>
          <option value="defects_noted">Defective</option>
          <option value="registered_case">Registered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diary No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">CNR</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Parties</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Filed</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const petitioner = f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
              const respondent = f.parties.find(p => p.party_type === 'respondent')?.name ?? '—';
              const stateInfo = STATE_LABELS[f.filing_state] ?? { label: f.filing_state, cls: 'bg-gray-100 text-gray-600' };

              return (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={routes.caseFile(f.id)} className="text-sm font-mono font-semibold text-blue-600 hover:text-blue-800">
                      {f.filing_number ?? f.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 hidden md:table-cell">{f.cnr ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{petitioner}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">vs. {respondent}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell max-w-[160px] truncate">{f.case_category}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{formatDate(f.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stateInfo.cls}`}>
                      {stateInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No cases found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
