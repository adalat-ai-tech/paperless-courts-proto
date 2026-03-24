import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { cn, formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DefectCureCasePage() {
  const { caseId: _caseId } = useParams();
  const caseId = _caseId ? decodeURIComponent(_caseId) : undefined;
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));
  const resolveDefect = useAppStore(s => s.resolveDefect);
  const updateFiling = useAppStore(s => s.updateFiling);

  const [confirming, setConfirming] = useState<'scrutiny' | 'return' | 'reject' | null>(null);

  if (!filing) return <div className="p-5 text-gray-400">Case not found</div>;

  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  const respondent = filing.parties.find(p => p.party_type === 'respondent')?.name ?? '—';
  const allResolved = filing.defects.every(d => d.resolved);
  const day = filing.defect_cure_day ?? 1;
  const urgent = day >= 4;

  function handleOutcome(outcome: 'scrutiny' | 'return' | 'reject') {
    if (outcome === 'scrutiny') {
      updateFiling(filing!.id, { internal_stage: 'scrutiny', filing_state: 'scrutiny', defect_cure_day: undefined });
      toast.success('Case sent back to Scrutiny');
    } else if (outcome === 'return') {
      updateFiling(filing!.id, { filing_state: 'waiting_advocate', internal_stage: 'defect_cure' });
      toast.info('Case returned to advocate for re-submission');
    } else {
      updateFiling(filing!.id, { internal_stage: null, filing_state: 'rejected' });
      toast.error('Filing rejected');
    }
    navigate(routes.defectCureQueue());
  }

  return (
    <div className="p-5 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold font-mono text-gray-900">{filing.filing_number ?? filing.id}</h1>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', urgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
              Day {day}/5
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{petitioner} vs. {respondent}</div>
        </div>
      </div>

      {/* Defect cure deadline */}
      <div className={cn('rounded-xl border p-4 mb-4', urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn('size-4 shrink-0', urgent ? 'text-red-600' : 'text-amber-600')} />
          <div>
            <div className={cn('text-sm font-semibold', urgent ? 'text-red-800' : 'text-amber-800')}>
              Defect Cure Period — Day {day} of 5
            </div>
            <div className="text-xs text-gray-600 mt-0.5">Deadline: {formatDate(filing.defect_cure_deadline)}</div>
          </div>
        </div>
      </div>

      {/* Defects */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">
            Defects ({filing.defects.filter(d => !d.resolved).length} unresolved)
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filing.defects.map(defect => (
            <div key={defect.id} className="flex items-start gap-3 px-4 py-3">
              <button
                onClick={() => !defect.resolved && resolveDefect(filing.id, defect.id)}
                className={cn('mt-0.5 shrink-0 transition-colors', defect.resolved ? 'cursor-default' : 'hover:text-green-600')}
              >
                {defect.resolved
                  ? <CheckCircle2 className="size-5 text-green-500" />
                  : <div className="size-5 rounded-full border-2 border-gray-300 hover:border-green-400 transition-colors" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-gray-700">{defect.code}</span>
                  <span className={cn('text-sm', defect.resolved ? 'line-through text-gray-400' : 'text-gray-800')}>
                    {defect.description}
                  </span>
                </div>
                {defect.resolved && <div className="text-xs text-green-600 mt-0.5">Resolved</div>}
              </div>
            </div>
          ))}
          {filing.defects.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">No defects recorded</div>
          )}
        </div>
      </div>

      {/* Outcome buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Outcome</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setConfirming('scrutiny')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
          >
            <CheckCircle2 className="size-4" />
            Send to Scrutiny
          </button>
          <button
            onClick={() => setConfirming('return')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors"
          >
            <RotateCcw className="size-4" />
            Return to Advocate
          </button>
          <button
            onClick={() => setConfirming('reject')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
          >
            <XCircle className="size-4" />
            Reject
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {confirming === 'scrutiny' ? 'Send to Scrutiny?' : confirming === 'return' ? 'Return to Advocate?' : 'Reject Filing?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {confirming === 'scrutiny' ? `${allResolved ? 'All defects resolved.' : 'Note: some defects unresolved.'} Case will be sent for re-scrutiny.` :
               confirming === 'return' ? 'Case will be marked as waiting for advocate re-submission.' :
               'This action is final. The filing will be permanently rejected.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => { const c = confirming; setConfirming(null); handleOutcome(c); }}
                className={cn('flex-1 px-4 py-2 text-sm rounded-lg font-medium text-white',
                  confirming === 'scrutiny' ? 'bg-green-600 hover:bg-green-700' :
                  confirming === 'return' ? 'bg-orange-500 hover:bg-orange-600' :
                  'bg-red-600 hover:bg-red-700'
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
