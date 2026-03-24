import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate, cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';

export default function DefectCureQueuePage() {
  const filings = useAppStore(s => s.filings);
  const cases = filings.filter(f => f.internal_stage === 'defect_cure');

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Defect Cure Queue</h1>
        <span className="text-sm text-gray-500">{cases.length} active</span>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Wrench className="size-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No cases in defect cure</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map(f => {
            const petitioner = f.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
            const respondent = f.parties.find(p => p.party_type === 'respondent')?.name ?? '—';
            const day = f.defect_cure_day ?? 1;
            const urgent = day >= 4;

            return (
              <div key={f.id} className={cn('bg-white rounded-xl border p-4 hover:shadow-sm transition-all', urgent ? 'border-red-200' : 'border-gray-200')}>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-mono text-sm font-semibold text-gray-900">{f.filing_number ?? f.id}</div>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', urgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                    Day {day}/5
                  </span>
                </div>
                <div className="text-sm text-gray-800 font-medium truncate">{petitioner}</div>
                <div className="text-xs text-gray-500 truncate mb-2">vs. {respondent}</div>

                <div className="space-y-1 mb-3">
                  {f.defects.slice(0, 2).map(d => (
                    <div key={d.id} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="font-mono font-semibold text-red-600">{d.code}</span>
                      <span className="truncate">{d.description}</span>
                    </div>
                  ))}
                  {f.defects.length > 2 && (
                    <div className="text-xs text-gray-400">+{f.defects.length - 2} more defects</div>
                  )}
                </div>

                {urgent && (
                  <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-3">
                    Deadline: {formatDate(f.defect_cure_deadline)}
                  </div>
                )}

                <Link
                  to={routes.defectCureCase(f.id)}
                  className="block text-center px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Process Defects
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
