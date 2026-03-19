import re
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from app.state import PipelineState

# Connect to the local Qwen instance
llm = ChatOllama(model="qwen2.5-coder:3b", base_url="http://127.0.0.1:11434")


def extract_code_from_output(raw_output: str) -> str:
    """
    Extract executable code from markdown code blocks in the model's output.
    
    Handles:
    - Multiline code blocks (re.DOTALL)
    - Optional 'python' language specifier after backticks
    - Falls back to raw output if no code blocks found
    
    Args:
        raw_output: The full text response from the model
        
    Returns:
        Extracted code, or the stripped raw output if no code blocks found
    """
    pattern = r'```(?:python)?\s*(.*?)\s*```'
    match = re.search(pattern, raw_output, re.DOTALL)
    
    if match:
        return match.group(1).strip()
    else:
        return raw_output.strip()


def ml_architect_node(state: PipelineState):
    print("--- NODE: ML ARCHITECT ---")
    
    goal = state.get("business_goal", "Train a machine learning model")
    cleaned_path = state.get("cleaned_data_path", "data/cleaned_dataset.csv")
    qa_feedback = state.get("qa_feedback", "")
    
    # Define the persona
    system_prompt = """You are a Lead Machine Learning Architect. 
    Your objective is to write a Python script using scikit-learn to train a predictive model.
    The script must load the dataset, perform a train/test split, train a model appropriate for the goal, and print the evaluation metrics.
    
    CRITICAL: Output ONLY raw, executable Python code. Do not include markdown blocks (```python) or explanations.
    """
    
    # Construct the task dynamically based on the state
    task = f"The cleaned data is located at: {cleaned_path}\nThe ultimate business goal is: {goal}\n"
    
    # If the QA agent rejected a previous model, force the ML Architect to fix it
    if qa_feedback:
        print(">> Incorporating QA Feedback...")
        task += f"\nURGENT QA FEEDBACK TO FIX IN YOUR NEW CODE:\n{qa_feedback}\n"
        
    # Trigger the model
    response = llm.invoke([
        SystemMessage(content=system_prompt), 
        HumanMessage(content=task)
    ])
    
    generated_code = extract_code_from_output(response.content)
    
    # Overwrite the 'current_code' state with the new ML script
    return {
        "current_code": generated_code,
        "messages": [response],
        "iteration_count": state.get("iteration_count", 0) + 1
    }