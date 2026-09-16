from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict
from pydantic import BaseModel

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    @abstractmethod
    def run(self, context: Dict[str, Any]) -> BaseModel:
        pass

    def create_audit_step(
        self,
        step_name: str,
        input_summary: str,
        output_summary: str,
        human_action: str = None,
        human_feedback: str = None,
    ) -> Dict[str, Any]:
        return {
            "step_name": step_name,
            "agent_name": self.name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_summary": input_summary,
            "output_summary": output_summary,
            "human_action": human_action,
            "human_feedback": human_feedback,
        }
