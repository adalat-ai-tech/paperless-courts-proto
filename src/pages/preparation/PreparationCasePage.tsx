import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, FileText, Plus, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentSection } from '@/store/types';

function SectionRow({ sec, onMoveUp, onMoveDown }: { sec: DocumentSection; onMoveUp: () => void; onMoveDown: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
      <GripVertical className="size-4 text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900">{sec.title}</div>
        <div className="text-xs text-gray-400">{sec.pages} pages</div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onMoveUp} className="p-1 hover:bg-gray-200 rounded"><ChevronUp className="size-3.5" /></button>
        <button onClick={onMoveDown} className="p-1 hover:bg-gray-200 rounded"><ChevronDown className="size-3.5" /></button>
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{sec.order}</span>
    </div>
  );
}

const DEFAULT_SECTIONS: DocumentSection[] = [
  { id: 'ds1', title: 'Docket', pages: 2, order: 1 },
  { id: 'ds2', title: 'Index', pages: 1, order: 2 },
  { id: 'ds3', title: 'Main Petition', pages: 10, order: 3 },
  { id: 'ds4', title: 'Annexure A', pages: 4, order: 4 },
];

export default function PreparationCasePage() {
  const { caseId: _caseId } = useParams();
  const caseId = _caseId ? decodeURIComponent(_caseId) : undefined;
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));
  const updateFiling = useAppStore(s => s.updateFiling);

  const [sections, setSections] = useState<DocumentSection[]>(
    filing?.sections.length ? [...filing.sections] : DEFAULT_SECTIONS
  );
  const [newSection, setNewSection] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!filing) return <div className="p-5 text-gray-400">Case not found</div>;

  function moveSection(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const arr = [...sections];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    const reordered = arr.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(reordered);
  }

  function addSection() {
    if (!newSection.trim()) return;
    const sec: DocumentSection = {
      id: `sec-${Date.now()}`,
      title: newSection.trim(),
      pages: 1,
      order: sections.length + 1,
    };
    setSections(s => [...s, sec]);
    setNewSection('');
    setShowAddSection(false);
  }

  function handleSubmitToScrutiny() {
    updateFiling(filing!.id, { internal_stage: 'scrutiny', filing_state: 'scrutiny', sections });
    toast.success('Case submitted to Scrutiny');
    navigate(routes.preparationQueue());
  }

  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  const respondent = filing.parties.find(p => p.party_type === 'respondent')?.name ?? '—';

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
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <CheckCircle2 className="size-4" />
          Submit to Scrutiny
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* PDF Viewer placeholder */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FileText className="size-16 mx-auto mb-3 opacity-30" />
            <div className="text-sm">PDF Viewer</div>
            <div className="text-xs mt-1 opacity-60">{filing.filing_number ?? filing.id}</div>
          </div>
        </div>

        {/* Sections sidebar */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Sections</span>
            <button
              onClick={() => setShowAddSection(s => !s)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {showAddSection && (
            <div className="px-3 py-2 border-b border-gray-100 bg-blue-50">
              <input
                autoFocus
                value={newSection}
                onChange={e => setNewSection(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSection()}
                placeholder="Section name…"
                className="w-full text-sm border border-blue-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white mb-1"
              />
              <div className="flex gap-1">
                <button onClick={addSection} className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
                <button onClick={() => setShowAddSection(false)} className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {sections.map((sec, i) => (
              <SectionRow
                key={sec.id}
                sec={sec}
                onMoveUp={() => moveSection(i, -1)}
                onMoveDown={() => moveSection(i, 1)}
              />
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {sections.length} sections · {sections.reduce((a, s) => a + s.pages, 0)} pages
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Submit to Scrutiny?</h3>
            <p className="text-sm text-gray-500 mb-5">
              The case file with {sections.length} sections will be sent to the Scrutiny queue.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { setConfirming(false); handleSubmitToScrutiny(); }} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
