import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList,
  FileStack, FilePlus, ScrollText, Search, Settings, Users, LayoutDashboard,
  ScanLine, Wrench, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Actions, Stages } from '@/lib/constants';
import { routes } from '@/lib/routes';

function NavItem({
  icon: Icon, label, href, collapsed, onNavigate, exact, also,
}: {
  icon: LucideIcon; label: string; href: string; collapsed: boolean;
  onNavigate?: () => void; exact?: boolean; also?: string[];
}) {
  const location = useLocation();
  const isActive =
    (exact ? location.pathname === href : location.pathname.startsWith(href)) ||
    (also?.some(p => location.pathname.startsWith(p)) ?? false);

  return (
    <div className="relative group/item">
      <Link
        to={href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors w-full',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
      {collapsed && (
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
          {label}
        </span>
      )}
    </div>
  );
}

function NavSection({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      {!collapsed && (
        <div className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

interface AppSidebarProps {
  onNavigate?: () => void;
  variant?: 'default' | 'drawer';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ onNavigate, variant = 'default', collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const { canPerform, canAccess } = useAuth();
  const isCollapsed = variant !== 'drawer' && collapsed;

  return (
    <aside
      className={cn(
        'h-full bg-white flex flex-col shrink-0 transition-[width] duration-200 overflow-hidden',
        variant === 'default' && 'border-r border-gray-200',
        isCollapsed ? 'w-14 px-2 py-5 items-center' : 'w-[220px] p-5'
      )}
    >
      {/* Logo */}
      <Link to="/" onClick={onNavigate} className={cn('flex items-center mb-6', isCollapsed && 'justify-center')}>
        {isCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">OHC</span>
          </div>
        ) : (
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">Orissa High Court</div>
            <div className="text-[10px] text-gray-400 mt-0.5">E-Filing System</div>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-3 flex-1 overflow-y-auto w-full">
        {/* Overview */}
        <NavSection label="Overview" collapsed={isCollapsed}>
          {canPerform(Actions.SYSTEM_VIEW_AUDIT) && (
            <NavItem icon={LayoutDashboard} label="Dashboard" href={routes.dashboard()} collapsed={isCollapsed} onNavigate={onNavigate} />
          )}
          {canPerform(Actions.ANY_VIEW_METADATA) && (
            <NavItem icon={FileStack} label="Case Register" href={routes.caseFiles()} collapsed={isCollapsed} onNavigate={onNavigate} />
          )}
        </NavSection>

        {/* Scanning */}
        {canAccess(Stages.SCANNING) && (
          <NavSection label="Scanning" collapsed={isCollapsed}>
            <NavItem icon={ScanLine} label="Case Lookup" href={routes.scanningCaseLookup()} collapsed={isCollapsed} onNavigate={onNavigate} />
            <NavItem icon={CheckCircle2} label="Completed" href={routes.scanningCompleted()} collapsed={isCollapsed} onNavigate={onNavigate} />
          </NavSection>
        )}

        {/* Filing */}
        {canAccess(Stages.FILING) && (
          <NavSection label="Filing Desk" collapsed={isCollapsed}>
            <NavItem icon={FilePlus} label="Filings" href={routes.filingDeskQueue()} collapsed={isCollapsed} onNavigate={onNavigate} />
            <NavItem icon={BookOpen} label="Case Lookup" href={routes.filingDeskCaseLookup()} collapsed={isCollapsed} onNavigate={onNavigate} />
          </NavSection>
        )}

        {/* Preparation */}
        {canAccess(Stages.PREPARATION) && (
          <NavSection label="Preparation" collapsed={isCollapsed}>
            <NavItem icon={ClipboardList} label="My Cases" href={routes.preparationQueue()} collapsed={isCollapsed} onNavigate={onNavigate} />
            <NavItem icon={CheckCircle2} label="Completed" href={routes.preparationCompleted()} collapsed={isCollapsed} onNavigate={onNavigate} />
          </NavSection>
        )}

        {/* Queues */}
        {(canAccess(Stages.SCRUTINY) || canAccess(Stages.DEFECT_CURE)) && (
          <NavSection label="Queues" collapsed={isCollapsed}>
            {canAccess(Stages.SCRUTINY) && (
              <NavItem icon={Search} label="Scrutiny" href={routes.scrutinyQueue()} collapsed={isCollapsed} onNavigate={onNavigate} />
            )}
            {canAccess(Stages.DEFECT_CURE) && (
              <NavItem icon={Wrench} label="Defect Cure" href={routes.defectCureQueue()} collapsed={isCollapsed} onNavigate={onNavigate} />
            )}
          </NavSection>
        )}

        {/* Admin */}
        {(canPerform(Actions.SYSTEM_MANAGE_STAFF) || canPerform(Actions.SYSTEM_VIEW_AUDIT) || canPerform(Actions.SYSTEM_MANAGE_COURT_CONFIG)) && (
          <NavSection label="Admin" collapsed={isCollapsed}>
            {canPerform(Actions.SYSTEM_MANAGE_STAFF) && (
              <>
                <NavItem icon={Users} label="Staff" href={routes.adminStaff()} collapsed={isCollapsed} onNavigate={onNavigate} />
                <NavItem icon={ShieldCheck} label="Roles" href={routes.adminRoles()} collapsed={isCollapsed} onNavigate={onNavigate} />
              </>
            )}
            {canPerform(Actions.SYSTEM_VIEW_AUDIT) && (
              <NavItem icon={ScrollText} label="Audit Log" href={routes.audit()} collapsed={isCollapsed} onNavigate={onNavigate} />
            )}
            {canPerform(Actions.SYSTEM_MANAGE_COURT_CONFIG) && (
              <NavItem icon={ClipboardList} label="Checklists" href={routes.adminChecklists()} collapsed={isCollapsed} onNavigate={onNavigate} />
            )}
            <NavItem icon={Settings} label="Settings" href={routes.adminSettings()} collapsed={isCollapsed} onNavigate={onNavigate} />
          </NavSection>
        )}
      </nav>

      {/* Collapse toggle */}
      {variant !== 'drawer' && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          className="mt-4 self-end p-1.5 rounded-md hover:bg-gray-100 text-gray-400"
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      )}
    </aside>
  );
}

