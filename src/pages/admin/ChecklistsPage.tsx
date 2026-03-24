import { useState } from 'react';
import { useAppStore } from '@/store';
import type { ChecklistItem } from '@/store/types';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Signature', 'Documents', 'Affidavit', 'Index', 'Court Fee', 'Parties', 'Copies', 'Pleadings', 'Jurisdiction', 'Limitation', 'Procedural'];

export default function ChecklistsPage() {
  const checklist = useAppStore(s => s.checklist);
  const addChecklistItem = useAppStore(s => s.addChecklistItem);
  const updateChecklistItem = useAppStore(s => s.updateChecklistItem);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', category: 'Documents' });
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...CATEGORIES];
  const filtered = filter === 'all' ? checklist : checklist.filter(c => c.category === filter);

  function handleAdd() {
    if (!form.code.trim() || !form.description.trim()) {
      toast.error('Code and description required');
      return;
    }
    const item: ChecklistItem = {
      id: `c${Date.now()}`,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      category: form.category,
      active: true,
    };
    addChecklistItem(item);
    setForm({ code: '', description: '', category: 'Documents' });
    setShowAdd(false);
    toast.success(`Checklist item ${item.code} added`);
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Defect Checklists</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="size-4" />
          Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat === 'all' ? `All (${checklist.length})` : cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-700">{item.code}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { updateChecklistItem(item.id, { active: !item.active }); toast.success(`${item.code} ${item.active ? 'disabled' : 'enabled'}`); }}
                    className={`transition-colors ${item.active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {item.active ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add dialog */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add Checklist Item</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded"><X className="size-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Defect Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))} placeholder="e.g., D-32"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
