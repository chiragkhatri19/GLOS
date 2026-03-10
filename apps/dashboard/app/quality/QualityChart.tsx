'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface LocaleBarData {
  locale: string
  improvement: number
}

const LOCALE_COLORS: Record<string, string> = {
  ja: '#6366f1',
  de: '#22d3ee',
  ar: '#f59e0b',
  fr: '#22c55e',
  es: '#ec4899',
  zh: '#a78bfa',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: 'var(--mono)',
      fontSize: '12px',
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'var(--primary)' }}>+{payload[0].value}% improvement</div>
    </div>
  )
}

export function QualityChart({ data }: { data: LocaleBarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="locale"
          tick={{ fontFamily: 'var(--mono)', fontSize: 12, fill: 'var(--text-2)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'var(--mono)', fontSize: 11, fill: 'var(--text-3)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `+${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey="improvement" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry) => (
            <Cell
              key={entry.locale}
              fill={LOCALE_COLORS[entry.locale] ?? '#6366f1'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
