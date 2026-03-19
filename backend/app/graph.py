from langgraph.graph import StateGraph, END
from app.state import PipelineState
from app.agents.data_engineer import data_engineer_node
from app.agents.ml_architect import ml_architect_node
from app.agents.qa_agent import qa_agent_node
from app.agents.business_analyst import business_analyst_node

# The routing function that decides where to go after QA
def route_qa(state: PipelineState):
    feedback = state.get("qa_feedback", "")
    iterations = state.get("iteration_count", 0)
    
    # 1. The Safety Valve
    if iterations >= 3:
        print("\n[!] MAX ITERATIONS REACHED. QA and ML Architect cannot agree. Forcing exit.")
        return END
        
    # 2. The Success Path
    if not feedback:
        print("\n[+] QA Passed! Moving to final outputs.")
        return "BusinessAnalyst"
        
    # 3. The Rejection Loop
    print(f"\n[-] QA Failed (Iteration {iterations}). Routing back to ML Architect...")
    return "MLArchitect"

def build_graph():
    print("Initializing Pipeline.ai Orchestration Graph...")
    workflow = StateGraph(PipelineState)

    # Add Nodes
    workflow.add_node("DataEngineer", data_engineer_node)
    workflow.add_node("MLArchitect", ml_architect_node)
    workflow.add_node("AdversarialQA", qa_agent_node)
    workflow.add_node("BusinessAnalyst", business_analyst_node)

    # Add Edges
    workflow.set_entry_point("DataEngineer")
    workflow.add_edge("DataEngineer", "MLArchitect")
    workflow.add_edge("MLArchitect", "AdversarialQA")
    
    # Add the Conditional Edge (The Loop)
    workflow.add_conditional_edges(
        "AdversarialQA",  # The node we are coming from
        route_qa,         # The function that decides the next step
        {
            "MLArchitect": "MLArchitect",       # If router returns "MLArchitect", go there
            "BusinessAnalyst": "BusinessAnalyst", # If router returns "BusinessAnalyst", go there
            END: END                            # If router returns END, stop the graph
        }
    )
    
    # Final step: End the pipeline after the report is generated
    workflow.add_edge("BusinessAnalyst", END)

    return workflow.compile()

# Export the compiled graph
app_graph = build_graph()