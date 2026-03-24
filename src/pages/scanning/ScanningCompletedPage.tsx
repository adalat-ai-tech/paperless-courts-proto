import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function ScanningCompletedPage() {
  const filings = useAppStore(s => s.filings);
  // Cases that moved past scanning (have sections, or are in prep/scrutiny)
  const cases = filings.filter(f =>
    f.internal_stage !== 'scanning' && ['preparation', 'scrutiny', 'defects_noted', 'defect_cure', 'registered_case'].includes(f.filing_state)
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Scanning Completed</h1>
        <span className="text-sm text-gray-500">{cases.length} processed</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diary No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Parties</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Filed</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Current Stage</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(f => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={routes.caseFile(f.id)} className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-800">
                    {f.filing_number ?? f.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell max-w-[200px] truncate">
                  {f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{formatDate(f.submitted_at)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle2 className="size-3.5" />
                    {f.internal_stage?.replace('_', ' ') ?? f.filing_state.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">No completed scans yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
