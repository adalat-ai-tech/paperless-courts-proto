import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Filing } from '@/store/types';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';

const STAGES = [
  { key: 'filing', label: 'Filing Desk', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'scanning', label: 'Scanning', textColor: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { key: 'preparation', label: 'Preparation', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'scrutiny', label: 'Scrutiny', textColor: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'defect_cure', label: 'Defect Cure', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  { key: 'registered', label: 'Registered', textColor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
] as const;

function getStageCases(filings: Filing[], stage: string): Filing[] {
  if (stage === 'registered') return filings.filter(f => f.filing_state === 'registered_case');
  if (stage === 'filing') return filings.filter(f => f.filing_state === 'draft');
  return filings.filter(f => f.internal_stage === stage);
}

function CaseCard({ filing }: { filing: Filing }) {
  const navigate = useNavigate();
  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  const id = filing.filing_number ?? filing.id;

  return (
    <button
      onClick={() => navigate(routes.caseFile(filing.id))}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all text-xs group"
    >
      <div className="flex items-start justify-between gap-1 mb-0.5">
        <span className="font-mono font-semibold text-gray-800 group-hover:text-blue-700 leading-tight break-all">{id}</span>
        {filing.defect_cure_day && (
          <span className={`shrink-0 px-1.5 py-0.5 rounded-full font-semibold text-[10px] ${filing.defect_cure_day >= 4 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            D{filing.defect_cure_day}
          </span>
        )}
      </div>
      <div className="text-gray-500 truncate">{petitioner}</div>
    </button>
  );
}

export default function DashboardPage() {
  const filings = useAppStore(s => s.filings);
  const auditLog = useAppStore(s => s.auditLog);
  const settings = useAppStore(s => s.settings);

  const registeredBase = 47;
  const registeredTotal = filings.filter(f => f.filing_state === 'registered_case').length + registeredBase;

  return (
    <div className="p-5 min-h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{settings.court_name} — live case flow</p>
        </div>
        <div className="flex gap-6">
          {[
            { label: 'Active', value: filings.filter(f => f.internal_stage !== null).length, color: 'text-blue-700' },
            { label: 'Registered', value: registeredTotal, color: 'text-green-700' },
            { label: 'Defective', value: filings.filter(f => f.defect_cure_day).length, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {STAGES.map(stage => {
          const cases = getStageCases(filings, stage.key);
          const count = stage.key === 'registered' ? registeredTotal : cases.length;

          return (
            <div key={stage.key} className={`rounded-xl border ${stage.border} ${stage.bg} p-3 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${stage.textColor}`}>{stage.label}</span>
                <span className="text-xl font-bold text-gray-900">{count}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cases.slice(0, 4).map(f => <CaseCard key={f.id} filing={f} />)}
                {stage.key === 'registered' && registeredBase > 0 && (
                  <div className="text-[10px] text-gray-400 text-center py-0.5">+{registeredBase} archived</div>
                )}
                {cases.length === 0 && stage.key !== 'registered' && (
                  <div className="text-[11px] text-gray-400 text-center py-3">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Defect deadlines */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Defect Cure Deadlines</h3>
          <div className="space-y-2">
            {filings.filter(f => f.defect_cure_day).map(f => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <button
                  onClick={() => useAppStore.getState().filings.find(x => x.id === f.id)}
                  className="font-mono text-xs text-gray-700 hover:text-blue-600 truncate max-w-[140px]"
                >
                  {f.filing_number ?? f.id}
                </button>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(f.defect_cure_day ?? 0) >= 4 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  Day {f.defect_cure_day}/5
                </span>
              </div>
            ))}
            {filings.filter(f => f.defect_cure_day).length === 0 && (
              <p className="text-xs text-gray-400">No active deadlines</p>
            )}
          </div>
        </div>

        {/* Stage distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Stage Distribution</h3>
          <div className="space-y-2">
            {STAGES.map(stage => {
              const c = stage.key === 'registered' ? registeredTotal : getStageCases(filings, stage.key).length;
              const max = registeredTotal;
              return (
                <div key={stage.key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-24 shrink-0">{stage.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${max ? (c / max) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-5 text-right">{c}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {auditLog.slice(0, 6).map(entry => (
              <div key={entry.id} className="text-xs border-b border-gray-50 pb-1.5 last:border-0">
                <div className="font-medium text-gray-800">{entry.action.replace(/_/g, ' ')}</div>
                <div className="text-gray-500 truncate">{entry.description}</div>
                <div className="text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
