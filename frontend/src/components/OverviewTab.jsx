import React, { useState } from 'react';
import {
  Database,
  Hash,
  Layers,
  AlertTriangle,
  Calendar,
  Search,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  BarChart2
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

export default function OverviewTab({ profile, onAskQuestion }) {
  const [activePreviewCol, setActivePreviewCol] = useState(
    profile?.numerical_cols?.[0] || profile?.column_profiles?.[0]?.name
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPage, setPreviewPage] = useState(0);

  if (!profile) return null;

  const {
    rows,
    columns,
    missing_pct,
    numerical_count,
    categorical_count,
    datetime_count,
    column_profiles,
    correlations,
    preview
  } = profile;

  // Selected column profile for mini distribution
  const selectedColProfile = column_profiles?.find((c) => c.name === activePreviewCol);

  // Filter preview table rows
  const filteredPreview = (preview || []).filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pageSize = 5;
  const paginatedRows = filteredPreview.slice(previewPage * pageSize, (previewPage + 1) * pageSize);
  const totalPages = Math.ceil(filteredPreview.length / pageSize);

  return (
    <div className="space-y-6">
      {/* 1. KEY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rows</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{rows?.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified records</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Columns</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{columns}</p>
          <p className="text-[11px] text-slate-500 mt-1">Schema dimensions</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Missing Data</span>
            <AlertTriangle className={`w-4 h-4 ${missing_pct > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{missing_pct}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all cells</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Numerical</span>
            <Hash className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{numerical_count}</p>
          <p className="text-[11px] text-slate-500 mt-1">Quantitative metrics</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Categorical</span>
            <TableIcon className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{categorical_count}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {datetime_count > 0 ? `+ ${datetime_count} date field` : 'Segments & dimensions'}
          </p>
        </div>
      </div>

      {/* 2. SUMMARY STATISTICS TABLE & DISTRIBUTION PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistical Summary Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Summary Statistics</h3>
              <p className="text-xs text-slate-400">Calculated directly via Pandas</p>
            </div>
            <span className="text-xs text-brand-400 font-mono">100% Ground Truth</span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Mean</th>
                  <th className="py-2.5 px-3">Std</th>
                  <th className="py-2.5 px-3">Min</th>
                  <th className="py-2.5 px-3">Median</th>
                  <th className="py-2.5 px-3">Max</th>
                  <th className="py-2.5 px-3 text-right">Outliers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {column_profiles
                  ?.filter((c) => c.type === 'numerical' && c.stats)
                  .map((col) => {
                    const isSelected = col.name === activePreviewCol;
                    return (
                      <tr
                        key={col.name}
                        onClick={() => setActivePreviewCol(col.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-brand-950/40 text-brand-200' : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-200 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2.5 px-3">{col.stats.mean.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-slate-400">{col.stats.std.toLocaleString()}</td>
                        <td className="py-2.5 px-3">{col.stats.min.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{col.stats.median.toLocaleString()}</td>
                        <td className="py-2.5 px-3">{col.stats.max.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          {col.stats.outliers_count > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {col.stats.outliers_count}
                            </span>
                          ) : (
                            <span className="text-slate-600">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Column Visualizer */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider">
                  Distribution Focus
                </span>
                <h4 className="text-sm font-bold text-white">{activePreviewCol}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                {selectedColProfile?.type}
              </span>
            </div>

            {selectedColProfile?.type === 'numerical' && selectedColProfile.distribution ? (
              <div className="mt-2">
                <p className="text-xs text-slate-400 mb-2">Frequency Distribution Bins</p>
                <div className="h-44">
                  <ChartRenderer
                    data={selectedColProfile.distribution.map((d) => ({
                      name: d.bin,
                      value: d.count
                    }))}
                    type="bar"
                    targetColumn="Count"
                    height={180}
                  />
                </div>
              </div>
            ) : selectedColProfile?.top_values ? (
              <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                <p className="text-xs text-slate-400 mb-2">Top Value Categories</p>
                {selectedColProfile.top_values.map((v, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="truncate max-w-[140px] font-medium">{v.label}</span>
                      <span className="text-slate-400 font-mono">
                        {v.count.toLocaleString()} ({v.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, v.pct)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                Select a column from the left to view distribution.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Missing: {selectedColProfile?.missing_pct}%</span>
            <span>Unique: {selectedColProfile?.unique_values}</span>
          </div>
        </div>
      </div>

      {/* 3. CORRELATION MATRIX & RAW DATA PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        {correlations && correlations.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Correlation Matrix</h3>
                <p className="text-xs text-slate-400">Pearson coefficient (|r| &gt; 0.5 indicates strong relationship)</p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-center text-[11px] font-mono">
                <thead>
                  <tr>
                    <th className="py-1 px-2 text-left text-slate-400"></th>
                    {correlations.map((r) => (
                      <th key={r.column} className="py-1 px-2 text-slate-400 font-normal truncate max-w-[80px]">
                        {r.column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.map((row) => (
                    <tr key={row.column}>
                      <td className="py-1.5 px-2 text-left font-medium text-slate-300 truncate max-w-[100px]">
                        {row.column}
                      </td>
                      {correlations.map((col) => {
                        const val = row[col.column];
                        let bg = 'bg-slate-800/30 text-slate-400';
                        if (val >= 0.7) bg = 'bg-emerald-600/40 text-emerald-200 font-bold';
                        else if (val >= 0.4) bg = 'bg-emerald-700/20 text-emerald-300';
                        else if (val <= -0.4) bg = 'bg-rose-700/30 text-rose-300';

                        return (
                          <td key={col.column} className={`py-1.5 px-2 rounded ${bg}`}>
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Preview Table */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Dataset Preview</h3>
                <p className="text-xs text-slate-400">First records in memory</p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-36"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    {column_profiles?.slice(0, 6).map((c) => (
                      <th key={c.name} className="py-2 px-2.5">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {paginatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                      {column_profiles?.slice(0, 6).map((c) => (
                        <td key={c.name} className="py-2 px-2.5 truncate max-w-[120px]">
                          {String(row[c.name] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredPreview.length > 0 ? previewPage * pageSize + 1 : 0} -{' '}
              {Math.min((previewPage + 1) * pageSize, filteredPreview.length)} of {filteredPreview.length}
            </span>
            <div className="flex space-x-1">
              <button
                disabled={previewPage === 0}
                onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                Prev
              </button>
              <button
                disabled={previewPage >= totalPages - 1}
                onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
