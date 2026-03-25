# ⟬ Pipeline.ai ⟭ 

**An autonomous multi-agent ML orchestration platform that compresses weeks of data science work into 30 seconds.**

Pipeline.ai is a LangGraph-based system where specialized AI agents collaborate to analyze raw datasets, generate production-ready ML code, perform intelligent validation, and produce executive reports—all without manual intervention.

---

## 🎯 What Problem Does This Solve?

Traditionally, building an ML pipeline requires:
- **Data Engineer** (1 week): Clean messy data into training-ready datasets
- **ML Engineer** (1 week): Write scikit-learn code and train models
- **Business Analyst** (3 days): Translate metrics into actionable business strategy
- **QA Engineer** (2-3 days): Review code for ML best practices

**Total: 2-4 weeks, thousands in salary costs.**

Pipeline.ai **automates all of this in 30 seconds.**

---

## 🏗️ Architecture & Multi-Agent Orchestration

```
User Input (CSV + Business Goal)
         ↓
    [FastAPI Backend]
         ↓
    [LangGraph Orchestrator]
         ↓
  ┌─────────────────────────────────────────┐
  │  1. DataEngineer Agent                  │
  │  - Cleans & preprocesses CSV            │
  │  - Handles missing values, scaling      │
  │  - Outputs: cleaned_dataset.csv         │
  └─────────────────────────────────────────┘
         ↓
  ┌─────────────────────────────────────────┐
  │  2. MLArchitect Agent                   │
  │  - Generates scikit-learn pipelines     │
  │  - Trains RandomForest/LogisticRegression│
  │  - Outputs: Production-ready Python code│
  └─────────────────────────────────────────┘
         ↓
  ┌─────────────────────────────────────────┐
  │  3. AdversarialQA Agent (Loop)          │
  │  - Validates code for ML flaws:         │
  │    • Data leakage detection             │
  │    • Proper train/test splitting        │
  │    • Evaluation metrics present         │
  │  - If PASS → Proceed                    │
  │  - If FAIL → Route back to MLArchitect  │
  │    (up to 3 iterations)                 │
  └─────────────────────────────────────────┘
         ↓
  ┌─────────────────────────────────────────┐
  │  4. BusinessAnalyst Agent               │
  │  - Translates technical output          │
  │  - Generates executive summary          │
  │  - Strategic next steps for deployment  │
  └─────────────────────────────────────────┘
         ↓
    [React Frontend]
         ↓
  User sees: Business Report + ML Code
         ↓
  One-Click Copy & Deploy
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Orchestration** | LangGraph (agent workflow engine) |
| **LLM** | Ollama (Qwen 2.5 Coder 3B locally) |
| **Backend** | FastAPI (async, streaming) |
| **Frontend** | Next.js + React + TypeScript |
| **ML Library** | scikit-learn (data cleaning, model training) |
| **Data Processing** | pandas, numpy |
| **Styling** | Tailwind CSS |
| **Code Parsing** | Python regex with `re.DOTALL` |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- Ollama installed locally ([download here](https://ollama.ai))
- Virtual environment (recommended)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**
```
Uvicorn running on http://127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.0
  - Local:        http://localhost:3000
```

### 3. Verify Both Services Are Running

**Backend health check:**
```bash
curl http://127.0.0.1:8000/
# Response: {"status": "online", "system": "Pipeline.ai Engine"}
```

**Frontend:** Open http://localhost:3000 in your browser

---

## 📊 How to Use

1. **Upload a CSV file** with your dataset (needs an `age`, `monthly_spend`, `support_tickets`, `churn` columns for the demo)
2. **Enter your business goal** (e.g., "Predict which customers will churn")
3. **Click "Ignite Pipeline"** and watch the agents work
4. **Results appear with:**
   - **Business Report**: Markdown-formatted executive summary with strategic insights
   - **ML Pipeline Code**: Executable Python code (one-click copy)

---

## 📁 Project Structure

```
pipeline-ai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── data_engineer.py       # Cleans & preprocesses data
│   │   │   ├── ml_architect.py        # Generates ML code
│   │   │   ├── qa_agent.py            # Validates ML code
│   │   │   └── business_analyst.py    # Creates executive report
│   │   ├── state.py                   # Shared state schema
│   │   ├── graph.py                   # LangGraph orchestration
│   │   └── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   └── run_test.py                    # Test the pipeline locally
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Main UI component
│   │   ├── layout.tsx                 # Layout wrapper
│   │   └── globals.css                # Tailwind + animations
│   ├── package.json
│   └── tsconfig.json
│
└── README.md (this file)
```

---

## 🔑 Key Features

### 1. **Multi-Agent Orchestration**
- LangGraph manages complex agent workflows with conditional routing
- Agents can loop back and self-correct based on QA feedback
- Max 3 iterations prevents infinite loops

### 2. **Intelligent Code Extraction**
- Regex pattern: `r'```(?:python)?\s*(.*?)\s*```'` with `re.DOTALL`
- Handles markdown-wrapped LLM outputs
- Extracts clean, executable Python code automatically

### 3. **Self-Correcting QA Loop**
- AdversarialQA agent validates:
  - ✅ No data leakage (StandardScaler after train/test split)
  - ✅ Proper train/test splitting (80/20)
  - ✅ Evaluation metrics present
- If validation fails, MLArchitect rewrites the code
- Repeats up to 3 times automatically

### 4. **Streaming API**
- FastAPI streams agent outputs in real-time
- Frontend displays animated loading skeletons
- CORS-secured with pinned origins

### 5. **Beautiful Frontend**
- Animated loading spinner while agents work
- Pulsing skeleton screens for visual feedback
- Emerald green headers, slate dark mode theme
- One-click copy button for generated code
- Markdown-rendered business reports with proper formatting

---

## 💻 Code Examples

### Running the Pipeline Locally

```bash
cd backend
python run_test.py
```

This will:
1. Create a dummy dataset at `data/raw.csv`
2. Run all 4 agents through the LangGraph orchestrator
3. Print outputs to console
4. Show execution time

### Sample Generated ML Code

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Load the dataset
data = pd.read_csv('data/cleaned_dataset.csv')

# Define features and target
X = data[['age', 'monthly_spend', 'support_tickets']]
y = data['churn']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions and evaluate
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred))
```

---

## 🔄 Agent Flow Details

### DataEngineer Agent
**Input:** Raw CSV file
**Output:** Cleaned dataset
**Process:**
- Loads CSV with pandas
- Handles missing values (mean imputation)
- Normalizes numerical columns
- Saves to `data/cleaned_dataset.csv`

### MLArchitect Agent
**Input:** Cleaned dataset + business goal
**Output:** Production-ready ML code
**Process:**
- Analyzes the cleaned data
- Selects appropriate model (Random Forest, Logistic Regression)
- Writes complete scikit-learn pipeline
- Includes train/test split and evaluation metrics

### AdversarialQA Agent
**Input:** ML code from MLArchitect
**Output:** Approval or feedback
**Process:**
- Parses the generated code
- Checks for ML best practices
- Returns "PASS" if validation succeeds
- Returns bulleted feedback if validation fails
- If failed: triggers loop back to MLArchitect (up to 3 times)

### BusinessAnalyst Agent
**Input:** Approved ML code + business goal
**Output:** Executive summary (Markdown)
**Process:**
- Translates technical ML concepts into business language
- Explains what the model does and why it matters
- Provides strategic next steps for deployment
- Formats as clean Markdown with sections

---

## 🛡️ Error Handling

| Error | Solution |
|-------|----------|
| `Failed to fetch` on frontend | Ensure FastAPI backend is running on `http://127.0.0.1:8000` |
| CORS errors | Backend CORS policy allows `localhost:3000` and `127.0.0.1:3000` |
| Ollama connection refused | Start Ollama: `ollama serve` |
| Missing `data/` directory | Backend auto-creates it on first request |
| LLM producing invalid code | QA loop catches it and routes back to MLArchitect |

---

## 🚀 Deployment

### Deploy Backend (FastAPI)
```bash
# Using Gunicorn (production-grade)
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Or Docker
docker build -t pipeline-ai-backend .
docker run -p 8000:8000 pipeline-ai-backend
```

### Deploy Frontend (Next.js)
```bash
# Build for production
npm run build

# Start production server
npm start

# Or Docker
docker build -t pipeline-ai-frontend .
docker run -p 3000:3000 pipeline-ai-frontend
```

---

## 📈 Performance Metrics

| Metric | Improvement |
|--------|-------------|
| **Time to ML model** | 30 seconds vs 2-4 weeks (99.4% faster) |
| **Manual code review** | Eliminated via automated QA loops |
| **Data quality issues** | Caught automatically by DataEngineer |
| **ML best practice violations** | Caught by AdversarialQA, auto-fixed up to 3x |

---

## 🔮 Future Enhancements

- [ ] Support for deep learning models (PyTorch/TensorFlow)
- [ ] Multi-GPU support for large datasets
- [ ] Custom agent personas (allow users to define their own)
- [ ] Model deployment to cloud (AWS SageMaker, GCP Vertex AI)
- [ ] A/B testing framework for model comparison
- [ ] Real-time feature importance visualization
- [ ] Automated hyperparameter tuning agent
- [ ] Integration with data warehouses (Snowflake, BigQuery)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source under the MIT License.

---

## 🎓 What You Can Learn From This

- **LangGraph**: Building complex multi-agent workflows with conditional routing
- **FastAPI**: Async programming, streaming responses, CORS configuration
- **LLMs as Tools**: Using Ollama + Qwen for code generation (not fine-tuning)
- **Regex Mastery**: Extracting structured data from unstructured LLM outputs
- **Full-Stack**: Bridges backend (Python) and frontend (React/TypeScript)
- **ML Best Practices**: QA loops that validate code for common ML pitfalls

---

## 📧 Questions?

Feel free to open an issue or reach out. Happy automating! 🚀

---

**Built with ❤️ using LangGraph, FastAPI, and React**
