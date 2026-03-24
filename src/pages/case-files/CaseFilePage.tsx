import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, FileText, User, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

export default function CaseFilePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));

  if (!filing) {
    return (
      <div className="p-5">
        <div className="text-center py-16 text-gray-400">Case not found</div>
      </div>
    );
  }

  const stateInfo = STATE_LABELS[filing.filing_state] ?? { label: filing.filing_state, cls: 'bg-gray-100 text-gray-600' };
  const petitioner = filing.parties.find(p => p.party_type === 'petitioner');
  const respondent = filing.parties.find(p => p.party_type === 'respondent');
  const totalPages = filing.sections.reduce((sum, s) => sum + s.pages, 0);

  return (
    <div className="p-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold font-mono text-gray-900">{filing.filing_number ?? filing.id}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stateInfo.cls}`}>{stateInfo.label}</span>
          </div>
          {filing.cnr && <div className="text-xs text-gray-500 font-mono mt-0.5">CNR: {filing.cnr}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Case info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            Case Details
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Category</dt>
              <dd className="text-gray-900 font-medium">{filing.case_category}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Type</dt>
              <dd className="text-gray-900 capitalize">{filing.case_type}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Stage</dt>
              <dd className="text-gray-900 capitalize">{filing.internal_stage?.replace('_', ' ') ?? 'Completed'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Filed On</dt>
              <dd className="text-gray-900">{formatDate(filing.submitted_at)}</dd>
            </div>
            {filing.registered_at && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-28 shrink-0">Registered</dt>
                <dd className="text-gray-900">{formatDateTime(filing.registered_at)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Parties */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="size-4 text-indigo-600" />
            Parties
          </h2>
          {petitioner && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Petitioner</div>
              <div className="text-sm font-medium text-gray-900">{petitioner.name}</div>
              {petitioner.address && <div className="text-xs text-gray-500 mt-0.5">{petitioner.address}</div>}
            </div>
          )}
          {respondent && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Respondent</div>
              <div className="text-sm font-medium text-gray-900">{respondent.name}</div>
              {respondent.address && <div className="text-xs text-gray-500 mt-0.5">{respondent.address}</div>}
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Advocate</div>
            <div className="text-sm font-medium text-gray-900">{filing.advocate.name}</div>
            <div className="text-xs text-gray-500">{filing.advocate.bar_enrollment}</div>
            <div className="text-xs text-gray-500">{filing.advocate.phone}</div>
          </div>
        </div>
      </div>

      {/* Documents */}
      {filing.sections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="size-4 text-cyan-600" />
            Document Sections
            <span className="ml-auto text-xs text-gray-500">{totalPages} pages total</span>
          </h2>
          <div className="space-y-1.5">
            {filing.sections.map(sec => (
              <div key={sec.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{sec.order}.</span>
                  <span className="text-sm text-gray-800">{sec.title}</span>
                </div>
                <span className="text-xs text-gray-500">{sec.pages} pg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defects */}
      {filing.defects.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Defects ({filing.defects.length})
          </h2>
          <div className="space-y-2">
            {filing.defects.map(d => (
              <div key={d.id} className="flex items-center gap-3 py-1">
                {d.resolved ? (
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-red-500 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-mono font-semibold text-gray-700">{d.code}</span>
                  <span className="text-sm text-gray-700 ml-2">{d.description}</span>
                  {d.resolved && <span className="ml-2 text-xs text-green-600 font-medium">Resolved</span>}
                </div>
              </div>
            ))}
          </div>
          {filing.defect_cure_day && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
              Defect cure Day {filing.defect_cure_day} of 5 — Deadline: {formatDate(filing.defect_cure_deadline)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
