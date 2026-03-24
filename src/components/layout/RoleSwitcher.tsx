import { useState } from 'react';
import { ChevronUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { RoleName } from '@/store';
import { getDefaultRoute } from '@/lib/auth';
import { cn } from '@/lib/utils';

const ROLES: { value: RoleName; label: string }[] = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'registrar', label: 'Registrar / Admin' },
  { value: 'filing_officer', label: 'Filing Officer' },
  { value: 'preparation_officer', label: 'Preparation Officer' },
  { value: 'scrutiny_officer', label: 'Scrutiny Officer' },
  { value: 'defect_officer', label: 'Defect Cure Officer' },
  { value: 'scanning_officer', label: 'Scanning Officer' },
];

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const currentUser = useAppStore(s => s.currentUser);
  const login = useAppStore(s => s.login);
  const navigate = useNavigate();

  function switchRole(role: RoleName) {
    login(role);
    setOpen(false);
    navigate(getDefaultRoute(role));
  }

  const currentLabel = ROLES.find(r => r.value === currentUser?.role)?.label ?? 'Unknown';

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {open && (
        <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-52">
          <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Switch Role (Demo)
          </div>
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => switchRole(r.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                currentUser?.role === r.value
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <div className={cn('size-2 rounded-full shrink-0', currentUser?.role === r.value ? 'bg-blue-600' : 'bg-gray-300')} />
              {r.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        <User className="size-3.5" />
        <span>{currentLabel}</span>
        <ChevronUp className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
    </div>
  );
}
