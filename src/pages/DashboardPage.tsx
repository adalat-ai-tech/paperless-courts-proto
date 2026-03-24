import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Filing } from '@/store/types';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  FileText, CheckCircle2, AlertTriangle, XCircle,
  Clock, TrendingUp, Users, Activity, Wrench,
} from 'lucide-react';

const STAGE_CFG = [
  { key: 'filing',      label: 'Filing Desk',  textColor: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: '#3b82f6' },
  { key: 'scanning',    label: 'Scanning',      textColor: 'text-cyan-700',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   dot: '#06b6d4' },
  { key: 'preparation', label: 'Preparation',   textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: '#f97316' },
  { key: 'scrutiny',    label: 'Scrutiny',      textColor: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: '#6366f1' },
  { key: 'defect_cure', label: 'Defect Cure',   textColor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    dot: '#ef4444' },
  { key: 'registered',  label: 'Registered',    textColor: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  dot: '#22c55e' },
] as const;

const CATEGORY_COLORS = ['#3b82f6','#22c55e','#f97316','#8b5cf6','#06b6d4','#ec4899','#f59e0b'];
const ACTION_COLORS: Record<string, string> = {
  FILING_CREATED:     'bg-blue-100 text-blue-700',
  FILING_SUBMITTED:   'bg-blue-100 text-blue-700',
  SCANNING_COMPLETED: 'bg-cyan-100 text-cyan-700',
  SCANNING_STARTED:   'bg-cyan-100 text-cyan-700',
  PREPARATION_STARTED:'bg-orange-100 text-orange-700',
  PREPARATION_SUBMITTED:'bg-orange-100 text-orange-700',
  SCRUTINY_STARTED:   'bg-indigo-100 text-indigo-700',
  SCRUTINY_APPROVED:  'bg-green-100 text-green-700',
  DEFECTS_NOTED:      'bg-amber-100 text-amber-700',
  DEFECT_CURE_STARTED:'bg-red-100 text-red-700',
  SMS_SENT:           'bg-pink-100 text-pink-700',
  CASE_REGISTERED:    'bg-green-100 text-green-800',
  SCRUTINY_REJECTED:  'bg-red-100 text-red-700',
  STAFF_CREATED:      'bg-gray-100 text-gray-700',
  SETTINGS_UPDATED:   'bg-gray-100 text-gray-700',
  CHECKLIST_UPDATED:  'bg-gray-100 text-gray-700',
  LOGIN:              'bg-gray-100 text-gray-500',
};

function getStageCases(filings: Filing[], stage: string): Filing[] {
  if (stage === 'registered') return filings.filter(f => f.filing_state === 'registered_case');
  if (stage === 'filing')     return filings.filter(f => f.filing_state === 'draft');
  return filings.filter(f => f.internal_stage === stage);
}

/* ── Donut Chart ─────────────────────────────────────────────────────── */
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const R = 38; const CX = 50; const CY = 50;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const seg = { frac, dasharray: frac * circ, dashoffset: -offset * circ, color: d.color, i };
    offset += frac;
    return seg;
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0 -rotate-90">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="14" />
        {segments.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dasharray} ${circ}`}
            strokeDashoffset={s.dashoffset}
          />
        ))}
        <circle cx={CX} cy={CY} r={24} fill="white" />
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-gray-600 truncate max-w-[120px]" title={d.label}>{d.label}</span>
            <span className="ml-auto font-semibold text-gray-800 pl-2">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────────────────── */
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const H = 56;
  return (
    <div className="flex items-end gap-[3px] h-[72px]">
      {data.map(({ date, count }, i) => {
        const barH = count === 0 ? 3 : Math.max(6, (count / max) * H);
        const isWeekend = [0, 6].includes(new Date(date).getDay());
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
            {count > 0 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {count} filing{count !== 1 ? 's' : ''}
              </div>
            )}
            <div
              className={cn('w-full rounded-t transition-all', count > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-gray-100')}
              style={{ height: barH }}
            />
            {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
              <span className={cn('text-[8px] text-gray-400', isWeekend && 'text-gray-300')}>
                {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Pipeline Case Card ──────────────────────────────────────────────── */
function CaseCard({ filing }: { filing: Filing }) {
  const navigate = useNavigate();
  const petitioner = filing.parties.find(p => p.party_type === 'petitioner')?.name ?? '—';
  return (
    <button
      onClick={() => navigate(routes.caseFile(filing.id))}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all text-xs group"
    >
      <div className="flex items-start justify-between gap-1 mb-0.5">
        <span className="font-mono font-semibold text-gray-800 group-hover:text-blue-700 leading-tight break-all">
          {filing.filing_number ?? filing.id}
        </span>
        {filing.defect_cure_day != null && (
          <span className={cn('shrink-0 px-1.5 py-0.5 rounded-full font-semibold text-[10px]',
            filing.defect_cure_day >= 4 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
            D{filing.defect_cure_day}
          </span>
        )}
      </div>
      <div className="text-gray-500 truncate">{petitioner}</div>
    </button>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const filings  = useAppStore(s => s.filings);
  const auditLog = useAppStore(s => s.auditLog);
  const staff    = useAppStore(s => s.staff);
  const settings = useAppStore(s => s.settings);

  const REGISTERED_BASE = 47;
  const totalRegistered = filings.filter(f => f.filing_state === 'registered_case').length + REGISTERED_BASE;

  /* KPI derived values */
  const kpis = useMemo(() => {
    const active   = filings.filter(f => f.internal_stage !== null).length;
    const defective = filings.filter(f => f.defect_cure_day != null).length;
    const rejected  = filings.filter(f => f.filing_state === 'rejected').length;
    const totalPages = filings.reduce((s, f) => s + f.sections.reduce((p, sec) => p + sec.pages, 0), 0);
    // avg processing days for registered filings with both timestamps
    const registered = filings.filter(f => f.filing_state === 'registered_case' && f.registered_at && f.submitted_at);
    const avgDays = registered.length
      ? Math.round(registered.reduce((s, f) => {
          const diff = new Date(f.registered_at!).getTime() - new Date(f.submitted_at!).getTime();
          return s + diff / 86400000;
        }, 0) / registered.length)
      : 2;
    return { active, defective, rejected, totalPages, avgDays };
  }, [filings]);

  /* Case type breakdown for donut */
  const caseTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filings.forEach(f => { counts[f.case_category] = (counts[f.case_category] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, [filings]);

  /* Daily filings trend — last 14 days */
  const dailyData = useMemo(() => {
    const TODAY = new Date('2026-03-24');
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(TODAY); d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    filings.forEach(f => {
      if (!f.submitted_at) return;
      const day = f.submitted_at.slice(0, 10);
      const entry = days.find(d => d.date === day);
      if (entry) entry.count++;
    });
    return days;
  }, [filings]);

  /* Defect frequency */
  const defectFreq = useMemo(() => {
    const counts: Record<string, { code: string; description: string; count: number; resolved: number }> = {};
    filings.forEach(f => {
      f.defects.forEach(d => {
        if (!counts[d.code]) counts[d.code] = { code: d.code, description: d.description, count: 0, resolved: 0 };
        counts[d.code].count++;
        if (d.resolved) counts[d.code].resolved++;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filings]);

  /* Audit action frequency */
  const actionFreq = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLog.forEach(e => { counts[e.action] = (counts[e.action] || 0) + 1; });
    return Object.entries(counts)
      .filter(([a]) => a !== 'LOGIN')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [auditLog]);

  const activeStaff = staff.filter(s => s.active);
  const recentActivity = auditLog.filter(e => e.action !== 'LOGIN').slice(0, 8);

  return (
    <div className="p-5 min-h-full space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{settings.court_name} · {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Filings',    value: filings.length + REGISTERED_BASE, sub: 'all time',      icon: FileText,     color: 'text-gray-800',  bg: 'bg-gray-50',   border: 'border-gray-200' },
          { label: 'Active Pipeline',  value: kpis.active,      sub: 'in progress',      icon: Activity,     color: 'text-blue-700', bg: 'bg-blue-50',   border: 'border-blue-200' },
          { label: 'Registered',       value: totalRegistered,  sub: 'cases this year',  icon: CheckCircle2, color: 'text-green-700',bg: 'bg-green-50',  border: 'border-green-200' },
          { label: 'Defective',        value: kpis.defective,   sub: 'awaiting cure',    icon: Wrench,       color: 'text-amber-700',bg: 'bg-amber-50',  border: 'border-amber-200' },
          { label: 'Rejected',         value: kpis.rejected,    sub: 'filings',          icon: XCircle,      color: 'text-red-700',  bg: 'bg-red-50',    border: 'border-red-200' },
          { label: 'Avg. Processing',  value: `${kpis.avgDays}d`, sub: 'filing → registered', icon: Clock,   color: 'text-indigo-700',bg:'bg-indigo-50', border: 'border-indigo-200' },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={cn('rounded-xl border p-3.5 flex flex-col gap-1', bg, border)}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{label}</span>
              <Icon className={cn('size-3.5', color)} />
            </div>
            <div className={cn('text-2xl font-bold', color)}>{value}</div>
            <div className="text-[10px] text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Pipeline Kanban ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGE_CFG.map(stage => {
          const cases = getStageCases(filings, stage.key);
          const count = stage.key === 'registered' ? totalRegistered : cases.length;
          return (
            <div key={stage.key} className={cn('rounded-xl border p-3 flex flex-col gap-2', stage.border, stage.bg)}>
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px] font-semibold uppercase tracking-wide', stage.textColor)}>{stage.label}</span>
                <span className="text-xl font-bold text-gray-900">{count}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cases.slice(0, 4).map(f => <CaseCard key={f.id} filing={f} />)}
                {stage.key === 'registered' && REGISTERED_BASE > 0 && (
                  <div className="text-[10px] text-gray-400 text-center py-0.5">+{REGISTERED_BASE} archived</div>
                )}
                {cases.length === 0 && stage.key !== 'registered' && (
                  <div className="text-[11px] text-gray-400 text-center py-3">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Case type donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Case Type Breakdown</h3>
            <span className="text-xs text-gray-400">{filings.length} filings</span>
          </div>
          <DonutChart data={caseTypeData} />
        </div>

        {/* Daily filings bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Daily Filings</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <TrendingUp className="size-3" /> last 14 days
            </span>
          </div>
          <BarChart data={dailyData} />
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>Total: <strong className="text-gray-800">{dailyData.reduce((s, d) => s + d.count, 0)}</strong></span>
            <span>Peak: <strong className="text-gray-800">{Math.max(...dailyData.map(d => d.count))}/day</strong></span>
          </div>
        </div>

        {/* Defect frequency */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Defect Frequency</h3>
            <span className="text-xs text-gray-400">
              {filings.reduce((s, f) => s + f.defects.length, 0)} total
            </span>
          </div>
          {defectFreq.length === 0 ? (
            <p className="text-xs text-gray-400">No defects recorded</p>
          ) : (
            <div className="space-y-2">
              {defectFreq.map(d => (
                <div key={d.code} className="flex items-start gap-2 text-xs">
                  <span className="font-mono font-semibold text-amber-700 shrink-0 w-10">{d.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 truncate" title={d.description}>{d.description}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div className="bg-amber-400 h-1 rounded-full" style={{ width: `${(d.count / Math.max(...defectFreq.map(x => x.count))) * 100}%` }} />
                      </div>
                      <span className="text-gray-500 shrink-0">{d.count}×</span>
                      {d.resolved > 0 && <span className="text-green-600 shrink-0">{d.resolved} resolved</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Defect deadlines + action counts */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Defect Cure Deadlines</h3>
            <div className="space-y-2">
              {filings.filter(f => f.defect_cure_day != null).map(f => (
                <div key={f.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-gray-800 truncate">{f.filing_number ?? f.id}</div>
                    <div className="text-[10px] text-gray-400">{f.defects.filter(d => !d.resolved).length} unresolved defect{f.defects.filter(d => !d.resolved).length !== 1 ? 's' : ''}</div>
                  </div>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
                    (f.defect_cure_day ?? 0) >= 4 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                    Day {f.defect_cure_day}/5
                  </span>
                </div>
              ))}
              {filings.filter(f => f.defect_cure_day != null).length === 0 && (
                <p className="text-xs text-gray-400">No active deadlines</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Top Actions (audit)</h3>
            <div className="space-y-1.5">
              {actionFreq.map(([action, count]) => (
                <div key={action} className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0', ACTION_COLORS[action] ?? 'bg-gray-100 text-gray-600')}>
                    {action.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1">
                    <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${(count / (actionFreq[0][1])) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {recentActivity.map(entry => (
              <div key={entry.id} className="flex gap-2 text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap', ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-500')}>
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-gray-700 leading-snug">{entry.description}</div>
                  <div className="text-gray-400 mt-0.5 flex gap-1.5">
                    <span>{entry.actor}</span>
                    <span>·</span>
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff on duty */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Staff on Duty</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Users className="size-3" /> {activeStaff.length} active
            </span>
          </div>
          <div className="space-y-2">
            {activeStaff.map(s => (
              <div key={s.id} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-800 truncate">{s.name}</div>
                  <div className="text-[10px] text-gray-400">{s.role.replace(/_/g, ' ')}</div>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              </div>
            ))}
            {staff.filter(s => !s.active).map(s => (
              <div key={s.id} className="flex items-center gap-2.5 opacity-40">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-700 truncate">{s.name}</div>
                  <div className="text-[10px] text-gray-400">inactive</div>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
