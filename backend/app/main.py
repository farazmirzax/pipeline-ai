from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize the enterprise-grade API
app = FastAPI(
    title="Pipeline.ai Core API",
    description="Backend execution engine for the autonomous data science MAS",
    version="1.0.0",
)

# Configure CORS so your future React/Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We can lock this down to localhost:3000 later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple health-check endpoint to verify the engine is running
@app.get("/")
async def health_check():
    return {
        "status": "online", 
        "system": "Pipeline.ai Orchestration Engine",
        "message": "Awaiting dataset payload..."
    }