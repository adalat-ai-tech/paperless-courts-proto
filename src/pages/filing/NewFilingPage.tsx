import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useAuth } from '@/lib/auth';
import { routes } from '@/lib/routes';
import type { Filing } from '@/store/types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const CASE_CATEGORIES_PETITION = [
  'Writ Petition (Civil)',
  'Writ Petition (Criminal)',
  'Public Interest Litigation',
  'Writ Petition (Civil) – Tablet',
];
const CASE_CATEGORIES_APPEAL = [
  'Criminal Appeal',
  'Criminal Petition',
  'Civil Appeal',
  'First Appeal',
  'Second Appeal',
];

interface FormData {
  case_category: string;
  petitioner_name: string;
  petitioner_address: string;
  respondent_name: string;
  respondent_address: string;
  advocate_name: string;
  bar_enrollment: string;
  phone: string;
  email: string;
  has_pdf: boolean;
}

export default function NewFilingPage() {
  const [params] = useSearchParams();
  const type = params.get('type') === 'appeal' ? 'appeal' : 'petition';
  const categories = type === 'appeal' ? CASE_CATEGORIES_APPEAL : CASE_CATEGORIES_PETITION;

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [newId, setNewId] = useState('');
  const navigate = useNavigate();
  const addFiling = useAppStore(s => s.addFiling);
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    case_category: categories[0],
    petitioner_name: '',
    petitioner_address: '',
    respondent_name: '',
    respondent_address: '',
    advocate_name: '',
    bar_enrollment: '',
    phone: '',
    email: '',
    has_pdf: false,
  });

  function update(field: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    const num = Math.floor(Math.random() * 900) + 4700;
    const id = `D-${type === 'appeal' ? 'CRL(A)' : 'WP(C)'}/${String(num).padStart(4, '0')}/2026`;

    const filing: Filing = {
      id,
      filing_number: id,
      case_category: form.case_category,
      case_type: type,
      cis_state: 'filed',
      internal_stage: form.has_pdf ? 'preparation' : 'scanning',
      filing_state: form.has_pdf ? 'preparation' : 'scanning',
      parties: [
        { name: form.petitioner_name || 'Unnamed Petitioner', party_type: 'petitioner', address: form.petitioner_address },
        { name: form.respondent_name || 'State of Odisha', party_type: 'respondent', address: form.respondent_address },
      ],
      advocate: { name: form.advocate_name || 'Unknown Advocate', bar_enrollment: form.bar_enrollment, phone: form.phone, email: form.email || undefined },
      sections: [],
      defects: [],
      submitted_at: new Date().toISOString(),
    };

    addFiling(filing);
    setNewId(id);
    setDone(true);
  }

  if (done) {
    return (
      <div className="p-5 max-w-lg">
        <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
          <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Filing Submitted!</h2>
          <div className="font-mono text-lg font-bold text-blue-700 mb-2">{newId}</div>
          <p className="text-sm text-gray-500 mb-6">
            The case has been entered and routed to {form.has_pdf ? 'Preparation' : 'Scanning'}.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(routes.filingDeskQueue())} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Back to Queue
            </button>
            <button onClick={() => { setDone(false); setStep(1); setForm({ case_category: categories[0], petitioner_name: '', petitioner_address: '', respondent_name: '', respondent_address: '', advocate_name: '', bar_enrollment: '', phone: '', email: '', has_pdf: false }); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              New Filing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(routes.filingDeskQueue())} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Filing — {type === 'appeal' ? 'Appeal' : 'Petition'}</h1>
          <p className="text-xs text-gray-500">Step {step} of 5</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Case Classification</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Category</label>
                <select value={form.case_category} onChange={e => update('case_category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.has_pdf} onChange={e => update('has_pdf', e.target.checked)}
                    className="size-4 accent-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Physical PDF received</div>
                    <div className="text-xs text-gray-500">Check if advocate brought scanned documents</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Petitioner / Appellant</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.petitioner_name} onChange={e => update('petitioner_name', e.target.value)}
                  placeholder="e.g., Ramesh Kumar Panda"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={form.petitioner_address} onChange={e => update('petitioner_address', e.target.value)}
                  rows={2} placeholder="Village, District, State"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Respondent / Opposite Party</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Organisation *</label>
                <input value={form.respondent_name} onChange={e => update('respondent_name', e.target.value)}
                  placeholder="e.g., State of Odisha & Ors."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={form.respondent_address} onChange={e => update('respondent_address', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Advocate Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.advocate_name} onChange={e => update('advocate_name', e.target.value)}
                  placeholder="Adv. Full Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bar Enrollment No. *</label>
                <input value={form.bar_enrollment} onChange={e => update('bar_enrollment', e.target.value)}
                  placeholder="OHC/XXXX/YYYY"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="9XXXXXXXXX" type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="advocate@example.com" type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Review & Submit</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Case Category', form.case_category],
                ['Petitioner', form.petitioner_name || '(blank)'],
                ['Respondent', form.respondent_name || '(blank)'],
                ['Advocate', form.advocate_name || '(blank)'],
                ['Bar No.', form.bar_enrollment || '(blank)'],
                ['Mobile', form.phone || '(blank)'],
                ['Route to', form.has_pdf ? 'Preparation (PDF received)' : 'Scanning (physical documents)'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="text-gray-500 w-28 shrink-0">{label}</dt>
                  <dd className="text-gray-900 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              A diary number will be generated upon submission.
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(routes.filingDeskQueue())}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Submit Filing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
