import os
import shutil
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
    profile = analysis_engine.get_profile(dataset_id)
    if not profile:
        return {"questions": [
            "What are the main trends?",
            "Which products perform best?",
            "Are there unusual values?",
            "What factors affect sales?",
            "Generate a business summary"
        ]}

    num_cols = profile.get("numerical_cols", [])
    cat_cols = profile.get("categorical_cols", [])
    date_cols = profile.get("datetime_cols", [])

    rev_col = next((c for c in num_cols if any(k in c.lower() for k in ["rev", "sales", "mrr", "amount", "total"])), num_cols[0] if num_cols else "values")
    primary_cat = cat_cols[0] if cat_cols else "category"
    second_cat = cat_cols[1] if len(cat_cols) > 1 else primary_cat

    questions = [
        f"Which {primary_cat} generated the most {rev_col}?",
        f"What are the main trends in {rev_col} over time?",
        f"Which {second_cat}s perform best?",
        f"Are there unusual values in {rev_col}?",
        f"What factors affect {rev_col}?",
        f"Why did sales decrease in March?",
        f"Generate a business summary"
    ]
    return {"questions": questions}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
