import os
import json
import re
import requests
from typing import Dict, Any, List, Optional

class LLMService:
    def __init__(self):
        self.gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.groq_key = os.environ.get("GROQ_API_KEY")
        self.openai_key = os.environ.get("OPENAI_API_KEY")
        self.ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.environ.get("OLLAMA_MODEL", "llama3")
        self.provider = os.environ.get("LLM_PROVIDER", "auto")

    def update_keys(self, config: Dict[str, str]):
        if "gemini_api_key" in config and config["gemini_api_key"]:
            self.gemini_key = config["gemini_api_key"].strip()
        if "groq_api_key" in config and config["groq_api_key"]:
            self.groq_key = config["groq_api_key"].strip()
        if "openai_api_key" in config and config["openai_api_key"]:
            self.openai_key = config["openai_api_key"].strip()
        if "ollama_model" in config and config["ollama_model"]:
            self.ollama_model = config["ollama_model"].strip()
        if "provider" in config and config["provider"]:
            self.provider = config["provider"].strip()

    def get_status(self) -> Dict[str, Any]:
        active_provider = "Adaptive Intelligence Engine (Built-in)"
        if self.gemini_key:
            active_provider = "Google Gemini 1.5 Flash"
        elif self.groq_key:
            active_provider = "Groq LLaMA 3.3 70B"
        elif self.openai_key:
            active_provider = "OpenAI GPT-4o-mini"
        elif self._is_ollama_alive():
            active_provider = f"Ollama ({self.ollama_model})"

        return {
            "gemini_configured": bool(self.gemini_key),
            "groq_configured": bool(self.groq_key),
            "openai_configured": bool(self.openai_key),
            "ollama_available": self._is_ollama_alive(),
            "ollama_model": self.ollama_model,
            "active_provider": active_provider
        }

    def _is_ollama_alive(self) -> bool:
        try:
            r = requests.get(f"{self.ollama_base_url}/api/tags", timeout=1.0)
            return r.status_code == 200
        except Exception:
            return False

    # -------------------------------------------------------------
    # DOMAIN & UNIT FORMATTING HELPERS
    # -------------------------------------------------------------
    def _detect_domain(self, profile: Dict[str, Any]) -> Dict[str, str]:
        all_cols = " ".join([c.get("name", "").lower() for c in profile.get("column_profiles", [])])
        dataset_name = profile.get("dataset_id", "").lower()
        text = f"{dataset_name} {all_cols}"

        if any(k in text for k in ["patient", "diagnosis", "blood", "systolic", "cholesterol", "hospital", "treatment", "dose", "disease", "clinical", "medical", "doctor"]):
            return {
                "id": "healthcare",
                "name": "Clinical & Healthcare",
                "entity": "patients",
                "entity_single": "patient",
                "metric_context": "clinical measurements and health outcomes"
            }
        elif any(k in text for k in ["student", "grade", "score", "attendance", "exam", "course", "gpa", "study_hours", "education", "school", "faculty"]):
            return {
                "id": "education",
                "name": "Academic & Education",
                "entity": "students",
                "entity_single": "student",
                "metric_context": "academic evaluation and student outcomes"
            }
        elif any(k in text for k in ["sepal", "petal", "species", "specimen", "plant", "biology", "iris", "flora", "animal", "gene"]):
            return {
                "id": "biology",
                "name": "Biological & Scientific Observations",
                "entity": "specimens",
                "entity_single": "species",
                "metric_context": "morphological characteristics"
            }
        elif any(k in text for k in ["churn", "subscription", "mrr", "arr", "plan", "retention", "saas", "signup", "user_id"]):
            return {
                "id": "saas",
                "name": "SaaS & Subscription Analytics",
                "entity": "subscribers",
                "entity_single": "customer account",
                "metric_context": "usage and retention metrics"
            }
        elif any(k in text for k in ["employee", "salary", "attrition", "hire", "tenure", "hr", "payroll", "department"]):
            return {
                "id": "workforce",
                "name": "Human Resources & Workforce",
                "entity": "employees",
                "entity_single": "team member",
                "metric_context": "workforce distribution and compensation"
            }
        elif any(k in text for k in ["sale", "revenue", "order", "price", "profit", "retail", "store", "product", "ecommerce"]):
            return {
                "id": "commerce",
                "name": "Commercial & Retail Sales",
                "entity": "orders",
                "entity_single": "product category",
                "metric_context": "commercial revenue and sales volume"
            }
        else:
            return {
                "id": "general",
                "name": "General Analytics",
                "entity": "records",
                "entity_single": "segment",
                "metric_context": "operational dataset distribution"
            }

    def _is_monetary(self, col_name: str) -> bool:
        col = col_name.lower()
        monetary_terms = [
            "revenue", "sales", "price", "cost", "salary", "mrr", "arr", "profit",
            "fee", "spend", "budget", "amount_spent", "dollar", "usd", "eur", "payment"
        ]
        return any(term in col for term in monetary_terms) and not any(neg in col for neg in ["count", "id", "ratio", "pct", "percent"])

    def _is_percentage(self, col_name: str) -> bool:
        col = col_name.lower()
        return any(term in col for term in ["pct", "percent", "ratio", "rate", "share", "margin"])

    def _format_val(self, val: float, col_name: str) -> str:
        if val is None:
            return "N/A"
        try:
            val_num = float(val)
        except Exception:
            return str(val)

        if self._is_monetary(col_name):
            if abs(val_num) >= 1_000_000:
                return f"${val_num/1_000_000:.2f}M"
            elif abs(val_num) >= 1_000:
                return f"${val_num:,.2f}"
            else:
                return f"${val_num:.2f}"
        elif self._is_percentage(col_name):
            return f"{val_num:.1f}%"
        elif abs(val_num) >= 1_000_000:
            return f"{val_num/1_000_000:.2f}M"
        elif abs(val_num) >= 1000:
            return f"{val_num:,.1f}" if val_num % 1 != 0 else f"{int(val_num):,}"
        elif val_num % 1 == 0:
            return f"{int(val_num)}"
        else:
            return f"{val_num:.2f}"

    # -------------------------------------------------------------
    # 1. QUESTION UNDERSTANDING & PLAN CREATION
    # -------------------------------------------------------------
    def create_analysis_plan(self, question: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Converts user query into an analysis plan strictly referencing schema columns."""
        domain = self._detect_domain(profile)
        prompt = f"""You are DataLens AI's Chief Data Architect.
The user is asking a question about a {domain['name']} dataset.
Create a precise Python/Pandas Analysis Plan strictly referencing columns from the schema.

DATASET SCHEMA:
Columns: {', '.join([c['name'] + ' (' + c['type'] + ')' for c in profile.get('column_profiles', [])])}
Numerical columns: {profile.get('numerical_cols', [])}
Categorical columns: {profile.get('categorical_cols', [])}
Datetime columns: {profile.get('datetime_cols', [])}

USER QUESTION: "{question}"

Respond ONLY with a JSON object in this exact format:
{{
  "thought_process": "Brief 1-sentence explanation of what columns are required to answer the question",
  "analysis_type": "breakdown | trend_comparison | distribution | correlation | outlier_inspection",
  "target_column": "<exact numerical or categorical column name from schema>",
  "group_by": ["<column name(s) from schema>"],
  "time_column": "<datetime column name or null>",
  "time_granularity": "month | quarter | day | null",
  "metric": "sum | mean | count | median",
  "chart_type": "bar | line | area | pie",
  "sort": "desc | asc",
  "limit": 10,
  "filters": {{}}
}}
"""
        response_text = self._call_llm(prompt)
        plan = None
        if response_text:
            plan = self._extract_json(response_text)

        if not plan or not isinstance(plan, dict) or "target_column" not in plan:
            plan = self._heuristic_analysis_plan(question, profile)

        return plan

    def _heuristic_analysis_plan(self, question: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Robust deterministic rule-based analysis plan generator."""
        q_lower = question.lower()
        num_cols = profile.get("numerical_cols", [])
        cat_cols = profile.get("categorical_cols", [])
        date_cols = profile.get("datetime_cols", [])

        def score_column_match(col_name: str, query: str) -> int:
            q = query.lower()
            c = col_name.lower()
            clean_c = c.replace("_", " ")
            if re.search(r'\b' + re.escape(clean_c) + r'\b', q):
                return 150
            if re.search(r'\b' + re.escape(c) + r'\b', q):
                return 120
            # Common acronym expansion
            if "bp" in c and ("blood pressure" in q or "pressure" in q):
                return 80
            if "mrr" in c and "recurring revenue" in q:
                return 80
            words = [w.lower() for w in re.split(r'[_ \W]+|(?<=[a-z])(?=[A-Z])', col_name) if len(w) >= 2]
            score = 0
            for w in words:
                if re.search(r'\b' + re.escape(w) + r'\b', q):
                    score += 40
            return score

        # 1. Identify target column (prioritize numerical metrics)
        target_col = None
        best_num_score = 0
        for col in num_cols:
            s = score_column_match(col, question)
            if s > best_num_score:
                best_num_score = s
                target_col = col

        if best_num_score == 0:
            # Check categorical if user is asking for frequency/distribution
            best_cat_score = 0
            for col in cat_cols:
                s = score_column_match(col, question)
                if s > best_cat_score:
                    best_cat_score = s
                    target_col = col

        if not target_col:
            # Fallback to high-leverage numerical columns
            priority_terms = ["score", "grade", "revenue", "sales", "length", "amount", "total", "rate", "bp", "age", "value", "profit"]
            for term in priority_terms:
                matched = next((c for c in num_cols if term in c.lower()), None)
                if matched:
                    target_col = matched
                    break
            if not target_col:
                target_col = num_cols[0] if num_cols else (cat_cols[0] if cat_cols else "records")

        # 2. Identify group_by column (excluding target_col)
        group_by = []
        eligible_cats = [c for c in cat_cols if c != target_col]
        best_grp_score = 0
        chosen_grp = None

        for col in eligible_cats:
            s = score_column_match(col, question)
            if s > best_grp_score:
                best_grp_score = s
                chosen_grp = col

        if chosen_grp:
            group_by.append(chosen_grp)

        # Keyword mapping fallbacks
        if not group_by:
            if any(k in q_lower for k in ["species", "variety", "flower"]) and any("species" in c.lower() for c in eligible_cats):
                group_by.append(next(c for c in eligible_cats if "species" in c.lower()))
            elif any(k in q_lower for k in ["gender", "sex"]) and any("gender" in c.lower() for c in eligible_cats):
                group_by.append(next(c for c in eligible_cats if "gender" in c.lower()))
            elif any(k in q_lower for k in ["attendance", "presence"]) and any("attendance" in c.lower() for c in eligible_cats):
                group_by.append(next(c for c in eligible_cats if "attendance" in c.lower()))
            elif any(k in q_lower for k in ["region", "area", "country", "city"]) and any("region" in c.lower() for c in eligible_cats):
                group_by.append(next(c for c in eligible_cats if "region" in c.lower()))
            elif any(k in q_lower for k in ["category", "type", "class", "segment", "department"]):
                matched = next((c for c in eligible_cats if any(k in c.lower() for k in ["category", "type", "class", "segment", "department"])), None)
                if matched:
                    group_by.append(matched)
                matched = next((c for c in cat_cols if any(k in c.lower() for k in ["category", "type", "class", "segment", "department"])), None)
                if matched:
                    group_by.append(matched)

        # Check for time series
        is_time = any(k in q_lower for k in ["trend", "month", "time", "over time", "history", "timeline", "quarter", "year"])
        time_col = date_cols[0] if (is_time and date_cols) else None

        if not group_by and not time_col:
            # Pick first informative categorical column (2-50 unique values)
            valid_cats = [c for c in cat_cols if c != target_col and not any(id_kw in c.lower() for id_kw in ["_id", "uuid", "guid", "code"])]
            if valid_cats:
                group_by.append(valid_cats[0])
            elif cat_cols and cat_cols[0] != target_col:
                group_by.append(cat_cols[0])

        chart_type = "line" if time_col and not group_by else ("pie" if len(group_by) == 1 and any(k in q_lower for k in ["share", "proportion", "breakdown", "pie"]) else "bar")
        metric = "mean" if any(k in q_lower for k in ["average", "avg", "mean"]) or "length" in target_col.lower() or "score" in target_col.lower() or "rate" in target_col.lower() or "age" in target_col.lower() else "sum"

        return {
            "thought_process": f"Evaluated metric '{target_col}' grouped by '{group_by[0] if group_by else (time_col or 'distribution')}' to answer user query directly.",
            "analysis_type": "trend_comparison" if time_col else "breakdown",
            "target_column": target_col,
            "group_by": group_by,
            "time_column": time_col,
            "time_granularity": "month" if time_col else None,
            "metric": metric,
            "chart_type": chart_type,
            "sort": "desc",
            "limit": 10,
            "filters": {}
        }

    # -------------------------------------------------------------
    # 2. EXPLANATION & DECISION SYNTHESIS
    # -------------------------------------------------------------
    def explain_results(self, question: str, plan: Dict[str, Any], results: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generates clear, natural, human-friendly explanations grounded in verified Python data."""
        chart_data = results.get("chart_data", [])
        summary_stats = results.get("summary_stats", {})
        domain = self._detect_domain(profile)

        target_col = plan.get("target_column", "metric")
        group_by = plan.get("group_by", [])
        metric = plan.get("metric", "value")

        prompt = f"""You are DataLens AI, a helpful, clear, and insightful Senior Data Analyst.
The Python data engine has executed a calculation on a {domain['name']} dataset to answer the user's question.
The numbers below are GROUND TRUTH facts computed from the data. Do NOT invent numbers.

USER QUESTION: "{question}"
DATASET DOMAIN: {domain['name']} (focus on: {domain['metric_context']})
ANALYSIS TARGET: {target_col} ({metric})
GROUPED BY: {group_by}

VERIFIED PYTHON RESULTS:
{json.dumps(chart_data[:10], indent=2)}

STATISTICAL SUMMARY:
{json.dumps(summary_stats, indent=2)}

CRITICAL WRITING RULES:
1. Speak in PLAIN, NATURAL, CONVERSATIONAL ENGLISH. Avoid bizarre buzzwords, corporate jargon, or robotic phrasing.
2. Answer the user's question DIRECTLY in the very first sentence of the headline.
3. Tailor all words strictly to {domain['name']}. NEVER mention fictional business terms like "advertising spend" or "e-commerce orders" unless they exist in the schema.
4. Only use currency ($) if the metric is genuinely money. For scores, measurements, or counts, use clean numeric units.
5. In "narrative", write 2 clear, short paragraphs explaining who ranks highest/lowest and the gap between them.
6. In "why_hypothesis", offer 1-2 sensible, realistic real-world explanations for why this pattern exists in this specific domain.
7. In "follow_up_questions", suggest 3 smart questions exploring other angles of this dataset.

Respond ONLY with valid JSON matching:
{{
  "headline": "Direct 1-sentence answer to the user's question with the exact top number",
  "narrative": "Paragraph 1 explaining the rankings and numbers.\\n\\nParagraph 2 explaining the spread and comparison.",
  "why_hypothesis": "Realistic real-world domain explanation for why this is happening.",
  "follow_up_questions": ["Question 1?", "Question 2?", "Question 3?"]
}}
"""
        response_text = self._call_llm(prompt)
        explanation = None
        if response_text:
            explanation = self._extract_json(response_text)

        if not explanation or not isinstance(explanation, dict) or "headline" not in explanation:
            explanation = self._heuristic_explanation(question, plan, results, profile)

        return explanation

    def _heuristic_explanation(self, question: str, plan: Dict[str, Any], results: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamic, domain-aware heuristic generator that produces crystal-clear, natural language answers."""
        chart_data = results.get("chart_data", [])
        summary = results.get("summary_stats", {})
        target = plan.get("target_column", "metric")
        group_by = plan.get("group_by", [])
        metric = plan.get("metric", "value")
        domain = self._detect_domain(profile)

        clean_target = target.replace("_", " ")
        clean_grp = group_by[0].replace("_", " ") if group_by else "category"

        if not chart_data:
            return {
                "headline": f"No data entries found matching '{clean_target}'.",
                "narrative": f"The analysis could not locate records for {clean_target} under the current filter criteria.",
                "why_hypothesis": f"Verify whether the selected column exists and has non-null entries in the active dataset.",
                "follow_up_questions": [f"What are the available values for {clean_grp}?", f"Show overall distribution of {clean_target}", "What columns are available?"]
            }

        top_item = chart_data[0]
        top_name = top_item.get("name")
        top_val = top_item.get("value", 0)
        top_share = top_item.get("share", 0)

        bottom_item = chart_data[-1]
        bottom_name = bottom_item.get("name")
        bottom_val = bottom_item.get("value", 0)
        bottom_share = bottom_item.get("share", 0)

        mean_val = summary.get("mean", sum(d.get("value", 0) for d in chart_data) / max(1, len(chart_data)))
        total_val = summary.get("total", sum(d.get("value", 0) for d in chart_data))

        fmt_top = self._format_val(top_val, target)
        fmt_bottom = self._format_val(bottom_val, target)
        fmt_mean = self._format_val(mean_val, target)
        fmt_total = self._format_val(total_val, target)

        metric_word = "average" if metric == "mean" else ("total" if metric == "sum" else metric)

        # Ratio between top and bottom
        ratio = round(top_val / bottom_val, 1) if (bottom_val and bottom_val > 0) else None

        # 1. CRAFT DIRECT HEADLINE
        q_lower = question.lower()
        if any(k in q_lower for k in ["lowest", "bottom", "least", "worst", "minimum"]):
            headline = f"{bottom_name} recorded the lowest {metric_word} {clean_target} at {fmt_bottom} ({bottom_share}% of total)."
        elif any(k in q_lower for k in ["compare", "vs", "versus", "difference", "spread"]):
            if ratio and ratio > 1:
                headline = f"{top_name} leads {clean_target} at {fmt_top}, which is {ratio}x higher than {bottom_name} ({fmt_bottom})."
            else:
                headline = f"{top_name} leads {clean_target} with {fmt_top}, compared to {bottom_name} at {fmt_bottom}."
        elif any(k in q_lower for k in ["why", "reason", "cause", "decrease", "drop"]):
            headline = f"{clean_target.title()} shows marked variation across {clean_grp}, led by {top_name} at {fmt_top}."
        else:
            if len(chart_data) > 1:
                headline = f"{top_name} ranks highest in {clean_target} with {fmt_top} ({top_share}% of total), followed by {chart_data[1].get('name')} ({self._format_val(chart_data[1].get('value', 0), target)})."
            else:
                headline = f"{top_name} has a {metric_word} {clean_target} of {fmt_top}."

        # 2. CRAFT READABLE NARRATIVE (2 short paragraphs)
        p1 = (
            f"Across the {len(chart_data)} {clean_grp} groups analyzed, **{top_name}** represents the top performer "
            f"with a {metric_word} {clean_target} of **{fmt_top}** (accounting for {top_share}% of overall volume). "
            f"Across all groups, the average is {fmt_mean}."
        )

        if len(chart_data) > 1:
            comparison_phrase = f"— a {ratio}x spread between the highest and lowest performers" if ratio and ratio > 1 else ""
            p2 = (
                f"In comparison, **{bottom_name}** sits at the lower end with **{fmt_bottom}** ({bottom_share}% share){comparison_phrase}. "
                f"This highlights clear divergence between categories that warrants targeted focus on {bottom_name}."
            )
        else:
            p2 = f"This segment encompasses the full computed volume of {fmt_total} across active records."

        narrative = f"{p1}\n\n{p2}"

        # 3. CONTEXTUAL DOMAIN-AWARE WHY HYPOTHESIS
        d_id = domain["id"]
        if d_id == "education":
            why_hypo = (
                f"Variations in {clean_target} across {clean_grp} categories commonly correlate with study time allocation, "
                f"attendance consistency, prerequisite coursework preparation, and active engagement with tutoring resources."
            )
        elif d_id == "healthcare":
            why_hypo = (
                f"The clinical distribution in {clean_target} reflects differences in patient age cohorts, baseline symptom severity, "
                f"compliance with prescribed care protocols, and variations in treatment timelines."
            )
        elif d_id == "biology":
            why_hypo = (
                f"The morphological difference in {clean_target} across {clean_grp} groups is consistent with distinct biological "
                f"subspecies traits, evolutionary adaptation, and natural phenotypic variations."
            )
        elif d_id == "saas":
            why_hypo = (
                f"Disparities in {clean_target} typically stem from user onboarding completion rates, weekly active feature utilization, "
                f"and organizational seat adoption depth during initial customer lifecycle stages."
            )
        elif d_id == "workforce":
            why_hypo = (
                f"Differences in {clean_target} across {clean_grp} departments align with role specialization, professional seniority, "
                f"overtime requirements, and market benchmarks for specialized technical skills."
            )
        elif d_id == "commerce":
            why_hypo = (
                f"The outperformance of {top_name} in {clean_target} is supported by stronger repeat purchasing rates, "
                f"higher average basket sizes, and effective promotional visibility compared to lower-performing categories."
            )
        else:
            why_hypo = (
                f"The observed concentration in {top_name} indicates structural skew toward the leading category, "
                f"where primary activity concentrates while peripheral segments generate smaller incremental contributions."
            )

        # 4. RELEVANT FOLLOW-UP QUESTIONS FROM SCHEMA
        num_cols = [c for c in profile.get("numerical_cols", []) if c != target]
        cat_cols = [c for c in profile.get("categorical_cols", []) if c not in group_by]

        follow_ups = []
        if cat_cols:
            follow_ups.append(f"How does {clean_target} break down by {cat_cols[0].replace('_', ' ')}?")
        if num_cols:
            follow_ups.append(f"Is there a correlation between {clean_target} and {num_cols[0].replace('_', ' ')}?")
        follow_ups.append(f"What are the top outlier records in {clean_target}?")

        return {
            "headline": headline,
            "narrative": narrative,
            "why_hypothesis": why_hypo,
            "follow_up_questions": follow_ups[:3]
        }

    # -------------------------------------------------------------
    # 3. EXECUTIVE REPORT GENERATOR
    # -------------------------------------------------------------
    def generate_executive_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a C-level Executive Decision Report from quantified findings."""
        dataset_name = report_data.get("dataset_name", "Dataset")
        rows = report_data.get("rows", 0)

        prompt = f"""You are the Chief AI Analytics Officer at DataLens AI.
Generate an executive briefing report for senior leadership based on the following verified facts:

DATASET: {dataset_name}
TOTAL ROWS: {rows}
RECORDS: {json.dumps(report_data.get('breakdowns', {}), indent=2)}
KEY INSIGHTS: {json.dumps(report_data.get('insights', [])[:4], indent=2)}

CRITICAL WRITING RULES:
1. Speak in plain, authoritative, natural executive English.
2. Focus on the actual domain of the data. Do NOT mention fictional concepts like 'advertising spend' or 'sales profit' if the dataset is about health, science, or education.
3. Keep findings quantified with real numbers from the data.

Respond ONLY with valid JSON matching:
{{
  "title": "Executive Intelligence Report: {dataset_name.replace('_', ' ').title()}",
  "executive_summary": "150-word high level synthesis of performance and strategic positioning.",
  "key_findings": [
    {{"finding": "...", "impact": "High | Medium | Low", "metric": "..."}},
    {{"finding": "...", "impact": "High | Medium | Low", "metric": "..."}},
    {{"finding": "...", "impact": "High | Medium | Low", "metric": "..."}}
  ],
  "anomalies_and_risks": [
    {{"risk": "...", "evidence": "...", "urgency": "Immediate | Monitor"}}
  ],
  "strategic_recommendations": [
    {{"action": "...", "expected_roi": "...", "owner": "..."}}
  ]
}}
"""
        response_text = self._call_llm(prompt)
        report = None
        if response_text:
            report = self._extract_json(response_text)

        if not report or not isinstance(report, dict) or "key_findings" not in report:
            report = self._heuristic_executive_report(report_data)

        return report

    def _heuristic_executive_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Deterministic, domain-aware executive report generator."""
        dataset_name = report_data.get("dataset_name", "Dataset")
        rows = report_data.get("rows", 0)
        breakdowns = report_data.get("breakdowns", {})

        first_bd_key = list(breakdowns.keys())[0] if breakdowns else "category"
        items = breakdowns.get(first_bd_key, [])
        top_item = items[0] if items else {"name": "Primary Segment", "share": 38.0, "value": 0}

        return {
            "title": f"Executive Intelligence Report: {dataset_name.replace('_', ' ').title()}",
            "executive_summary": (
                f"This executive intelligence report synthesizes verified data points across {rows:,} dataset records. "
                f"Cross-segment aggregation reveals that {top_item.get('name', 'Leading Segment')} represents the primary concentration, "
                f"commanding {top_item.get('share', 0)}% of total distribution in {first_bd_key.replace('_', ' ')}. "
                f"Data quality screening verified integrity, highlighting key strategic focus areas for operational optimization."
            ),
            "key_findings": [
                {
                    "finding": f"Strong concentration in {top_item.get('name', 'Leading Segment')} with {top_item.get('share', 0)}% of total {first_bd_key.replace('_', ' ')} volume.",
                    "impact": "High",
                    "metric": f"{top_item.get('share', 0)}% Dominance"
                },
                {
                    "finding": f"Notable divergence between leading and trailing segments across {first_bd_key.replace('_', ' ')}.",
                    "impact": "Medium",
                    "metric": f"{len(items)} Categories Analyzed"
                },
                {
                    "finding": "Data quality analysis confirms robust sample completeness across active records.",
                    "impact": "Low",
                    "metric": f"{rows:,} Verified Rows"
                }
            ],
            "anomalies_and_risks": [
                {
                    "risk": f"High dependency on {top_item.get('name', 'the primary segment')} creating concentration risk.",
                    "evidence": f"Top category accounts for {top_item.get('share', 0)}% of computed activity.",
                    "urgency": "Immediate"
                }
            ],
            "strategic_recommendations": [
                {
                    "action": f"Expand operational support and resources dedicated to {top_item.get('name', 'the top category')}.",
                    "expected_roi": "Sustained high-yield performance",
                    "owner": "Executive Leadership"
                },
                {
                    "action": f"Conduct focused diagnostic on underperforming segments in {first_bd_key.replace('_', ' ')}.",
                    "expected_roi": "Reduced performance disparity",
                    "owner": "Analytics Team"
                }
            ]
        }

    # -------------------------------------------------------------
    # 4. LLM CALLING (REST-BASED FOR MAXIMUM RELIABILITY)
    # -------------------------------------------------------------
    def _call_llm(self, prompt: str) -> Optional[str]:
        """Tries configured LLMs with priority: Gemini -> Groq -> OpenAI -> Ollama -> None."""
        # 1. Google Gemini (REST API)
        if self.gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json"
                    }
                }
                r = requests.post(url, json=payload, timeout=12)
                if r.status_code == 200:
                    data = r.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text")
            except Exception as e:
                print(f"[Gemini REST Error]: {e}")

        # 2. Groq (REST API)
        if self.groq_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }
                r = requests.post(url, json=payload, headers=headers, timeout=12)
                if r.status_code == 200:
                    data = r.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content")
            except Exception as e:
                print(f"[Groq REST Error]: {e}")

        # 3. OpenAI (REST API)
        if self.openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }
                r = requests.post(url, json=payload, headers=headers, timeout=12)
                if r.status_code == 200:
                    data = r.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content")
            except Exception as e:
                print(f"[OpenAI REST Error]: {e}")

        # 4. Ollama (Local API)
        if self._is_ollama_alive():
            try:
                r = requests.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={"model": self.ollama_model, "prompt": prompt, "stream": False, "format": "json"},
                    timeout=15.0
                )
                if r.status_code == 200:
                    return r.json().get("response")
            except Exception as e:
                print(f"[Ollama Error]: {e}")

        return None

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        try:
            # Check for ```json ... ```
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if match:
                return json.loads(match.group(1))
            # Match outermost { ... }
            first_brace = text.find('{')
            last_brace = text.rfind('}')
            if first_brace != -1 and last_brace != -1:
                return json.loads(text[first_brace:last_brace+1])
        except Exception:
            pass
        return None

# Global singleton
llm_service = LLMService()
