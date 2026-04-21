from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
import shutil

from app.db import Base, engine, get_db
from app.models import PipelineRun
from app.services import execute_pipeline_run


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "data" / "uploads"

# Initialize the enterprise-grade API
app = FastAPI(
    title="Pipeline.ai Core API",
    description="Backend execution engine for the autonomous data science MAS",
    version="1.0.0",
)

# Configure CORS so your Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Lock it down to your Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def health_check():
    return {"status": "online", "system": "Pipeline.ai Engine"}


@app.get("/api/status/{run_id}")
async def get_pipeline_status(run_id: int, db: Session = Depends(get_db)):
    run = db.get(PipelineRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    return {
        "run_id": run.id,
        "status": run.status,
        "report": run.final_report,
        "code": run.generated_code,
        "error": run.error_message,
    }


@app.get("/api/history")
async def get_pipeline_history(db: Session = Depends(get_db)):
    runs = db.scalars(select(PipelineRun).order_by(PipelineRun.created_at.desc())).all()

    return [
        {
            "run_id": run.id,
            "goal": run.goal,
            "dataset_path": run.dataset_path,
            "status": run.status,
            "created_at": run.created_at,
            "updated_at": run.updated_at,
            "has_report": bool(run.final_report),
            "has_code": bool(run.generated_code),
        }
        for run in runs
    ]


@app.get("/api/history/{run_id}")
async def get_pipeline_run_details(run_id: int, db: Session = Depends(get_db)):
    run = db.get(PipelineRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    return {
        "run_id": run.id,
        "goal": run.goal,
        "dataset_path": run.dataset_path,
        "status": run.status,
        "report": run.final_report,
        "code": run.generated_code,
        "error": run.error_message,
        "created_at": run.created_at,
        "updated_at": run.updated_at,
    }


# --- THE MAGIC ENDPOINT ---
@app.post("/api/run-pipeline")
async def run_pipeline_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    goal: str = Form(...),
    db: Session = Depends(get_db),
):
    print(f"\n[API] Received target goal: {goal}")
    print(f"[API] Received file: {file.filename}")

    # 1. Save the uploaded file to our local data directory
    original_suffix = Path(file.filename or "dataset.csv").suffix or ".csv"
    stored_filename = f"{uuid4().hex}{original_suffix}"
    stored_path = UPLOADS_DIR / stored_filename

    with stored_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    run = PipelineRun(
        goal=goal,
        dataset_path=str(stored_path.relative_to(BASE_DIR)),
        status="running",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    background_tasks.add_task(execute_pipeline_run, run.id)

    print("[API] Pipeline queued. Returning run metadata to frontend.")
    return {
        "run_id": run.id,
        "status": run.status,
    }
