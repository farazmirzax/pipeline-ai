from typing import TypedDict, Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
import operator

class PipelineState(TypedDict):
    # The conversational history and agent scratchpads
    messages: Annotated[List[BaseMessage], operator.add]
    
    # Project Context
    business_goal: str
    original_data_path: str
    cleaned_data_path: str
    
    # Execution Tracking
    current_code: str
    qa_feedback: str
    model_metrics: Dict[str, Any]
    
    # Safety Valve
    iteration_count: int
    final_report: str