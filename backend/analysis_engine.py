import os
import re
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

class AnalysisEngine:
    def __init__(self):
        self.datasets: Dict[str, pd.DataFrame] = {}
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.insights_cache: Dict[str, List[Dict[str, Any]]] = {}

    def load_dataset(self, dataset_id: str, file_path_or_buffer) -> Dict[str, Any]:
        """Loads a CSV or Excel file and returns its dataset profile."""
        if isinstance(file_path_or_buffer, str):
            if file_path_or_buffer.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path_or_buffer)
            else:
                df = pd.read_csv(file_path_or_buffer)
        else:
            try:
                df = pd.read_csv(file_path_or_buffer)
            except Exception:
                file_path_or_buffer.seek(0)
                df = pd.read_excel(file_path_or_buffer)

        # Attempt to parse date columns
        for col in df.columns:
            if df[col].dtype == 'object':
                if 'date' in col.lower() or 'time' in col.lower() or 'day' in col.lower():
                    try:
                        df[col] = pd.to_datetime(df[col], errors='ignore')
                    except Exception:
                        pass

        self.datasets[dataset_id] = df
        profile = self._compute_profile(dataset_id, df)
        self.profiles[dataset_id] = profile
        self.insights_cache[dataset_id] = self._compute_insights(dataset_id, df, profile)
        return profile

    def get_dataset(self, dataset_id: str) -> Optional[pd.DataFrame]:
        return self.datasets.get(dataset_id)

    def get_profile(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        return self.profiles.get(dataset_id)

    def get_insights(self, dataset_id: str) -> List[Dict[str, Any]]:
        return self.insights_cache.get(dataset_id, [])

    def _compute_profile(self, dataset_id: str, df: pd.DataFrame) -> Dict[str, Any]:
        rows, cols = df.shape
        total_cells = rows * cols if rows * cols > 0 else 1
        missing_cells = int(df.isna().sum().sum())
        missing_pct = round((missing_cells / total_cells) * 100, 2)

        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        date_cols = df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()
        cat_cols = [c for c in df.columns if c not in num_cols and c not in date_cols]

        # Column stats
        col_profiles = []
        for col in df.columns:
            col_type = "numerical" if col in num_cols else ("datetime" if col in date_cols else "categorical")
            missing_count = int(df[col].isna().sum())
            col_missing_pct = round((missing_count / rows) * 100, 2) if rows > 0 else 0

            info: Dict[str, Any] = {
                "name": col,
                "type": col_type,
                "missing_count": missing_count,
                "missing_pct": col_missing_pct,
                "unique_values": int(df[col].nunique(dropna=True))
            }

            if col_type == "numerical":
                series = df[col].dropna()
                if len(series) > 0:
                    q1 = float(series.quantile(0.25))
                    q3 = float(series.quantile(0.75))
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers_count = int(((series < lower_bound) | (series > upper_bound)).sum())

                    info["stats"] = {
                        "mean": round(float(series.mean()), 2),
                        "std": round(float(series.std()), 2) if len(series) > 1 else 0,
                        "min": round(float(series.min()), 2),
                        "q25": round(q1, 2),
                        "median": round(float(series.median()), 2),
                        "q75": round(q3, 2),
                        "max": round(float(series.max()), 2),
                        "outliers_count": outliers_count
                    }
                    # Histogram distribution bins
                    counts, bin_edges = np.histogram(series, bins=min(10, max(4, int(series.nunique()))))
                    info["distribution"] = [
                        {
                            "bin": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}",
                            "count": int(counts[i])
                        }
                        for i in range(len(counts))
                    ]
            elif col_type == "categorical":
                val_counts = df[col].value_counts(dropna=True).head(8)
                info["top_values"] = [
                    {"label": str(k), "count": int(v), "pct": round((v / rows) * 100, 1)}
                    for k, v in val_counts.items()
                ]

            col_profiles.append(info)

        # Correlation Matrix (for up to 12 numerical columns)
        corr_data = []
        if len(num_cols) >= 2:
            sub_num = num_cols[:12]
            corr_df = df[sub_num].corr().fillna(0)
            for col1 in sub_num:
                row_entry = {"column": col1}
                for col2 in sub_num:
                    row_entry[col2] = round(float(corr_df.loc[col1, col2]), 2)
                corr_data.append(row_entry)

        # Sample preview (first 15 rows)
        preview_df = df.head(15).copy()
        # Format timestamps nicely for preview
        for dcol in date_cols:
            preview_df[dcol] = preview_df[dcol].astype(str)
        preview_records = json.loads(preview_df.to_json(orient="records", date_format="iso"))

        return {
            "dataset_id": dataset_id,
            "rows": rows,
            "columns": cols,
            "missing_pct": missing_pct,
            "numerical_count": len(num_cols),
            "categorical_count": len(cat_cols),
            "datetime_count": len(date_cols),
            "numerical_cols": num_cols,
            "categorical_cols": cat_cols,
            "datetime_cols": date_cols,
            "column_profiles": col_profiles,
            "correlations": corr_data,
            "preview": preview_records
        }

    def _compute_insights(self, dataset_id: str, df: pd.DataFrame, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        insights = []
        rows = profile["rows"]
        num_cols = profile["numerical_cols"]
        cat_cols = profile["categorical_cols"]
        date_cols = profile["datetime_cols"]

        # 1. TRENDS (if date column exists)
        if date_cols and num_cols:
            date_col = date_cols[0]
            # Primary monetary or volume metric
            primary_num = next((c for c in num_cols if any(k in c.lower() for k in ["rev", "sales", "profit", "amount", "total", "mrr"])), num_cols[0])
            
            try:
                # Group by month
                df_temp = df[[date_col, primary_num]].dropna().copy()
                df_temp["period"] = pd.to_datetime(df_temp[date_col]).dt.to_period("M").astype(str)
                monthly = df_temp.groupby("period")[primary_num].sum().sort_index()

                if len(monthly) >= 2:
                    first_val = float(monthly.iloc[0])
                    last_val = float(monthly.iloc[-1])
                    total_change_pct = round(((last_val - first_val) / (first_val if first_val != 0 else 1)) * 100, 1)

                    # Look for specific drops
                    monthly_diff = monthly.pct_change() * 100
                    worst_month = monthly_diff.idxmin()
                    worst_drop = monthly_diff.min()

                    trend_direction = "increased" if total_change_pct >= 0 else "decreased"
                    insights.append({
                        "id": "insight-trend-1",
                        "type": "trend",
                        "badge": "Growth Trend",
                        "title": f"{primary_num.replace('_', ' ').title()} {trend_direction} {abs(total_change_pct)}% across analyzed timeframe",
                        "description": f"Overall {primary_num.replace('_', ' ')} moved from ${first_val:,.0f} in {monthly.index[0]} to ${last_val:,.0f} in {monthly.index[-1]}.",
                        "metric": f"{'+' if total_change_pct >= 0 else ''}{total_change_pct}%",
                        "severity": "positive" if total_change_pct >= 0 else "warning",
                        "target_col": primary_num,
                        "time_col": date_col,
                        "suggested_query": f"Show monthly trend of {primary_num}"
                    })

                    if pd.notna(worst_drop) and worst_drop < -15:
                        insights.append({
                            "id": "insight-trend-drop",
                            "type": "anomaly",
                            "badge": "Anomaly Detected",
                            "title": f"{worst_month} showed an unusual decline of {abs(round(worst_drop, 1))}%",
                            "description": f"Performance contracted sharply in {worst_month} compared to the preceding period. Requires regional and product breakdown.",
                            "metric": f"{round(worst_drop, 1)}%",
                            "severity": "danger",
                            "target_col": primary_num,
                            "time_col": date_col,
                            "suggested_query": f"Why did {primary_num} decrease in {worst_month}?"
                        })
            except Exception:
                pass

        # 2. OUTLIERS (Extreme transactions)
        outlier_col = next((c for c in num_cols if any(k in c.lower() for k in ["rev", "sales", "profit", "amount", "total", "charge"])), num_cols[0] if num_cols else None)
        if outlier_col:
            series = df[outlier_col].dropna()
            if len(series) > 10:
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                upper_bound = q3 + 3.0 * iqr  # severe outlier
                outlier_rows = df[df[outlier_col] > upper_bound]
                count_outliers = len(outlier_rows)
                if count_outliers > 0:
                    max_outlier = float(series.max())
                    med_val = float(series.median())
                    insights.append({
                        "id": "insight-outlier-1",
                        "type": "outlier",
                        "badge": "High Outliers",
                        "title": f"{count_outliers} transactions are unusually large compared with the dataset",
                        "description": f"Extreme transactions peak at ${max_outlier:,.2f} versus the dataset median of ${med_val:,.2f} (3x IQR threshold).",
                        "metric": f"{count_outliers} rows",
                        "severity": "warning",
                        "target_col": outlier_col,
                        "suggested_query": f"Are there unusual values in {outlier_col}?"
                    })

        # 3. CORRELATIONS
        if len(num_cols) >= 2:
            corr_df = df[num_cols].corr()
            strong_pairs = []
            for i in range(len(num_cols)):
                for j in range(i + 1, len(num_cols)):
                    c1, c2 = num_cols[i], num_cols[j]
                    val = corr_df.loc[c1, c2]
                    if pd.notna(val) and abs(val) >= 0.50:
                        strong_pairs.append((c1, c2, float(val)))
            
            strong_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
            if strong_pairs:
                c1, c2, r_val = strong_pairs[0]
                rel = "strong positive" if r_val > 0 else "strong negative"
                insights.append({
                    "id": "insight-corr-1",
                    "type": "correlation",
                    "badge": "Key Relationship",
                    "title": f"{c1.replace('_', ' ').title()} and {c2.replace('_', ' ').title()} show a {rel} relationship",
                    "description": f"Statistical correlation coefficient of r = {r_val:.2f}. Higher {c1.replace('_', ' ')} systematically corresponds with {c2.replace('_', ' ')}.",
                    "metric": f"r = {r_val:.2f}",
                    "severity": "info",
                    "target_col": c2,
                    "suggested_query": f"What factors affect {c2}?"
                })

        # 4. CATEGORY DIFFERENCES & LEADER SHARES
        rev_col = next((c for c in num_cols if any(k in c.lower() for k in ["rev", "sales", "mrr", "amount"])), num_cols[0] if num_cols else None)
        if rev_col and cat_cols:
            for cat_col in cat_cols[:2]:
                grouped = df.groupby(cat_col)[rev_col].sum().sort_values(ascending=False)
                if len(grouped) >= 2:
                    top_name = str(grouped.index[0])
                    top_val = float(grouped.iloc[0])
                    total_val = float(grouped.sum())
                    share_pct = round((top_val / (total_val if total_val != 0 else 1)) * 100, 1)

                    insights.append({
                        "id": f"insight-cat-{cat_col}",
                        "type": "category_leader",
                        "badge": "Dominant Segment",
                        "title": f"{top_name} leads {cat_col.replace('_', ' ')}, accounting for {share_pct}% of total {rev_col.replace('_', ' ')}",
                        "description": f"Segment '{top_name}' generated ${top_val:,.0f} out of ${total_val:,.0f} across all {cat_col}s.",
                        "metric": f"{share_pct}% share",
                        "severity": "info",
                        "target_col": rev_col,
                        "group_by": cat_col,
                        "suggested_query": f"Which {cat_col} generated the most {rev_col}?"
                    })
                    break

        # 5. MISSING DATA
        missing_cols = [cp for cp in profile["column_profiles"] if cp["missing_pct"] >= 2.0]
        if missing_cols:
            top_missing = max(missing_cols, key=lambda x: x["missing_pct"])
            insights.append({
                "id": "insight-missing-1",
                "type": "missing_data",
                "badge": "Data Quality Notice",
                "title": f"{top_missing['name'].replace('_', ' ').title()} contains {top_missing['missing_pct']}% missing values",
                "description": f"{top_missing['missing_count']} records lack entries for {top_missing['name']}. Data imputation or validation recommended.",
                "metric": f"{top_missing['missing_pct']}% missing",
                "severity": "warning",
                "suggested_query": f"Show missing values distribution across columns"
            })

        return insights

    def execute_plan(self, dataset_id: str, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a structured Analysis Plan against the verified Pandas dataframe.
        Guarantees that numbers are never hallucinated by computing everything directly in Python.
        """
        df = self.get_dataset(dataset_id)
        if df is None:
            raise ValueError(f"Dataset {dataset_id} not found.")

        target_col = plan.get("target_column")
        group_by = plan.get("group_by") or []
        if isinstance(group_by, str):
            group_by = [group_by]
        
        metric = plan.get("metric", "sum").lower()
        time_col = plan.get("time_column")
        time_granularity = plan.get("time_granularity", "month")
        chart_type = plan.get("chart_type", "bar")
        filters = plan.get("filters", {})
        limit = plan.get("limit", 15)

        # Safe copy for execution
        working_df = df.copy()

        code_lines = ["# 1. Filter dataset if applicable"]

        # Apply filters
        for k, v in filters.items():
            if k in working_df.columns:
                if isinstance(v, list):
                    working_df = working_df[working_df[k].isin(v)]
                    code_lines.append(f'df = df[df["{k}"].isin({v})]')
                else:
                    working_df = working_df[working_df[k] == v]
                    code_lines.append(f'df = df[df["{k}"] == "{v}"]')

        # Fallback target column if not supplied or missing
        if not target_col or target_col not in working_df.columns:
            num_cols = working_df.select_dtypes(include=[np.number]).columns.tolist()
            target_col = num_cols[0] if num_cols else working_df.columns[0]

        # Time-based analysis
        if time_col and time_col in working_df.columns:
            code_lines.append(f'# 2. Extract {time_granularity} periods from {time_col}')
            dt_series = pd.to_datetime(working_df[time_col], errors='coerce')
            if time_granularity == "month":
                working_df["period"] = dt_series.dt.to_period("M").astype(str)
            elif time_granularity == "quarter":
                working_df["period"] = dt_series.dt.to_period("Q").astype(str)
            elif time_granularity == "week":
                working_df["period"] = dt_series.dt.to_period("W").astype(str)
            else:
                working_df["period"] = dt_series.dt.strftime("%Y-%m-%d")

            effective_groups = ["period"] + [g for g in group_by if g in working_df.columns and g != time_col]
        else:
            effective_groups = [g for g in group_by if g in working_df.columns]

        # Aggregation
        if effective_groups:
            code_lines.append(f'# 3. Group by {effective_groups} and aggregate {target_col} ({metric})')
            agg_func = "sum" if metric == "sum" else ("mean" if metric == "mean" else ("count" if metric == "count" else "median"))
            
            if len(effective_groups) == 1:
                grp_col = effective_groups[0]
                grouped = working_df.groupby(grp_col)[target_col].agg(agg_func).reset_index()
                grouped.columns = ["name", "value"]
                
                # Sort
                if plan.get("sort", "desc") == "desc" and grp_col != "period":
                    grouped = grouped.sort_values(by="value", ascending=False)
                else:
                    grouped = grouped.sort_values(by="name", ascending=True)

                if limit:
                    grouped = grouped.head(limit)

                # Round and clean
                grouped["value"] = grouped["value"].round(2)
                total_sum = float(grouped["value"].sum())
                grouped["share"] = ((grouped["value"] / (total_sum if total_sum != 0 else 1)) * 100).round(1)

                chart_data = grouped.to_dict(orient="records")
                code_lines.append(f'result = df.groupby("{grp_col}")["{target_col}"].{agg_func}().reset_index()')
                code_lines.append(f'result = result.sort_values(by="{target_col}", ascending={plan.get("sort", "desc") == "asc"}).head({limit})')

                # Math summary for LLM context
                top_item = chart_data[0] if chart_data else None
                bottom_item = chart_data[-1] if chart_data else None
                summary_stats = {
                    "total": total_sum,
                    "count": len(chart_data),
                    "top_name": top_item["name"] if top_item else None,
                    "top_value": top_item["value"] if top_item else None,
                    "top_share": top_item["share"] if top_item else None,
                    "bottom_name": bottom_item["name"] if bottom_item else None,
                    "bottom_value": bottom_item["value"] if bottom_item else None,
                }
            else:
                # Multi-dimensional pivot (e.g. Period by Region or Product by Region)
                col1, col2 = effective_groups[0], effective_groups[1]
                pivot = working_df.pivot_table(index=col1, columns=col2, values=target_col, aggfunc=agg_func, fill_value=0).round(2)
                pivot_reset = pivot.reset_index()
                pivot_reset = pivot_reset.rename(columns={col1: "name"})
                chart_data = pivot_reset.head(limit).to_dict(orient="records")
                code_lines.append(f'result = df.pivot_table(index="{col1}", columns="{col2}", values="{target_col}", aggfunc="{agg_func}", fill_value=0)')
                summary_stats = {
                    "rows": len(pivot_reset),
                    "categories": list(pivot.columns)
                }
        else:
            # Simple distribution or summary for target column
            code_lines.append(f'# 3. Compute distribution / stats for {target_col}')
            if pd.api.types.is_numeric_dtype(working_df[target_col]):
                counts, bin_edges = np.histogram(working_df[target_col].dropna(), bins=min(10, max(5, int(working_df[target_col].nunique()))))
                chart_data = [
                    {"name": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}", "value": int(counts[i])}
                    for i in range(len(counts))
                ]
            else:
                vcounts = working_df[target_col].value_counts().head(limit)
                chart_data = [{"name": str(k), "value": int(v)} for k, v in vcounts.items()]
            
            code_lines.append(f'result = df["{target_col}"].value_counts().head({limit})')
            summary_stats = {"total_items": len(working_df)}

        return {
            "chart_type": chart_type,
            "target_column": target_col,
            "metric": metric,
            "chart_data": chart_data,
            "summary_stats": summary_stats,
            "executed_python_code": "\n".join(code_lines)
        }

    def generate_executive_report_data(self, dataset_id: str) -> Dict[str, Any]:
        """Gathers quantitative facts and metrics for the Executive Report."""
        df = self.get_dataset(dataset_id)
        profile = self.get_profile(dataset_id)
        insights = self.get_insights(dataset_id)

        if df is None or profile is None:
            raise ValueError("Dataset not loaded.")

        num_cols = profile["numerical_cols"]
        cat_cols = profile["categorical_cols"]
        date_cols = profile["datetime_cols"]

        rev_col = next((c for c in num_cols if any(k in c.lower() for k in ["rev", "sales", "mrr", "amount", "total"])), num_cols[0] if num_cols else None)
        profit_col = next((c for c in num_cols if "profit" in c.lower() or "margin" in c.lower()), None)

        total_rev = float(df[rev_col].sum()) if rev_col else 0
        avg_rev = float(df[rev_col].mean()) if rev_col else 0
        total_profit = float(df[profit_col].sum()) if profit_col else 0

        # Region / Segment breakdowns
        breakdowns = {}
        for c in cat_cols[:3]:
            if rev_col:
                grp = df.groupby(c)[rev_col].sum().sort_values(ascending=False).head(5)
                breakdowns[c] = [
                    {"name": str(k), "value": round(float(v), 2), "share": round((float(v) / (total_rev if total_rev != 0 else 1)) * 100, 1)}
                    for k, v in grp.items()
                ]

        return {
            "dataset_name": dataset_id,
            "rows": profile["rows"],
            "columns": profile["columns"],
            "missing_pct": profile["missing_pct"],
            "total_revenue": total_rev,
            "avg_transaction": avg_rev,
            "total_profit": total_profit,
            "profit_margin": round((total_profit / total_rev) * 100, 1) if total_rev > 0 and total_profit > 0 else None,
            "breakdowns": breakdowns,
            "insights": insights
        }

# Global singleton
analysis_engine = AnalysisEngine()
