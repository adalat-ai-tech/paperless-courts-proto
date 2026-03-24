import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { routes } from '@/lib/routes';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function DefectCureCaseEditPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const filing = useAppStore(s => s.filings.find(f => f.id === caseId));
  const updateFiling = useAppStore(s => s.updateFiling);

  const [parties, setParties] = useState(() => filing?.parties.map(p => ({ ...p })) ?? []);

  if (!filing) return <div className="p-5 text-gray-400">Case not found</div>;

  function updateParty(index: number, field: 'name' | 'address', value: string) {
    setParties(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  function handleSave() {
    updateFiling(filing!.id, { parties });
    toast.success('Case details updated');
    navigate(routes.defectCureCase(filing!.id));
  }

  return (
    <div className="p-5 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Edit Case — {filing.filing_number ?? filing.id}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Parties</h2>
        {parties.map((party, i) => (
          <div key={i} className="mb-5 last:mb-0">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2 capitalize">{party.party_type}</div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={party.name}
                  onChange={e => updateParty(i, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  value={party.address ?? ''}
                  onChange={e => updateParty(i, 'address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
