"""LangGraph StateGraph builder with tiered risk gating and native interrupts."""

from typing import Any, Dict
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt
from langgraph.checkpoint.memory import MemorySaver

from fin_sentinel.graph.state import InvestigationState
from fin_sentinel.agents.orchestrator import OrchestratorAgent
from fin_sentinel.agents.specialist import SpecialistAgent
from fin_sentinel.agents.evidence_agent import EvidenceAgent
from fin_sentinel.agents.challenge_agent import ChallengeAgent
from fin_sentinel.agents.cfo_narrator import CFONarratorAgent
from fin_sentinel.models.result import AuditStep


def build_investigation_graph(checkpointer=None):
    """Constructs the compiled LangGraph workflow with risk-tiered interrupt gates."""

    builder = StateGraph(InvestigationState)

    orch_agent = OrchestratorAgent()
    spec_agent = SpecialistAgent()
    ev_agent = EvidenceAgent()
    chall_agent = ChallengeAgent()
    cfo_agent = CFONarratorAgent()

    # ---------------------------------------------------------
    # Node 1: Orchestrator Node
    # ---------------------------------------------------------
    def orchestrator_node(state: InvestigationState) -> Dict[str, Any]:
        orch_out = orch_agent.run(state)
        audit_entry = orch_agent.create_audit_step(
            step_name="orchestrator",
            input_summary=f"Anomaly: {state['anomaly'].get('title')} ({state['anomaly'].get('currency')} {state['anomaly'].get('amount')})",
            output_summary=f"Risk Tier: {orch_out.risk_tier}, Assigned: {orch_out.assigned_specialist}",
        )

        audit_trail = list(state.get("audit_trail") or [])
        audit_trail.append(audit_entry)

        updates: Dict[str, Any] = {
            "orchestrator_output": orch_out.model_dump(),
            "risk_tier": orch_out.risk_tier,
            "requires_human_approval": orch_out.requires_human_approval,
            "current_step": "orchestrator",
            "audit_trail": audit_trail,
        }

        # Gate 1: Scope Approval for High-Risk Cases
        if orch_out.requires_human_approval:
            human_reply = interrupt({
                "step": "orchestrator",
                "checkpoint": 1,
                "prompt": orch_out.checkpoint_prompt,
                "options": ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE"],
                "data": orch_out.model_dump(),
            })

            action = human_reply.get("action", "APPROVE") if isinstance(human_reply, dict) else str(human_reply)
            feedback = human_reply.get("feedback") if isinstance(human_reply, dict) else None

            # Update audit trail with human intervention
            audit_trail[-1]["human_action"] = action
            audit_trail[-1]["human_feedback"] = feedback

            responses = dict(state.get("human_responses") or {})
            responses["orchestrator"] = {"action": action, "feedback": feedback}
            updates["human_responses"] = responses

            if action == "REJECT":
                updates["status"] = "REJECTED"

        return updates

    # ---------------------------------------------------------
    # Node 2: Specialist Node
    # ---------------------------------------------------------
    def specialist_node(state: InvestigationState) -> Dict[str, Any]:
        if state.get("status") == "REJECTED":
            return {"current_step": "specialist"}

        spec_out = spec_agent.run(state)
        audit_entry = spec_agent.create_audit_step(
            step_name="specialist",
            input_summary=f"Rules matched: {len(spec_out.violation_rules_matched)}",
            output_summary=f"Severity: {spec_out.domain_severity}, Findings: {spec_out.detailed_findings[:80]}...",
        )
        audit_trail = list(state.get("audit_trail") or [])
        audit_trail.append(audit_entry)

        return {
            "specialist_output": spec_out.model_dump(),
            "current_step": "specialist",
            "audit_trail": audit_trail,
        }

    # ---------------------------------------------------------
    # Node 3: Evidence Node
    # ---------------------------------------------------------
    def evidence_node(state: InvestigationState) -> Dict[str, Any]:
        if state.get("status") == "REJECTED":
            return {"current_step": "evidence"}

        ev_set = ev_agent.run(state)
        audit_entry = ev_agent.create_audit_step(
            step_name="evidence",
            input_summary=f"Flagged IDs: {state['anomaly'].get('flagged_record_ids')}",
            output_summary=f"Verified: {len(ev_set.verified_records)} records, Provenance Hash: {ev_set.provenance_hash[:12]}...",
        )
        audit_trail = list(state.get("audit_trail") or [])
        audit_trail.append(audit_entry)

        updates: Dict[str, Any] = {
            "evidence_output": ev_set.model_dump(),
            "current_step": "evidence",
            "audit_trail": audit_trail,
        }

        # Gate 2: Evidence Confirmation for High-Risk Cases
        if state.get("requires_human_approval"):
            prompt = (
                f"[HUMAN CHECKPOINT 2: EVIDENCE CONFIRMATION] Evidence Agent verified "
                f"{len(ev_set.verified_records)} records ({', '.join(ev_set.referenced_record_ids)}). "
                f"Provenance hash: {ev_set.provenance_hash[:10]}. Do you confirm evidence validity before adversarial challenge?"
            )
            human_reply = interrupt({
                "step": "evidence",
                "checkpoint": 2,
                "prompt": prompt,
                "options": ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE"],
                "data": {
                    "verified_record_ids": ev_set.referenced_record_ids,
                    "rejected_ids": ev_set.rejected_unsubstantiated_ids,
                    "provenance_hash": ev_set.provenance_hash,
                },
            })

            action = human_reply.get("action", "APPROVE") if isinstance(human_reply, dict) else str(human_reply)
            feedback = human_reply.get("feedback") if isinstance(human_reply, dict) else None

            audit_trail[-1]["human_action"] = action
            audit_trail[-1]["human_feedback"] = feedback

            responses = dict(state.get("human_responses") or {})
            responses["evidence"] = {"action": action, "feedback": feedback}
            updates["human_responses"] = responses

            if action == "REJECT":
                updates["status"] = "REJECTED"

        return updates

    # ---------------------------------------------------------
    # Node 4: Challenge Node
    # ---------------------------------------------------------
    def challenge_node(state: InvestigationState) -> Dict[str, Any]:
        if state.get("status") == "REJECTED":
            return {"current_step": "challenge"}

        chall_out = chall_agent.run(state)
        audit_entry = chall_agent.create_audit_step(
            step_name="challenge",
            input_summary=f"Checks: {len(chall_out.checks_performed)} disproval tests",
            output_summary=f"Verdict: {chall_out.challenge_result.upper()}, Confidence: {chall_out.confidence * 100:.0f}%",
        )
        audit_trail = list(state.get("audit_trail") or [])
        audit_trail.append(audit_entry)

        updates: Dict[str, Any] = {
            "challenge_output": chall_out.model_dump(),
            "current_step": "challenge",
            "audit_trail": audit_trail,
        }

        # Gate 3: Challenge Review for High-Risk Cases
        if state.get("requires_human_approval"):
            prompt = (
                f"[HUMAN CHECKPOINT 3: CHALLENGE REVIEW] Adversarial testing concluded with verdict: "
                f"'{chall_out.challenge_result.upper()}'. Counter-evidence: {chall_out.contradicting_evidence or 'None'}. "
                f"Alternative explanation: {chall_out.alternative_explanation or 'None'}. Confirm review to synthesize executive case."
            )
            human_reply = interrupt({
                "step": "challenge",
                "checkpoint": 3,
                "prompt": prompt,
                "options": ["APPROVE", "OVERRIDE", "REQUEST_MORE_EVIDENCE"],
                "data": chall_out.model_dump(),
            })

            action = human_reply.get("action", "APPROVE") if isinstance(human_reply, dict) else str(human_reply)
            feedback = human_reply.get("feedback") if isinstance(human_reply, dict) else None

            audit_trail[-1]["human_action"] = action
            audit_trail[-1]["human_feedback"] = feedback

            responses = dict(state.get("human_responses") or {})
            responses["challenge"] = {"action": action, "feedback": feedback}
            updates["human_responses"] = responses

            if action == "REJECT":
                updates["status"] = "REJECTED"

        return updates

    # ---------------------------------------------------------
    # Node 5: CFO Narrator Node
    # ---------------------------------------------------------
    def cfo_narrator_node(state: InvestigationState) -> Dict[str, Any]:
        if state.get("status") == "REJECTED":
            # Synthesize rejected case
            ano = state["anomaly"]
            inv_id = state.get("investigation_id", f"INV-{ano.get('anomaly_id')}")
            from fin_sentinel.models.result import (
                InvestigationResult,
                FourQuestionsAnswer,
            )
            res = InvestigationResult(
                investigation_id=inv_id,
                anomaly_id=ano.get("anomaly_id", "UNKNOWN"),
                anomaly_type=ano.get("anomaly_type", "UNKNOWN"),
                title=ano.get("title", "Rejected Anomaly"),
                amount=ano.get("amount", 0.0),
                currency=ano.get("currency", "INR"),
                risk_score=ano.get("risk_score", 0.0),
                risk_tier=state.get("risk_tier", "HIGH"),
                status="REJECTED_BY_HUMAN",
                four_questions=FourQuestionsAnswer(
                    what_happened="Investigation terminated by human reviewer at checkpoint.",
                    why_anomalous="Initial flag dismissed during human triage.",
                    what_evidence=[],
                    what_could_prove_it_wrong="Human reviewer rejected investigation scope.",
                ),
                challenge_verdict="inconclusive",
                recommended_action="NO_ACTION_REQUIRED",
                evidence_record_ids=[],
                counter_evidence_ids=[],
                alternative_explanation="Investigation aborted by human authority.",
                audit_trail=[AuditStep(**s) for s in state.get("audit_trail", [])],
                executive_summary="Investigation rejected by human reviewer at checkpoint. Case closed.",
                requires_human_signoff=False,
            )
            return {
                "current_step": "completed",
                "status": "REJECTED",
                "final_result": res.model_dump(),
            }

        res = cfo_agent.run(state)
        return {
            "cfo_output": res.model_dump(),
            "final_result": res.model_dump(),
            "current_step": "completed",
            "status": "COMPLETED",
        }

    # Add Nodes
    builder.add_node("orchestrator", orchestrator_node)
    builder.add_node("specialist", specialist_node)
    builder.add_node("evidence", evidence_node)
    builder.add_node("challenge", challenge_node)
    builder.add_node("cfo_narrator", cfo_narrator_node)

    # Add Linear Flow Edges
    builder.add_edge(START, "orchestrator")
    builder.add_edge("orchestrator", "specialist")
    builder.add_edge("specialist", "evidence")
    builder.add_edge("evidence", "challenge")
    builder.add_edge("challenge", "cfo_narrator")
    builder.add_edge("cfo_narrator", END)

    memory = checkpointer if checkpointer is not None else MemorySaver()
    return builder.compile(checkpointer=memory)
