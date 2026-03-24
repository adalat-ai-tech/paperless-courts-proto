import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Search, Menu, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { prettifyRole } from '@/lib/utils';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200/60 flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-md" aria-label="Open menu">
            <Menu className="size-5 text-gray-600" />
          </button>
        )}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 w-[280px] lg:w-[380px]">
          <Search className="size-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400">Search cases, filings…</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <span className="hidden lg:block text-sm text-gray-500 mr-1">24 Mar 2026</span>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell className="size-4 text-gray-500" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <HelpCircle className="size-4 text-gray-500" />
        </button>
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg"
            >
              <div className="size-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-gray-900 leading-tight max-w-[120px] truncate">{user.name}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{prettifyRole(user.role)}</div>
              </div>
              <ChevronDown className="hidden sm:block size-3 text-gray-400" />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <div className="font-semibold text-sm text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{prettifyRole(user.role)}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/my-permissions'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ShieldCheck className="size-4 text-gray-400" /> My Permissions
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
