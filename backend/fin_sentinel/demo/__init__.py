"""Demo benchmarks and interactive showcase for Fin-Sentinel."""

from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
    get_scenario_b_false_positive_reversal,
    get_scenario_c_autonomous_expense_variance,
    get_scenario_d_split_po,
    get_all_scenarios,
)

__all__ = [
    "get_scenario_a_duplicate_payment",
    "get_scenario_b_false_positive_reversal",
    "get_scenario_c_autonomous_expense_variance",
    "get_scenario_d_split_po",
    "get_all_scenarios",
]
