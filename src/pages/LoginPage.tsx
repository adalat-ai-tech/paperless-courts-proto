import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { RoleName } from '@/store';
import { getDefaultRoute } from '@/lib/auth';

const QUICK_LOGINS: { role: RoleName; label: string; desc: string; cls: string }[] = [
  { role: 'superadmin', label: 'Superadmin', desc: 'Full access — pipeline dashboard', cls: 'bg-purple-600 hover:bg-purple-700' },
  { role: 'registrar', label: 'Registrar / Admin', desc: 'Manage staff, settings, audit', cls: 'bg-indigo-600 hover:bg-indigo-700' },
  { role: 'filing_officer', label: 'Filing Officer', desc: 'Accept & submit new filings', cls: 'bg-blue-600 hover:bg-blue-700' },
  { role: 'preparation_officer', label: 'Preparation Officer', desc: 'Prepare case files for scrutiny', cls: 'bg-cyan-600 hover:bg-cyan-700' },
  { role: 'scrutiny_officer', label: 'Scrutiny Officer', desc: 'Review & approve filings', cls: 'bg-teal-600 hover:bg-teal-700' },
  { role: 'defect_officer', label: 'Defect Cure Officer', desc: 'Process defective filings', cls: 'bg-orange-600 hover:bg-orange-700' },
  { role: 'scanning_officer', label: 'Scanning Officer', desc: 'Scan physical documents', cls: 'bg-green-600 hover:bg-green-700' },
];

export default function LoginPage() {
  const login = useAppStore(s => s.login);
  const navigate = useNavigate();

  function handleLogin(role: RoleName) {
    login(role);
    navigate(getDefaultRoute(role));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">OHC</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Orissa High Court</h1>
          <p className="text-gray-500 text-sm mt-1">E-Filing Scrutiny System</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 text-center mb-4 font-medium uppercase tracking-wider">
            Demo — select a role to enter
          </p>
          <div className="flex flex-col gap-2">
            {QUICK_LOGINS.map(({ role, label, desc, cls }) => (
              <button
                key={role}
                onClick={() => handleLogin(role)}
                className={`${cls} text-white rounded-xl px-4 py-3 text-left transition-colors`}
              >
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs opacity-75 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
