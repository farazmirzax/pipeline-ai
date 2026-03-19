import os
import pandas as pd
from app.graph import app_graph

def create_dummy_data():
    """Generates a fake dataset for the agents to process."""
    print(">> Setting up test environment...")
    os.makedirs("data", exist_ok=True)
    
    data = {
        'Age': [25, 45, 35, 50, 23, 40, 60, 28, 33, 48],
        'Monthly_Spend': [50.5, 120.0, 80.5, 150.0, 45.0, 110.0, 200.0, 55.0, 90.0, 140.0],
        'Support_Tickets': [1, 5, 2, 8, 0, 4, 7, 1, 2, 6],
        'Churn': [0, 1, 0, 1, 0, 1, 1, 0, 0, 1] 
    }
    
    df = pd.DataFrame(data)
    filepath = "data/raw.csv"
    df.to_csv(filepath, index=False)
    print(f">> Created dummy dataset at {filepath}\n")
    return filepath

def run_pipeline():
    raw_path = create_dummy_data()
    
    initial_state = {
        "business_goal": "Predict customer churn based on their age, monthly spend, and support tickets.",
        "original_data_path": raw_path,
        "cleaned_data_path": "",
        "current_code": "",
        "qa_feedback": "",
        "iteration_count": 0,
        "messages": []
    }
    
    print("="*50)
    print("🚀 IGNITING PIPELINE.AI")
    print("="*50)
    
    config = {"recursion_limit": 15} 
    
    try:
        # Variables to catch the outputs as they fly by
        final_report = ""
        final_code = ""

        for output in app_graph.stream(initial_state, config=config):
            for node_name, state_update in output.items():
                print(f"\n[Finished Node: {node_name}]")
                
                # Catch the code and report as they are generated
                if "current_code" in state_update:
                    final_code = state_update["current_code"]
                if "final_report" in state_update:
                    final_report = state_update["final_report"]
                    
        print("\n" + "="*50)
        print("✅ PIPELINE COMPLETE")
        print("="*50 + "\n")
        
        print("=== THE ML ARCHITECT'S CODE ===")
        print(final_code)
        print("\n=== THE FINAL BUSINESS REPORT ===")
        print(final_report)
        
    except Exception as e:
        print(f"\n[!] Pipeline Execution Error: {e}")

if __name__ == "__main__":
    run_pipeline()