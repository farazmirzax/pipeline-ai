from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from app.graph import app_graph

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

@app.get("/")
async def health_check():
    return {"status": "online", "system": "Pipeline.ai Engine"}

# --- THE MAGIC ENDPOINT ---
@app.post("/api/run-pipeline")
async def run_pipeline_endpoint(
    file: UploadFile = File(...), 
    goal: str = Form(...)
):
    print(f"\n[API] Received target goal: {goal}")
    print(f"[API] Received file: {file.filename}")

    # 1. Save the uploaded file to our local data directory
    os.makedirs("data", exist_ok=True)
    file_path = "data/raw.csv" # Overwrite raw.csv for the agents
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Define the starting state for the graph
    initial_state = {
        "business_goal": goal,
        "original_data_path": file_path,
        "cleaned_data_path": "",
        "current_code": "",
        "qa_feedback": "",
        "iteration_count": 0,
        "messages": []
    }

    # 3. Spin up the AI Agents!
    config = {"recursion_limit": 15}
    final_code = ""
    final_report = ""

    try:
        # Stream through the graph exactly like we did in run_test.py
        for output in app_graph.stream(initial_state, config=config):
            for node_name, state_update in output.items():
                print(f"[API] Agent Finished: {node_name}")
                
                # Capture the outputs as they fly by
                if "current_code" in state_update:
                    final_code = state_update["current_code"]
                if "final_report" in state_update:
                    final_report = state_update["final_report"]

        # 4. Return the final payload back to React
        print("[API] Pipeline Complete. Sending data back to frontend.")
        return {
            "report": final_report,
            "code": final_code
        }

    except Exception as e:
        print(f"[API] ERROR: {str(e)}")
        return {"error": str(e)}