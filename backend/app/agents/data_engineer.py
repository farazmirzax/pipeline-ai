import re
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from app.state import PipelineState

# Connect directly to your local Ollama instance
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


def data_engineer_node(state: PipelineState):
    print("--- NODE: DATA ENGINEER ---")
    
    goal = state.get("business_goal", "Clean the dataset")
    raw_path = state.get("original_data_path", "data/raw.csv")
    
    # Define the persona and strict rules
    system_prompt = """You are a Senior Data Engineer. 
    Your objective is to write a robust Python script using pandas to clean a raw CSV dataset.
    You must handle missing values, normalize numerical columns, and prepare it for machine learning.
    
    CRITICAL: Output ONLY raw, executable Python code. Do not include markdown blocks (```python) or explanations.
    """
    
    # Give the agent its specific task based on the current state
    task = f"""
    The raw data is located at: {raw_path}
    The ultimate business goal is: {goal}
    
    Write a script that loads the data, cleans it, and saves the cleaned version to 'data/cleaned_dataset.csv'.
    """
    
    # Trigger the local model to generate the code
    response = llm.invoke([
        SystemMessage(content=system_prompt), 
        HumanMessage(content=task)
    ])
    
    generated_code = extract_code_from_output(response.content)
    
    # Return the updated state (LangGraph merges this with the existing state)
    return {
        "current_code": generated_code,
        "cleaned_data_path": "data/cleaned_dataset.csv",
        "messages": [response]
    }