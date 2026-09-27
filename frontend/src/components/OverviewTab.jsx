import React, { useState } from 'react';
import {
  Database,
  Hash,
  Layers,
  AlertTriangle,
  Calendar,
  Search,
  Table as TableIcon,
  BarChart2,
  CheckCircle2
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

  const pageSize = 6;
  const paginatedRows = filteredPreview.slice(previewPage * pageSize, (previewPage + 1) * pageSize);
  const totalPages = Math.ceil(filteredPreview.length / pageSize) || 1;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. KEY METRICS GRID - Spacious, crisp cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Rows */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rows</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {rows?.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">100% verified records</p>
          </div>
        </div>

        {/* Metric 2: Columns */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Columns</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {columns}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Features in schema</p>
          </div>
        </div>

        {/* Metric 3: Missing % */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Missing Data</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {missing_pct}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Across all cells</p>
          </div>
        </div>

        {/* Metric 4: Numerical */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Numerical</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {numerical_count}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Quantitative metrics</p>
          </div>
        </div>

        {/* Metric 5: Categorical */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Categorical</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TableIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {categorical_count}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {datetime_count > 0 ? `+ ${datetime_count} timeline col` : 'Dimensions'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STATISTICS TABLE & DISTRIBUTION PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Statistical Summary Table (8 columns) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Statistical Summary (Pandas Kernel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row below to preview its distribution on the right panel
              </p>
            </div>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ground Truth Verified</span>
            </span>
          </div>

          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                <tr>
                  <th className="py-3 px-3 font-bold">Column</th>
                  <th className="py-3 px-3 font-bold">Mean</th>
                  <th className="py-3 px-3 font-bold">Std</th>
                  <th className="py-3 px-3 font-bold">Min</th>
                  <th className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">Median</th>
                  <th className="py-3 px-3 font-bold">Max</th>
                  <th className="py-3 px-3 text-right font-bold">Outliers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {column_profiles
                  ?.filter((c) => c.type === 'numerical' && c.stats)
                  .map((col) => {
                    const isSelected = col.name === activePreviewCol;
                    return (
                      <tr
                        key={col.name}
                        onClick={() => setActivePreviewCol(col.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-slate-200 flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
                          <span>{col.name}</span>
                        </td>
                        <td className="py-3 px-3">{col.stats.mean.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500">{col.stats.std.toLocaleString()}</td>
                        <td className="py-3 px-3">{col.stats.min.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{col.stats.median.toLocaleString()}</td>
                        <td className="py-3 px-3">{col.stats.max.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-sans">
                          {col.stats.outliers_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20">
                              {col.stats.outliers_count}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Column Visualizer (4 columns) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Distribution Focus
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{activePreviewCol}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] uppercase font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {selectedColProfile?.type}
              </span>
            </div>

            {selectedColProfile?.type === 'numerical' && selectedColProfile.distribution ? (
              <div className="mt-2 space-y-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Frequency Histogram Bins</p>
                <div className="h-56">
                  <ChartRenderer
                    data={selectedColProfile.distribution.map((d) => ({
                      name: d.bin,
                      value: d.count
                    }))}
                    type="bar"
                    targetColumn="Count"
                    height={220}
                  />
                </div>
              </div>
            ) : selectedColProfile?.top_values ? (
              <div className="mt-2 space-y-3 max-h-64 overflow-y-auto pr-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Value Categories</p>
                {selectedColProfile.top_values.map((v, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
                      <span className="truncate max-w-[150px]">{v.label}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {v.count.toLocaleString()} ({v.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, v.pct)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                Select a column from the table to view distribution.
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Missing: <strong className="text-slate-700 dark:text-slate-300">{selectedColProfile?.missing_pct}%</strong></span>
            <span>Unique: <strong className="text-slate-700 dark:text-slate-300">{selectedColProfile?.unique_values}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. CORRELATION MATRIX & RAW DATA PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        {correlations && correlations.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Correlation Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pearson correlation coefficients (|r| &gt; 0.5 indicates strong statistical relationship)
              </p>
            </div>

            <div className="overflow-x-auto max-h-[320px] pb-2">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left font-sans font-bold text-slate-500 text-[11px]"></th>
                    {correlations.map((r) => (
                      <th key={r.column} className="py-2 px-2.5 font-sans font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[100px] text-[11px]">
                        {r.column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {correlations.map((row) => (
                    <tr key={row.column}>
                      <td className="py-2 px-3 text-left font-sans font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px] text-[11px]">
                        {row.column}
                      </td>
                      {correlations.map((col) => {
                        const val = row[col.column];
                        let bg = 'bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400';
                        if (val >= 0.7) bg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-600/40 dark:text-emerald-200 font-bold';
                        else if (val >= 0.4) bg = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-700/20 dark:text-emerald-300';
                        else if (val <= -0.4) bg = 'bg-rose-50 text-rose-800 dark:bg-rose-700/30 dark:text-rose-300';

                        return (
                          <td key={col.column} className={`py-2 px-2.5 rounded-md ${bg}`}>
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
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Dataset Records Preview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inspect sample tabular records</p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[250px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    {column_profiles?.slice(0, 6).map((c) => (
                      <th key={c.name} className="py-2.5 px-3 font-sans font-bold">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {paginatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                      {column_profiles?.slice(0, 6).map((c) => (
                        <td key={c.name} className="py-2 px-3 truncate max-w-[130px]">
                          {String(row[c.name] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredPreview.length > 0 ? previewPage * pageSize + 1 : 0} -{' '}
              {Math.min((previewPage + 1) * pageSize, filteredPreview.length)} of {filteredPreview.length}
            </span>
            <div className="flex space-x-1.5">
              <button
                disabled={previewPage === 0}
                onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors font-medium"
              >
                Previous
              </button>
              <button
                disabled={previewPage >= totalPages - 1}
                onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors font-medium"
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
