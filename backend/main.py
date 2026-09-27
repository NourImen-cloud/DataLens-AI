import os
import sys
import shutil

# Ensure current backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analysis_engine import analysis_engine
from llm_service import llm_service

app = FastAPI(
    title="DataLens AI API",
    description="Turn any dataset into decisions through conversation.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (usually localhost:5173 or localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

# Pre-load retail_sales_2026 on startup if exists
@app.on_event("startup")
def startup_event():
    retail_sample = os.path.join(DATASETS_DIR, "retail_sales_2026.csv")
    if os.path.exists(retail_sample):
        try:
            analysis_engine.load_dataset("retail_sales_2026", retail_sample)
            print("Loaded initial sample dataset: retail_sales_2026")
        except Exception as e:
            print(f"Could not load initial dataset: {e}")

class QueryRequest(BaseModel):
    dataset_id: str
    question: str
    custom_plan: Optional[Dict[str, Any]] = None

class ReportRequest(BaseModel):
    dataset_id: str

class SimulationRequest(BaseModel):
    target_metric: Optional[str] = None
    adjustment_pct: float = 10.0
    category_col: Optional[str] = None

class ComparisonRequest(BaseModel):
    category_col: str
    cohort_a: str
    cohort_b: str

class SettingsRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    ollama_model: Optional[str] = None
    provider: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "DataLens AI", "timestamp": "2026-09-27"}

@app.get("/api/settings")
def get_settings():
    return llm_service.get_status()

@app.post("/api/settings")
def update_settings(req: SettingsRequest):
    llm_service.update_keys(req.model_dump())
    return {"status": "updated", "current": llm_service.get_status()}

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename
    clean_id = os.path.splitext(filename)[0].replace(" ", "_")
    target_path = os.path.join(DATASETS_DIR, f"{clean_id}_{filename}")
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        profile = analysis_engine.load_dataset(clean_id, target_path)
        insights = analysis_engine.get_insights(clean_id)
        return {
            "success": True,
            "dataset_id": clean_id,
            "filename": filename,
            "profile": profile,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")

@app.get("/api/sample/{name}")
def load_sample_dataset(name: str):
    allowed = {
        "retail_sales": ("retail_sales_2026.csv", "retail_sales_2026"),
        "clinical_patients": ("clinical_patients.csv", "clinical_patients"),
        "student_performance": ("student_performance.csv", "student_performance"),
        "saas_churn": ("saas_churn_metrics.csv", "saas_churn_metrics")
    }
    if name not in allowed:
        raise HTTPException(status_code=404, detail="Sample dataset not found.")

    file_name, dataset_id = allowed[name]
    sample_path = os.path.join(DATASETS_DIR, file_name)
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample file missing on disk.")

    profile = analysis_engine.load_dataset(dataset_id, sample_path)
    insights = analysis_engine.get_insights(dataset_id)
    return {
        "success": True,
        "dataset_id": dataset_id,
        "filename": file_name,
        "profile": profile,
        "insights": insights
    }

@app.get("/api/dataset/{dataset_id}/profile")
def get_dataset_profile(dataset_id: str):
    profile = analysis_engine.get_profile(dataset_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return profile

@app.get("/api/dataset/{dataset_id}/insights")
def get_dataset_insights(dataset_id: str):
    insights = analysis_engine.get_insights(dataset_id)
    return {"insights": insights}

@app.get("/api/dataset/{dataset_id}/suggested-questions")
def get_suggested_questions(dataset_id: str):
    return analysis_engine.get_categorized_questions(dataset_id)

@app.post("/api/query")
def execute_query(req: QueryRequest):
    profile = analysis_engine.get_profile(req.dataset_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    # 1. QUESTION UNDERSTANDING & ANALYSIS PLAN
    if req.custom_plan:
        plan = req.custom_plan
    else:
        plan = llm_service.create_analysis_plan(req.question, profile)

    # 2. PYTHON / PANDAS EXECUTION ENGINE (GROUND TRUTH)
    try:
        results = analysis_engine.execute_plan(req.dataset_id, plan)
    except Exception as e:
        # Fallback plan if column mismatch occurred
        fallback_plan = {
            "target_column": profile["numerical_cols"][0] if profile["numerical_cols"] else profile["column_profiles"][0]["name"],
            "group_by": [profile["categorical_cols"][0]] if profile["categorical_cols"] else [],
            "metric": "sum",
            "chart_type": "bar",
            "sort": "desc",
            "limit": 10
        }
        results = analysis_engine.execute_plan(req.dataset_id, fallback_plan)
        plan = fallback_plan

    # 3. LLM INTERPRETS PYTHON GROUND TRUTH
    explanation = llm_service.explain_results(req.question, plan, results, profile)

    return {
        "question": req.question,
        "thought_process": plan.get("thought_process", f"Analyzed {plan.get('target_column')} grouped by {plan.get('group_by')}"),
        "analysis_plan": plan,
        "executed_python_code": results.get("executed_python_code"),
        "chart_type": results.get("chart_type", "bar"),
        "target_column": results.get("target_column"),
        "metric": results.get("metric"),
        "chart_data": results.get("chart_data", []),
        "summary_stats": results.get("summary_stats", {}),
        "headline": explanation.get("headline"),
        "narrative": explanation.get("narrative"),
        "why_hypothesis": explanation.get("why_hypothesis"),
        "follow_up_questions": explanation.get("follow_up_questions", [])
    }

@app.post("/api/executive-report")
def generate_executive_report(req: ReportRequest):
    try:
        report_data = analysis_engine.generate_executive_report_data(req.dataset_id)
        report = llm_service.generate_executive_report(report_data)
        return {
            "report_data": report_data,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dataset/{dataset_id}/audio-briefing")
def get_audio_briefing(dataset_id: str):
    try:
        return analysis_engine.generate_audio_briefing(dataset_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/dataset/{dataset_id}/simulate")
def simulate_scenario(dataset_id: str, req: SimulationRequest):
    try:
        return analysis_engine.simulate_scenario(
            dataset_id=dataset_id,
            target_metric=req.target_metric,
            adjustment_pct=req.adjustment_pct,
            category_col=req.category_col
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dataset/{dataset_id}/compare-options")
def get_compare_options(dataset_id: str):
    profile = analysis_engine.get_profile(dataset_id)
    df = analysis_engine.get_dataset(dataset_id)
    if not profile or df is None:
        raise HTTPException(status_code=404, detail="Dataset not loaded.")
    cat_cols = profile.get("categorical_cols", [])
    options = {}
    for c in cat_cols[:6]:
        vals = [str(v) for v in df[c].dropna().unique()[:20]]
        if len(vals) >= 2:
            options[c] = vals
    return {
        "dataset_id": dataset_id,
        "categorical_columns": list(options.keys()),
        "options": options
    }

@app.post("/api/dataset/{dataset_id}/compare")
def compare_cohorts(dataset_id: str, req: ComparisonRequest):
    try:
        return analysis_engine.compare_cohorts(
            dataset_id=dataset_id,
            category_col=req.category_col,
            cohort_a=req.cohort_a,
            cohort_b=req.cohort_b
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dataset/{dataset_id}/clean-export")
def clean_and_export(dataset_id: str, clip_outliers: bool = True, fill_missing: bool = True):
    try:
        res = analysis_engine.clean_and_export_dataset(dataset_id, clip_outliers, fill_missing)
        from fastapi.responses import Response
        return Response(
            content=res["csv_data"],
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={res['filename']}",
                "X-Outliers-Treated": str(res["outliers_treated"]),
                "X-Missing-Imputed": str(res["missing_values_imputed"])
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if frontend/dist exists to serve production static files
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_available_port(preferred: int = 8000, host: str = "127.0.0.1") -> int:
    if not is_port_in_use(preferred, host):
        return preferred
    candidates = [8080, 8008, 8090, 8888, 8501, 8001, 8002, 8003, 8004, 8005]
    for p in candidates:
        if not is_port_in_use(p, host):
            return p
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        return s.getsockname()[1]

if __name__ == "__main__":
    import uvicorn
    import argparse
    import webbrowser

    parser = argparse.ArgumentParser(description="DataLens AI Platform")
    parser.add_argument("--port", type=int, default=None, help="Port to run server on")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser automatically")
    args = parser.parse_args()

    env_port = int(os.environ.get("PORT")) if os.environ.get("PORT") else None
    requested_port = args.port or env_port or 8000

    actual_port = find_available_port(requested_port, args.host)
    if actual_port != requested_port:
        print(f"\n[DataLens AI] NOTICE: Port {requested_port} is busy/in use by another service.")
        print(f"[DataLens AI] Automatically switching to available port: {actual_port}\n")

    app_url = f"http://{args.host}:{actual_port}"
    print("=" * 60)
    print("           DATALENS AI - INTELLIGENCE WORKSPACE")
    print(f"       Running at: {app_url}")
    print("=" * 60 + "\n")

    import threading
    import time

    def open_browser_when_ready(url, p, h):
        time.sleep(0.5)
        for _ in range(30):
            if is_port_in_use(p, h):
                time.sleep(0.3)
                webbrowser.open(url)
                return
            time.sleep(0.2)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    if not args.no_browser:
        threading.Thread(target=open_browser_when_ready, args=(app_url, actual_port, args.host), daemon=True).start()

    uvicorn.run(app, host=args.host, port=actual_port)
