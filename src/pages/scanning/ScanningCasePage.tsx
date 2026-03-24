import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { ArrowLeft, Upload, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanningCasePage() {
  const { id: _id } = useParams();
  const id = _id ? decodeURIComponent(_id) : undefined;
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === id));
  const updateFiling = useAppStore(s => s.updateFiling);

  const [uploaded, setUploaded] = useState(false);
  const [pages, setPages] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!filing) return <div className="p-5 text-gray-400">Case not found</div>;

  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  const respondent = filing.parties.find(p => p.party_type === 'respondent')?.name ?? '—';

  function handleSimulatedUpload() {
    const pageCount = Math.floor(Math.random() * 40) + 15;
    setPages(pageCount);
    setUploaded(true);
    toast.success(`PDF uploaded — ${pageCount} pages detected`);
  }

  function handleComplete() {
    updateFiling(filing!.id, {
      internal_stage: 'preparation',
      filing_state: 'preparation',
    });
    toast.success('Scanning complete. Case sent to Preparation.');
    navigate(routes.scanningCaseLookup());
  }

  return (
    <div className="p-5 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold font-mono text-gray-900">{filing.filing_number ?? filing.id}</h1>
          <div className="text-xs text-gray-500">{petitioner} vs. {respondent}</div>
        </div>
      </div>

      {/* Case info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Category</dt>
            <dd className="font-medium text-gray-900">{filing.case_category}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Advocate</dt>
            <dd className="font-medium text-gray-900">{filing.advocate.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Bar No.</dt>
            <dd className="text-gray-700">{filing.advocate.bar_enrollment}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Phone</dt>
            <dd className="text-gray-700">{filing.advocate.phone}</dd>
          </div>
        </dl>
      </div>

      {/* Upload area */}
      {!uploaded ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleSimulatedUpload(); }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={handleSimulatedUpload}
        >
          <Upload className="size-10 text-gray-400 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700 mb-1">Drop scanned PDF here</div>
          <div className="text-xs text-gray-400">or click to simulate upload</div>
          <div className="mt-4 text-xs text-gray-400">Accepts PDF · All pages will be extracted</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-green-200 p-6 text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="size-6 text-green-600" />
            <div className="font-semibold text-green-800">PDF Uploaded</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{pages}</div>
          <div className="text-sm text-gray-500 mb-4">pages extracted</div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: Math.min(pages, 8) }).map((_, i) => (
              <div key={i} className={`aspect-[3/4] rounded border flex items-center justify-center text-xs text-gray-400 ${i >= pages - 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                {i + 1}
              </div>
            ))}
            {pages > 8 && (
              <div className="aspect-[3/4] rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                +{pages - 8}
              </div>
            )}
          </div>
          {pages > 0 && <div className="text-xs text-yellow-600 mt-2">Last 3 pages highlighted as new</div>}
        </div>
      )}

      {uploaded && (
        <div className="flex justify-end">
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <CheckCircle2 className="size-4" />
            Complete Scanning
          </button>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Complete Scanning?</h3>
            <p className="text-sm text-gray-500 mb-5">
              {pages} pages will be uploaded. The case will be sent to Preparation queue.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setConfirming(false); handleComplete(); }} className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
