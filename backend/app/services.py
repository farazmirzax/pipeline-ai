from app.db import SessionLocal
from app.graph import app_graph
from app.models import PipelineRun


def execute_pipeline_run(run_id: int) -> None:
    db = SessionLocal()

    try:
        run = db.get(PipelineRun, run_id)
        if run is None:
            return

        initial_state = {
            "business_goal": run.goal,
            "original_data_path": run.dataset_path,
            "cleaned_data_path": "",
            "current_code": "",
            "qa_feedback": "",
            "model_metrics": {},
            "iteration_count": 0,
            "final_report": "",
            "messages": [],
        }

        config = {"recursion_limit": 15}
        final_code = ""
        final_report = ""

        for output in app_graph.stream(initial_state, config=config):
            for node_name, state_update in output.items():
                print(f"[API] Agent Finished: {node_name}")

                if "current_code" in state_update:
                    final_code = state_update["current_code"]
                if "final_report" in state_update:
                    final_report = state_update["final_report"]

        run.status = "completed"
        run.generated_code = final_code
        run.final_report = final_report
        run.error_message = None
        db.commit()

    except Exception as exc:
        print(f"[API] ERROR: {exc}")

        run = db.get(PipelineRun, run_id)
        if run is not None:
            run.status = "failed"
            run.error_message = str(exc)
            db.commit()

    finally:
        db.close()
