import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FilingCasePage() {
  const { caseId: _caseId } = useParams();
  const caseId = _caseId ? decodeURIComponent(_caseId) : undefined;
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));
  const updateFiling = useAppStore(s => s.updateFiling);
  const { user } = useAppStore(s => ({ user: s.currentUser }));

  if (!filing) {
    return <div className="p-5 text-gray-400">Case not found</div>;
  }

  function handleSubmit() {
    if (!filing) return;
    updateFiling(filing.id, { internal_stage: 'preparation', filing_state: 'preparation' });
    toast.success('Case submitted to Preparation queue');
    navigate(routes.filingDeskQueue());
  }

  const petitioner = filing.parties.find(p => p.party_type === 'petitioner');
  const respondent = filing.parties.find(p => p.party_type === 'respondent');

  return (
    <div className="p-5 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold font-mono text-gray-900">{filing.filing_number ?? filing.id}</h1>
          <p className="text-xs text-gray-500">{filing.case_category} — Filed {formatDate(filing.submitted_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="size-4 text-blue-600" /> Parties
          </h2>
          {petitioner && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Petitioner</div>
              <div className="text-sm font-medium text-gray-900">{petitioner.name}</div>
              {petitioner.address && <div className="text-xs text-gray-500">{petitioner.address}</div>}
            </div>
          )}
          {respondent && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Respondent</div>
              <div className="text-sm font-medium text-gray-900">{respondent.name}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="size-4 text-indigo-600" /> Advocate
          </h2>
          <div className="text-sm font-medium text-gray-900">{filing.advocate.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{filing.advocate.bar_enrollment}</div>
          <div className="text-xs text-gray-500">{filing.advocate.phone}</div>
          {filing.advocate.email && <div className="text-xs text-gray-500">{filing.advocate.email}</div>}
        </div>
      </div>

      {filing.sections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Sections ({filing.sections.length})</h2>
          <div className="space-y-1.5">
            {filing.sections.map(s => (
              <div key={s.id} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-800">{s.order}. {s.title}</span>
                <span className="text-xs text-gray-500">{s.pages} pg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filing.filing_state === 'draft' && (
        <div className="flex justify-end">
          <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            <CheckCircle2 className="size-4" />
            Submit to Preparation
          </button>
        </div>
      )}
    </div>
  );
}
