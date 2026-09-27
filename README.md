# DataLens AI 🔍⚡  
> *“Turn any dataset into verified decisions through conversation.”*  
> *“Upload your data. Ask anything. Understand everything.”*

---

## 🌟 Executive Overview

**DataLens AI** is an autonomous, domain-agnostic **AI Data Analysis Workspace & Decision Intelligence Copilot**. It bridges the gap between raw data and executive decision-making for non-technical users. 

Unlike conventional chatbots that hallucinate numbers and guess aggregates, DataLens AI executes a **deterministic two-stage pipeline**: natural language understanding generates an exact analysis plan, which is calculated directly within a **Python / Pandas execution kernel** to guarantee **100% verified ground truth numbers**.

```mermaid
flowchart LR
    A["Raw Dataset\n(CSV / Excel)"] --> B["Automated Schema &\nDomain Profiling"]
    B --> C["Hypothesis & Question\nEngine (5 Pillars)"]
    C --> D["User Prompt or\n1-Click Hypothesis"]
    D --> E["Python / Pandas\nExecution Engine"]
    E --> F["Verified Visualizations\n(Recharts Canvas)"]
    E --> G["Executive Takeaways &\nStrategic Narratives"]
    E --> H["Voice AI Briefing &\nExecutive PDF"]
```

---

## 🚀 Key Innovations & Flagship Capabilities

### 1. 🤖 Domain-Adaptive Analysis Workspace
* **Automated Hypothesis Generator**: Eliminates the "blank screen problem" by profiling any dataset and proposing 10+ categorized questions across 5 investigative pillars:
  * 🏆 **Performance & Volume Breakdowns**
  * 📈 **Trends & Timeline Velocity**
  * ⚠️ **Anomalies & 3x IQR Outliers**
  * 🔗 **Drivers & Pearson Correlations**
  * 📦 **Distribution & Composition Spread**
* **Universal Domain Intelligence**: Automatically adapts metrics and terminology to:
  * 🏥 **Healthcare & Clinical Diagnostics** (`systolic_bp`, `risk_score`, `department`)
  * 🛒 **Retail & Commercial Commerce** (`revenue`, `units_sold`, `region`)
  * 🎓 **Academic & Student Performance** (`midterm_score`, `study_hours`, `faculty`)
  * 💼 **SaaS Retention & Product Telemetry** (`monthly_revenue`, `churn_status`, `plan_tier`)
  * 📊 **Any Arbitrary CSV / Excel File** dropped by the user.

### 2. 🎙️ Voice AI "Executive Audio Briefing"
* Boardroom-ready spoken intelligence powered by browser-native Web Speech synthesis.
* Live equalizer waveform animation and 30-second spoken executive overview with key quantitative metrics, leading cohort shares, and risk alerts.
* Zero external API cost, ultra-low latency, and 100% offline-compatible.

### 3. 🔮 Prescriptive "What-If" Scenario Simulator
* Takes analytics from *descriptive* ("What happened?") to *prescriptive* ("What should we do?").
* Interactive sliders ($-50\%$ to $+100\%$) and cohort presets.
* Re-computes projected volume shifts, baseline vs. projected deltas, and dual Recharts bar charts in real time.

### 4. ⚖️ Cohort & Segment Comparator
* Direct head-to-head benchmarking between any two segments (e.g. *North vs. South*, *Cardiology vs. Neurology*, *Enterprise vs. Starter*).
* Generates a side-by-side Metric Scorecard with percentage variance, volume shares, and advantage leader badges.

### 5. 🧹 1-Click AI Data Sanitation & Export
* Automated statistical cleaning using **3x IQR Winsorization** (clipping outliers without dropping valid rows).
* Intelligent missing value imputation (median for numericals, standardized tags for categoricals).
* Download sanitized CSV ready for data science pipelines.

### 6. 📄 Boardroom-Ready Executive PDF Report
* Compiles an executive summary, high-level metrics, and bulleted takeaways into an exportable, printable PDF.

---

## 📐 3-Page Dedicated Application Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DATALENS AI STUDIO                            │
├─────────────────────┬───────────────────┬──────────────────────────────┤
│ 1. AI Workspace     │ 2. Dashboard      │ 3. Insights Engine           │
│ - Natural Language  │ - 4 KPI Cards     │ - Autonomous Proactive       │
│ - 5 Pillar Hypotheses│ - Revenlo Charts  │   Statistical Discoveries    │
│ - Python GroundTruth│ - Donut Breakdown │ - Severe Outlier Alerts      │
│ - Code Transparency │ - Records Table   │ - Pearson Drivers (|r|>=0.45)│
└─────────────────────┴───────────────────┴──────────────────────────────┘


## 🧪 Tech Stack & Engineering Rigor

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons | Responsive modern SaaS workspace with dark/light themes |
| **Backend API** | FastAPI, Uvicorn, Pydantic, Python 3.12 | High-throughput async REST API serving static SPA bundle |
| **Data Engine** | Pandas, NumPy, Scipy | Ground-truth mathematical calculations, 3x IQR outliers, Pearson correlation |
| **Voice AI** | Native HTML5 Web Speech Synthesis API | Zero-latency executive verbal speech synthesis |
| **LLM Reasoning** | Google Gemini / Groq / Ollama (Llama 3) / OpenAI | Fallback-resilient natural language explanation synthesis |

