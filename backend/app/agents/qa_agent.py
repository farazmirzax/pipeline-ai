from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from app.state import PipelineState

# We stick to the blazing-fast 3B model for quick code reviews
llm = ChatOllama(model="qwen2.5-coder:3b", base_url="http://127.0.0.1:11434")

def qa_agent_node(state: PipelineState):
    print("--- NODE: ADVERSARIAL QA ---")
    
    code_to_test = state.get("current_code", "")
    
    system_prompt = """You are an Adversarial Machine Learning QA Engineer.
    Your objective is to ruthlessly review the provided Python scikit-learn code.
    You must check for the following fatal flaws:
    1. Data Leakage (e.g., applying StandardScaler BEFORE splitting the data).
    2. Lack of proper train/test splitting.
    3. Missing print statements for evaluation metrics (Accuracy, F1, MSE).
    
    If the code is flawless and production-ready, output EXACTLY AND ONLY the word: PASS
    If the code has flaws, output a concise, bulleted list of what is wrong. DO NOT write the fixed code for them; just provide the feedback."""
    
    task = f"Review this code for ML flaws:\n\n{code_to_test}"
    
    response = llm.invoke([
        SystemMessage(content=system_prompt), 
        HumanMessage(content=task)
    ])
    
    feedback = response.content.strip()
    
    # Check if the model gave it the green light
    if "PASS" in feedback.upper() and len(feedback) < 10:
        print(">> QA Result: APPROVED")
        feedback = ""  # Clear the feedback string so the router knows it passed
    else:
        print(">> QA Result: REJECTED - Kicking back to ML Architect")
        print(f">> Reason: {feedback[:100]}...") # Print a snippet of the error
    
    return {
        "qa_feedback": feedback,
        "messages": [response]
    }