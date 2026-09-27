import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = [
  '#059669', // emerald-600
  '#0891b2', // cyan-600
  '#4f46e5', // indigo-600
  '#d97706', // amber-600
  '#db2777', // pink-600
  '#7c3aed', // purple-600
  '#0d9488', // teal-600
  '#2563eb', // blue-600
];

export default function ChartRenderer({ data, type = 'bar', targetColumn = 'value', height = 320 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
        No chart data available to render.
      </div>
    );
  }

  // Format large numbers cleanly
  const formatYAxis = (val) => {
    if (typeof val !== 'number') return val;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val;
  };

  const formatXLabel = (val) => {
    if (!val) return '';
    const str = String(val);
    return str.length > 14 ? `${str.slice(0, 13)}…` : str;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      const val = typeof p.value === 'number' ? p.value.toLocaleString() : p.value;
      const share = p.payload?.share ? ` (${p.payload.share}%)` : '';
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{label || p.payload?.name}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            {targetColumn.replace('_', ' ')}: {val}{share}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'pie') {
    return (
      <div className="w-full relative" style={{ height: height || 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="82%"
              innerRadius="52%"
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={formatXLabel}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'area') {
    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 50 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={formatXLabel}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default Bar Chart
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={formatXLabel}
            angle={-25}
            textAnchor="end"
            interval={0}
            height={50}
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={55}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
