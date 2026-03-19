from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from app.state import PipelineState

# Keeping it lightweight for your local machine
llm = ChatOllama(model="qwen2.5-coder:3b", base_url="http://127.0.0.1:11434")

def business_analyst_node(state: PipelineState):
    print("--- NODE: BUSINESS ANALYST ---")
    
    goal = state.get("business_goal", "Unknown Goal")
    code = state.get("current_code", "")
    
    system_prompt = """You are a Senior Business Analyst.
    Your objective is to translate a machine learning pipeline into a clear, non-technical executive summary.
    
    Output a clean Markdown formatted report containing:
    1. **Executive Summary:** How this model solves the requested business goal.
    2. **Technical Overview:** What kind of model was built (explained simply, without code).
    3. **Strategic Next Steps:** How the business should deploy or use this model.
    """
    
    task = f"Business Goal: {goal}\n\nThe ML Architect wrote this code to solve it:\n{code}\n\nPlease generate the final business report."
    
    response = llm.invoke([
        SystemMessage(content=system_prompt), 
        HumanMessage(content=task)
    ])
    
    print(">> Report Generated Successfully!")
    
    return {
        "final_report": response.content.strip(),
        "messages": [response]
    }