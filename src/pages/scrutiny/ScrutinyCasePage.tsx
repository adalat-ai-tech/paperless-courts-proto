import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Defect } from '@/store/types';

type Decision = 'approve' | 'defective' | 'reject' | null;

export default function ScrutinyCasePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));
  const checklist = useAppStore(s => s.checklist);
  const updateFiling = useAppStore(s => s.updateFiling);
  const addDefect = useAppStore(s => s.addDefect);
  const addAuditEntry = useAppStore(s => s.addAuditEntry);

  const [decision, setDecision] = useState<Decision>(null);
  const [selectedDefects, setSelectedDefects] = useState<Set<string>>(new Set());
  const [customDefect, setCustomDefect] = useState('');
  const [showDefectPicker, setShowDefectPicker] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!filing) return <div className="p-5 text-gray-400">Case not found</div>;

  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  const respondent = filing.parties.find(p => p.party_type === 'respondent')?.name ?? '—';

  function toggleDefect(code: string) {
    setSelectedDefects(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function handleDecision() {
    if (!decision) return;

    if (decision === 'approve') {
      const cnr = filing!.cnr || `ORHC01-${String(Math.floor(Math.random() * 9000) + 1000).padStart(6, '0')}-2026`;
      updateFiling(filing!.id, {
        internal_stage: null,
        filing_state: 'registered_case',
        cnr,
        registered_at: new Date().toISOString(),
      });
      addAuditEntry({ id: `a${Date.now()}`, actor: 'Current User', actor_role: 'scrutiny_officer', action: 'SCRUTINY_APPROVED', resource_type: 'filing', resource_id: filing!.id, description: `Filing approved for registration. CNR: ${cnr}`, timestamp: new Date().toISOString() });
      toast.success(`Case approved! CNR: ${cnr}`);
      navigate(routes.scrutinyQueue());

    } else if (decision === 'defective') {
      // Add selected defects
      selectedDefects.forEach(code => {
        const item = checklist.find(c => c.code === code);
        if (item) {
          addDefect(filing!.id, { id: `d-${Date.now()}-${code}`, code, description: item.description, resolved: false });
        }
      });
      if (customDefect.trim()) {
        addDefect(filing!.id, { id: `d-${Date.now()}-custom`, code: 'D-CUSTOM', description: customDefect.trim(), resolved: false });
      }
      updateFiling(filing!.id, { internal_stage: 'defect_cure', filing_state: 'defects_noted', defect_cure_day: 1, defect_cure_deadline: new Date(Date.now() + 5 * 86400000).toISOString() });
      toast.success('Defects noted. SMS sent to advocate.');
      navigate(routes.scrutinyQueue());

    } else {
      updateFiling(filing!.id, { internal_stage: null, filing_state: 'rejected' });
      toast.error('Filing rejected.');
      navigate(routes.scrutinyQueue());
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-mono font-semibold text-gray-900">{filing.filing_number ?? filing.id}</div>
          <div className="text-xs text-gray-500 truncate">{petitioner} vs. {respondent}</div>
        </div>
        <button
          onClick={() => decision && setConfirming(true)}
          disabled={!decision}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            !decision ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            decision === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' :
            decision === 'defective' ? 'bg-amber-600 text-white hover:bg-amber-700' :
            'bg-red-600 text-white hover:bg-red-700'
          )}
        >
          {!decision ? 'Select Decision' :
           decision === 'approve' ? 'Approve & Register' :
           decision === 'defective' ? 'Note Defects' : 'Reject'}
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* PDF viewer */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FileText className="size-16 mx-auto mb-3 opacity-30" />
            <div className="text-sm">PDF Viewer</div>
            <div className="text-xs mt-1 opacity-60">{filing.filing_number ?? filing.id}</div>
            {filing.sections.length > 0 && (
              <div className="mt-2 text-xs opacity-50">{filing.sections.length} sections · {filing.sections.reduce((a, s) => a + s.pages, 0)} pages</div>
            )}
          </div>
        </div>

        {/* Scrutiny panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          {/* Decision buttons */}
          <div className="p-4 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Decision</div>
            <div className="flex flex-col gap-2">
              {([
                { key: 'approve', label: 'Approve', icon: CheckCircle2, cls: 'border-green-200 bg-green-50 text-green-800', activeCls: 'border-green-500 bg-green-100' },
                { key: 'defective', label: 'Defective', icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-800', activeCls: 'border-amber-500 bg-amber-100' },
                { key: 'reject', label: 'Reject', icon: XCircle, cls: 'border-red-200 bg-red-50 text-red-800', activeCls: 'border-red-500 bg-red-100' },
              ] as const).map(({ key, label, icon: Icon, cls, activeCls }) => (
                <button
                  key={key}
                  onClick={() => setDecision(d => d === key ? null : key)}
                  className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                    decision === key ? activeCls : cls
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Defect checklist */}
          {decision === 'defective' && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase">Select Defects</div>
                <button onClick={() => setShowDefectPicker(s => !s)} className="text-xs text-blue-600 hover:text-blue-800">
                  {showDefectPicker ? 'Hide' : 'Show All'}
                </button>
              </div>
              <div className={cn('space-y-1 overflow-y-auto transition-all', showDefectPicker ? 'max-h-56' : 'max-h-28')}>
                {checklist.filter(c => c.active).map(item => (
                  <label key={item.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                    <input
                      type="checkbox"
                      checked={selectedDefects.has(item.code)}
                      onChange={() => toggleDefect(item.code)}
                      className="mt-0.5 accent-amber-600"
                    />
                    <div>
                      <span className="text-xs font-mono font-semibold text-gray-600">{item.code}</span>
                      <span className="text-xs text-gray-700 ml-1">{item.description}</span>
                    </div>
                  </label>
                ))}
              </div>

              {selectedDefects.size > 0 && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                  {selectedDefects.size} defect{selectedDefects.size !== 1 ? 's' : ''} selected
                </div>
              )}

              <div className="mt-3">
                <div className="flex items-center gap-1 mb-1">
                  <Plus className="size-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Custom defect</span>
                </div>
                <input
                  value={customDefect}
                  onChange={e => setCustomDefect(e.target.value)}
                  placeholder="Describe additional defect…"
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          {/* Sections TOC */}
          {filing.sections.length > 0 && (
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Case File</div>
              <div className="space-y-1">
                {filing.sections.map(sec => (
                  <div key={sec.id} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-700">{sec.order}. {sec.title}</span>
                    <span className="text-gray-400">{sec.pages}p</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {decision === 'approve' ? 'Approve for Registration?' :
               decision === 'defective' ? `Note ${selectedDefects.size + (customDefect ? 1 : 0)} Defect(s)?` :
               'Reject Filing?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {decision === 'approve' ? 'A CNR will be generated and the case will be marked as registered.' :
               decision === 'defective' ? 'SMS will be sent to the advocate with the defect list. Cure period: 5 days.' :
               'This action is final. The filing will be marked rejected.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => { setConfirming(false); handleDecision(); }}
                className={cn('flex-1 px-4 py-2 text-sm rounded-lg font-medium text-white',
                  decision === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  decision === 'defective' ? 'bg-amber-600 hover:bg-amber-700' :
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
