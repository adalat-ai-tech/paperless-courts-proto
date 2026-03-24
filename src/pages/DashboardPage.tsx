import { useMemo } from 'react';
import { useAppStore } from '@/store';
import type { Filing } from '@/store/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TrendingUp, Users } from 'lucide-react';

const STAGE_CFG = [
  { key: 'filing',      label: 'Filing Desk',  color: '#3b82f6' },
  { key: 'scanning',    label: 'Scanning',      color: '#0891b2' },
  { key: 'preparation', label: 'Preparation',   color: '#ea580c' },
  { key: 'scrutiny',    label: 'Scrutiny',      color: '#4f46e5' },
  { key: 'defect_cure', label: 'Defect Cure',   color: '#dc2626' },
  { key: 'registered',  label: 'Registered',    color: '#16a34a' },
] as const;

const CATEGORY_COLORS = ['#3b82f6','#16a34a','#ea580c','#7c3aed','#0891b2','#db2777','#d97706'];

const ACTION_COLOR: Record<string, string> = {
  FILING_CREATED:        'text-blue-600',
  FILING_SUBMITTED:      'text-blue-600',
  SCANNING_COMPLETED:    'text-cyan-700',
  SCANNING_STARTED:      'text-cyan-700',
  PREPARATION_STARTED:   'text-orange-600',
  PREPARATION_SUBMITTED: 'text-orange-600',
  SCRUTINY_STARTED:      'text-indigo-600',
  SCRUTINY_APPROVED:     'text-green-600',
  DEFECTS_NOTED:         'text-amber-600',
  DEFECT_CURE_STARTED:   'text-red-600',
  SMS_SENT:              'text-pink-600',
  CASE_REGISTERED:       'text-green-700',
  SCRUTINY_REJECTED:     'text-red-600',
};

function getStageCases(filings: Filing[], stage: string): Filing[] {
  if (stage === 'registered') return filings.filter(f => f.filing_state === 'registered_case');
  if (stage === 'filing')     return filings.filter(f => f.filing_state === 'draft');
  return filings.filter(f => f.internal_stage === stage);
}

/* ── Pipeline Flow ───────────────────────────────────────────────────── */
function PipelineFlow({ filings, totalRegistered }: { filings: Filing[]; totalRegistered: number }) {
  const stages = STAGE_CFG.map(s => ({
    ...s,
    count: s.key === 'registered' ? totalRegistered : getStageCases(filings, s.key).length,
  }));

  return (
    <div className="py-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Case Pipeline</div>
      <div className="relative flex items-start">
        {/* track */}
        <div
          className="absolute top-5 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, #3b82f6, #0891b2, #ea580c, #4f46e5, #dc2626, #16a34a)' }}
        />
        {stages.map((stage, i) => (
          <div key={stage.key} className="relative flex-1 flex flex-col items-center gap-2">
            {/* dot node */}
            <div
              className="relative z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200"
            >
              <span className="text-sm font-bold" style={{ color: stage.color }}>{stage.count}</span>
            </div>
            <span className="text-[11px] text-gray-500 text-center leading-tight">{stage.label}</span>
            {/* tick below last node */}
            {i === stages.length - 1 && (
              <span className="text-[9px] text-gray-400">all time</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut Chart ─────────────────────────────────────────────────────── */
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const R = 36; const CX = 50; const CY = 50;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const segments = data.map(d => {
    const frac = d.value / total;
    const seg = { frac, dasharray: frac * circ, dashoffset: -offset * circ, color: d.color };
    offset += frac;
    return seg;
  });
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0 -rotate-90">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        {segments.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={s.color} strokeWidth="12"
            strokeDasharray={`${s.dasharray} ${circ}`}
            strokeDashoffset={s.dashoffset}
          />
        ))}
        <circle cx={CX} cy={CY} r={22} fill="white" />
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-gray-600 truncate max-w-[130px]" title={d.label}>{d.label}</span>
            <span className="ml-auto text-gray-800 tabular-nums pl-2">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────────────────── */
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-[3px] h-16">
      {data.map(({ date, count }, i) => {
        const barH = count === 0 ? 2 : Math.max(5, (count / max) * 52);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
            {count > 0 && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {count}
              </div>
            )}
            <div
              className={count > 0 ? 'w-full bg-blue-500 group-hover:bg-blue-600 transition-colors' : 'w-full bg-gray-100'}
              style={{ height: barH }}
            />
            {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
              <span className="text-[8px] text-gray-400">
                {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Section Label ───────────────────────────────────────────────────── */
function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] uppercase tracking-widest text-gray-400">{children}</span>
      {right && <span className="text-[10px] text-gray-400">{right}</span>}
    </div>
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

  const kpis = useMemo(() => {
    const active    = filings.filter(f => f.internal_stage !== null).length;
    const defective = filings.filter(f => f.defect_cure_day != null).length;
    const rejected  = filings.filter(f => f.filing_state === 'rejected').length;
    const reg       = filings.filter(f => f.filing_state === 'registered_case' && f.registered_at && f.submitted_at);
    const avgDays   = reg.length
      ? Math.round(reg.reduce((s, f) =>
          s + (new Date(f.registered_at!).getTime() - new Date(f.submitted_at!).getTime()) / 86400000, 0) / reg.length)
      : 2;
    return { active, defective, rejected, avgDays };
  }, [filings]);

  const caseTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filings.forEach(f => { counts[f.case_category] = (counts[f.case_category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, [filings]);

  const dailyData = useMemo(() => {
    const TODAY = new Date('2026-03-24');
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(TODAY); d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    filings.forEach(f => {
      if (!f.submitted_at) return;
      const entry = days.find(d => d.date === f.submitted_at!.slice(0, 10));
      if (entry) entry.count++;
    });
    return days;
  }, [filings]);

  const defectFreq = useMemo(() => {
    const counts: Record<string, { code: string; description: string; count: number; resolved: number }> = {};
    filings.forEach(f => f.defects.forEach(d => {
      if (!counts[d.code]) counts[d.code] = { code: d.code, description: d.description, count: 0, resolved: 0 };
      counts[d.code].count++;
      if (d.resolved) counts[d.code].resolved++;
    }));
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filings]);

  const activeStaff    = staff.filter(s => s.active);
  const recentActivity = auditLog.filter(e => e.action !== 'LOGIN').slice(0, 8);

  return (
    <div className="p-6 min-h-full space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pipeline Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">{settings.court_name} · {formatDate(new Date().toISOString())}</p>
      </div>

      {/* ── KPI strip ── */}
      <div className="flex divide-x divide-gray-200">
        {[
          { label: 'Total filings',   value: filings.length + REGISTERED_BASE },
          { label: 'Active pipeline', value: kpis.active,        accent: true },
          { label: 'Registered',      value: totalRegistered,    green: true  },
          { label: 'Defective',       value: kpis.defective                   },
          { label: 'Rejected',        value: kpis.rejected                    },
          { label: 'Avg. processing', value: `${kpis.avgDays}d`               },
        ].map(({ label, value, accent, green }) => (
          <div key={label} className="flex-1 px-4 first:pl-0">
            <div className={cn(
              'text-2xl font-bold tabular-nums',
              accent ? 'text-blue-600' : green ? 'text-green-600' : 'text-gray-900'
            )}>
              {value}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Pipeline ── */}
      <PipelineFlow filings={filings} totalRegistered={totalRegistered} />

      <div className="border-t border-gray-100" />

      {/* ── Row: Daily · Donut · Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <SectionLabel right={<span className="flex items-center gap-1"><TrendingUp className="size-2.5" /> last 14 days</span>}>
            Daily filings
          </SectionLabel>
          <BarChart data={dailyData} />
          <div className="mt-2 flex gap-4 text-xs text-gray-400">
            <span>Total <span className="text-gray-700 tabular-nums">{dailyData.reduce((s, d) => s + d.count, 0)}</span></span>
            <span>Peak <span className="text-gray-700 tabular-nums">{Math.max(...dailyData.map(d => d.count))}/day</span></span>
          </div>
        </div>

        <div>
          <SectionLabel right={`${filings.length} filings`}>Case types</SectionLabel>
          <DonutChart data={caseTypeData} />
        </div>

        <div>
          <SectionLabel>Recent activity</SectionLabel>
          <div className="space-y-2.5">
            {recentActivity.map(entry => (
              <div key={entry.id} className="flex gap-2 text-xs">
                <div className="w-1 rounded-full shrink-0 mt-0.5 mb-0.5 bg-gray-200" />
                <div className="min-w-0">
                  <span className={cn('font-medium', ACTION_COLOR[entry.action] ?? 'text-gray-500')}>
                    {entry.action.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <span className="text-gray-500 ml-1">{entry.description}</span>
                  <div className="text-gray-400 mt-0.5">{entry.actor} · {formatDate(entry.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="border-t border-gray-100" />

      {/* ── Row: Defect freq · Deadlines · Staff ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <SectionLabel right={`${filings.reduce((s, f) => s + f.defects.length, 0)} total`}>
            Defect frequency
          </SectionLabel>
          {defectFreq.length === 0 ? (
            <p className="text-xs text-gray-400">No defects recorded</p>
          ) : (
            <div className="space-y-2.5">
              {defectFreq.map(d => (
                <div key={d.code} className="text-xs">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-mono text-gray-700">{d.code} <span className="text-gray-500 font-sans">{d.description}</span></span>
                    <span className="text-gray-400 ml-2 shrink-0">{d.count}×</span>
                  </div>
                  <div className="h-0.5 bg-gray-100 rounded-full">
                    <div className="h-0.5 bg-amber-400 rounded-full" style={{ width: `${(d.count / Math.max(...defectFreq.map(x => x.count))) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionLabel>Defect cure deadlines</SectionLabel>
          <div className="space-y-3">
            {filings.filter(f => f.defect_cure_day != null).map(f => (
              <div key={f.id} className="text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-gray-800">{f.filing_number ?? f.id}</span>
                  <span className={cn('tabular-nums', (f.defect_cure_day ?? 0) >= 4 ? 'text-red-600' : 'text-amber-600')}>
                    day {f.defect_cure_day}/5
                  </span>
                </div>
                <div className="text-gray-400 mt-0.5">
                  {f.defects.filter(d => !d.resolved).length} unresolved defect{f.defects.filter(d => !d.resolved).length !== 1 ? 's' : ''}
                </div>
                <div className="mt-1 h-0.5 bg-gray-100 rounded-full">
                  <div
                    className={cn('h-0.5 rounded-full', (f.defect_cure_day ?? 0) >= 4 ? 'bg-red-400' : 'bg-amber-400')}
                    style={{ width: `${((f.defect_cure_day ?? 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {filings.filter(f => f.defect_cure_day != null).length === 0 && (
              <p className="text-xs text-gray-400">No active deadlines</p>
            )}
          </div>
        </div>

        <div>
          <SectionLabel right={<span className="flex items-center gap-1"><Users className="size-2.5" />{activeStaff.length} active</span>}>
            Staff
          </SectionLabel>
          <div className="space-y-2">
            {activeStaff.map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium shrink-0">
                  {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-gray-800">{s.name}</span>
                  <span className="text-gray-400 ml-1.5">{s.role.replace(/_/g, ' ')}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              </div>
            ))}
            {staff.filter(s => !s.active).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs opacity-40">
                <div className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium shrink-0">
                  {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="text-gray-400 ml-1.5">inactive</span>
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
