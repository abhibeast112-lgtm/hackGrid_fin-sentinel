"""Public Workflow APIs: start_investigation, resume_investigation, run_investigation."""

import uuid
from typing import Any, Dict, Optional, Union
from langgraph.types import Command
from langgraph.checkpoint.sqlite import SqliteSaver

from fin_sentinel.graph.builder import build_investigation_graph
from fin_sentinel.graph.state import InvestigationState
from fin_sentinel.models.anomaly import Anomaly
from fin_sentinel.models.checkpoint import InvestigationStepResult, HumanResponse
from fin_sentinel.models.result import InvestigationResult


# Global in-memory checkpointer and compiled application
# Global SQLite-backed checkpointer
_checkpoint_context = SqliteSaver.from_conn_string(
    "fin_sentinel_checkpoints.db"
)

_global_memory = _checkpoint_context.__enter__()

_global_memory.setup()

_app = build_investigation_graph(
    checkpointer=_global_memory
)


def start_investigation(
    anomaly: Union[Anomaly, Dict[str, Any]],
    thread_id: Optional[str] = None,
) -> InvestigationStepResult:
    """Start an investigation from an Anomaly input.

    - Low/Medium risk: executes autonomously to completion.
    - High risk: halts at Checkpoint 1 (Orchestrator Scope Gate) via interrupt().
    """
    if isinstance(anomaly, dict):
        ano_model = Anomaly(**anomaly)
    else:
        ano_model = anomaly

    investigation_id = thread_id or f"INV-{ano_model.anomaly_id}-{uuid.uuid4().hex[:6]}"
    config = {"configurable": {"thread_id": investigation_id}}

    initial_state: InvestigationState = {
        "investigation_id": investigation_id,
        "anomaly": ano_model.model_dump(),
        "risk_tier": ano_model.risk_tier,
        "requires_human_approval": (ano_model.risk_tier == "HIGH" or ano_model.risk_score >= 70.0 or ano_model.amount >= 50000.0),
        "current_step": "start",
        "status": "RUNNING",
        "checkpoint_prompt": None,
        "approval_options": ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE"],
        "human_responses": {},
        "orchestrator_output": None,
        "specialist_output": None,
        "evidence_output": None,
        "challenge_output": None,
        "cfo_output": None,
        "audit_trail": [],
        "final_result": None,
    }

    _app.invoke(initial_state, config=config)
    return _build_step_result(investigation_id, config)


def resume_investigation(
    investigation_id: str,
    response: Union[HumanResponse, Dict[str, Any], str],
) -> InvestigationStepResult:
    config = {"configurable": {"thread_id": investigation_id}}

    state = _app.get_state(config)

    print("RESUME STATE:")
    print(state.values)

    if not state.values:
        raise ValueError(
            f"No checkpointed state found for investigation {investigation_id}"
        )

    if isinstance(response, HumanResponse):
        payload = response.model_dump()
    elif isinstance(response, dict):
        payload = response
    else:
        payload = {
            "action": str(response),
            "feedback": None,
        }

    _app.invoke(
        Command(resume=payload),
        config=config,
    )

    return _build_step_result(
        investigation_id,
        config,
    )


def run_investigation(anomaly: Union[Anomaly, Dict[str, Any]]) -> InvestigationResult:
    """Frozen synchronous contract for teammate or automated pipelines.

    Runs investigation to completion. If human checkpoints are encountered,
    auto-approves with standard audit log to return final decision-ready InvestigationResult.
    """
    step = start_investigation(anomaly)
    while step.requires_approval and step.status == "WAITING_FOR_APPROVAL":
        step = resume_investigation(
            step.investigation_id,
            HumanResponse(
                action="APPROVE",
                feedback="Auto-approved via synchronous run_investigation contract",
                reviewer_id="finance_pipeline",
            ),
        )

    if step.final_result:
        if isinstance(step.final_result, dict):
            return InvestigationResult(**step.final_result)
        return step.final_result

    raise RuntimeError(f"Investigation {step.investigation_id} terminated prematurely in status {step.status}")


def _build_step_result(investigation_id: str, config: Dict[str, Any]) -> InvestigationStepResult:
    """Extracts snapshot from checkpointer and crafts structured InvestigationStepResult for API/UI."""
    graph_state = _app.get_state(config)
    values = graph_state.values or {}
    tasks = graph_state.tasks or ()

    # Check if there is an active interrupt pending
    interrupt_info = None
    requires_approval = False
    for t in tasks:
        if t.interrupts:
            interrupt_info = t.interrupts[0].value
            requires_approval = True
            break

    current_step = values.get("current_step", "start")
    status = values.get("status", "RUNNING")
    prompt = None
    options = ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE"]
    step_output = {}

    if requires_approval and interrupt_info:
        status = "WAITING_FOR_APPROVAL"
        prompt = interrupt_info.get("prompt")
        options = interrupt_info.get("options", options)
        current_step = interrupt_info.get("step", current_step)
        step_output = interrupt_info.get("data", {})
    else:
        if current_step == "completed":
            status = "COMPLETED"
        step_output = values.get(f"{current_step}_output") or {}

    final_res = None
    if values.get("final_result"):
        final_res = InvestigationResult(**values["final_result"])

    return InvestigationStepResult(
        investigation_id=investigation_id,
        current_step=current_step,
        step_output=step_output,
        status=status,
        requires_approval=requires_approval,
        checkpoint_prompt=prompt,
        approval_options=options,
        risk_tier=values.get("risk_tier", "HIGH"),
        final_result=final_res,
    )
