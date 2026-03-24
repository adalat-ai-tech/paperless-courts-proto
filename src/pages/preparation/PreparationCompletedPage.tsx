import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function PreparationCompletedPage() {
  const filings = useAppStore(s => s.filings);
  const cases = filings.filter(f => ['scrutiny', 'defects_noted', 'defect_cure', 'registered_case'].includes(f.filing_state) && f.sections.length > 0);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Sent to Scrutiny</h1>
        <span className="text-sm text-gray-500">{cases.length} completed</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diary No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Parties</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Sections</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Filed</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(f => {
              const petitioner = f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
              return (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={routes.caseFile(f.id)} className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-800">
                      {f.filing_number ?? f.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 max-w-[180px] truncate">{petitioner}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{f.sections.length} sections</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{formatDate(f.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-green-700">
                      <CheckCircle2 className="size-3.5" /> Sent
                    </span>
                  </td>
                </tr>
              );
            })}
            {cases.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">Nothing completed yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
