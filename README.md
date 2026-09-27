# DataLens AI 🔍⚡
> **GOMYCODE Hackathon: “Come Build with AI” (27 September 2026)**  
> *“Upload your data. Ask anything. Understand everything.”*

---

## 🏆 Project Architecture for Hackathon Jury

DataLens AI transforms any dataset into strategic decisions through natural language conversation without hallucinated numbers. 

### 📐 3-Page Dedicated Experience (As Designed)

#### 1. 🤖 Page 1: AI Assistant (Conversational Decision Engine)
- Inspired by modern, minimalist prompt centers (glowing 3D ambient sphere, *"Hello, Jackson — How can I assist you today?"*).
- **Core Value Brief**: Tells the user what the AI does before prompting.
- **Sleek Input Hub**:
  - Direct `Attach CSV / Excel` button and drag-and-drop file ingestion.
  - Active dataset pill with record count.
  - One-click multi-domain benchmark loaders (`Retail Sales`, `Healthcare Clinical Patients`, `Student Academic Performance`, `SaaS Retention`).
- **Execution Pipeline Transparency**:
  - Displays generated **Analysis Plan (JSON)**
  - Shows executed **Python/Pandas Code**
  - Interactive Recharts visualization (Bar, Line, Area, Donut switcher)
  - Verified quantitative explanation with *"Why might this be happening?"* reasoning and follow-up inquiries.

#### 2. 📊 Page 2: Executive Dashboard (Pattern Synthesis & Explorer)
- Modeled after elite enterprise SaaS dashboards (Revenlo-inspired).
- **4 Key Metric Cards**: Primary average/total, volume, 3x IQR anomaly flags, and data cleanliness rate.
- **Performance Overview**: Smooth curved area/line chart with hover tooltips and dynamic timeline trends.
- **Segment Breakdown**: Multi-color donut ring with centered leader percentage and interactive legend.
- **Records Explorer**: Tabular inspector with search, pagination, and status pills (`Verified`, `High Outlier`).

#### 3. ⚡ Page 3: Autonomous Statistical Insights
- Proactively discovers hidden patterns without user prompts:
  - **Growth Trends**: Positive trajectory or seasonal drops.
  - **Structural Anomalies**: Specific period compressions (e.g. March dip).
  - **Severe Outliers**: 3x IQR extreme transaction filtering.
  - **Correlation Matrix**: Key statistical drivers (Pearson |r| >= 0.45).
  - **Dominant Segments**: Market and category leadership shares.
  - **Data Completeness**: Missing values notification.

---

## 🛡️ Universal Data Support (Not Just Economic)

DataLens AI is **domain-agnostic** and operates across all fields:
1. **Retail & Commerce**: `retail_sales_2026.csv` (12,450 rows · revenue, profit, ad spend, March dip).
2. **Healthcare & Medicine**: `clinical_patients.csv` (3,500 rows · blood pressure, cholesterol, BMI, risk score, recovery days).
3. **Education & Academia**: `student_performance.csv` (4,200 rows · study hours, attendance rate, midterm, final score, pass status).
4. **Technology & SaaS**: `saas_churn_metrics.csv` (5,200 rows · MRR, tenure, tickets, churn status).
5. **Custom Uploads**: Drop any raw `.csv`, `.xlsx`, or `.xls` file.

---

## 🚀 Running the Platform

1. **Access Live**:
   👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

2. **One-Click Launch**:
   Double click `run_app.bat` or run:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
