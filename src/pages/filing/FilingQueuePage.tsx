import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { FilePlus, ChevronDown } from 'lucide-react';

const STATE_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  submitted_filing: { label: 'Filed', cls: 'bg-blue-100 text-blue-700' },
  preparation: { label: 'In Preparation', cls: 'bg-orange-100 text-orange-700' },
  scrutiny: { label: 'In Scrutiny', cls: 'bg-indigo-100 text-indigo-700' },
  defects_noted: { label: 'Defective', cls: 'bg-red-100 text-red-700' },
  scanning: { label: 'Scanning', cls: 'bg-cyan-100 text-cyan-700' },
  registered_case: { label: 'Registered', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

export default function FilingQueuePage() {
  const filings = useAppStore(s => s.filings);
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = filings.filter(f => {
    if (tab === 'draft') return f.filing_state === 'draft';
    if (tab === 'filed') return f.filing_number !== undefined;
    return true;
  });

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Filing Desk</h1>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FilePlus className="size-4" />
            New Filing
            <ChevronDown className="size-3.5" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-1">
                <button
                  onClick={() => { setDropdownOpen(false); navigate(routes.filingDeskNew() + '?type=petition'); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <div className="font-medium">Writ Petition / Civil</div>
                  <div className="text-xs text-gray-400 mt-0.5">WP(C), WP(Crl), PIL, etc.</div>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate(routes.filingDeskNew() + '?type=appeal'); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <div className="font-medium">Criminal Appeal</div>
                  <div className="text-xs text-gray-400 mt-0.5">Crl.A., Crl.P., Bail, etc.</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'draft', label: 'Drafts' },
          { key: 'filed', label: 'Filed' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diary No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Parties</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Filed On</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-3" />
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
                    <div className="text-sm font-mono font-semibold text-gray-800">{f.filing_number ?? f.id}</div>
                    {f.cnr && <div className="text-[10px] text-gray-400 font-mono">{f.cnr}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-[180px]">{petitioner}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">vs. {respondent}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell max-w-[140px] truncate">{f.case_category}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{formatDate(f.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stateInfo.cls}`}>{stateInfo.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={routes.filingDeskCase(f.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No filings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
