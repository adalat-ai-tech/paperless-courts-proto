import { useState } from 'react';
import { useAppStore } from '@/store';
import type { CourtSettings } from '@/store/types';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const settings = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);
  const [form, setForm] = useState<CourtSettings>({ ...settings });

  function update<K extends keyof CourtSettings>(key: K, value: CourtSettings[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSave() {
    updateSettings(form);
    toast.success('Settings saved');
  }

  return (
    <div className="p-5 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Court Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
            <input value={form.court_name} onChange={e => update('court_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
            <input value={form.court_short_name} onChange={e => update('court_short_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Number Prefix</label>
            <input value={form.case_number_prefix} onChange={e => update('case_number_prefix', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select value={form.timezone} onChange={e => update('timezone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Filing Workflow</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filing Timing Mode</label>
            <div className="flex gap-3">
              {(['strict', 'flexible'] as const).map(mode => (
                <label key={mode} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-colors ${form.filing_timing_mode === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" checked={form.filing_timing_mode === mode} onChange={() => update('filing_timing_mode', mode)} className="accent-blue-600" />
                  <div>
                    <div className="text-sm font-medium capitalize">{mode}</div>
                    <div className="text-xs text-gray-500">{mode === 'strict' ? 'Court hours enforced' : 'Any time accepted'}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Mode</label>
            <div className="flex flex-wrap gap-3">
              {(['manual', 'auto', 'conveyor'] as const).map(mode => (
                <label key={mode} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-colors ${form.assignment_mode === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" checked={form.assignment_mode === mode} onChange={() => update('assignment_mode', mode)} className="accent-blue-600" />
                  <div>
                    <div className="text-sm font-medium capitalize">{mode}</div>
                    <div className="text-xs text-gray-500">
                      {mode === 'manual' ? 'Supervisor assigns' : mode === 'auto' ? 'System assigns' : 'Self-service queue'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Defect Cure Days</label>
            <input
              type="number" min={1} max={30} value={form.defect_cure_days}
              onChange={e => update('defect_cure_days', Number(e.target.value))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">days</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Save className="size-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
