import math
from typing import List, Dict, Tuple, Any
from ..models.schemas import Delivery, DPTableData


def solve_knapsack_01(
    deliveries: List[Delivery],
    capacity: float,
    capacity_step: int = 1
) -> Tuple[List[Delivery], List[Delivery], DPTableData, List[Dict[str, Any]]]:
    """
    Solves the 0/1 Knapsack problem using Dynamic Programming.
    
    Time Complexity: O(n * C)
    Space Complexity: O(n * C)
    
    where:
      n = number of delivery requests
      C = integer vehicle capacity (in discretized kg)
      
    Returns:
      (selected_deliveries, rejected_deliveries, dp_table_data, visualizer_trace)
    """
    if not deliveries or capacity <= 0:
        empty_table = DPTableData(
            item_ids=[],
            capacities=[0],
            grid=[[0.0]],
            backtrack_cells=[],
            optimal_profit=0.0,
            selected_ids=[]
        )
        return [], list(deliveries), empty_table, []

    n = len(deliveries)
    
    # Check if any delivery weight or capacity has a fractional component
    has_fractional = any(
        not float(d.weight).is_integer() for d in deliveries
    ) or not float(capacity).is_integer()

    # Fixed-point discretization scale: 10 for 0.1 kg resolution, 1 for exact integer kg
    scale = 10 if has_fractional else 1
    int_capacity = int(math.floor(round(capacity * scale, 4)))
    
    # weights as discretized integers (ceil rounding to ensure conservative capacity bounds)
    weights: List[int] = []
    profits: List[float] = []
    
    for d in deliveries:
        w_int = max(1, int(math.ceil(round(d.weight * scale, 4))))
        weights.append(w_int)
        profits.append(float(d.profit))

    # Initialize DP table: dimensions (n + 1) x (int_capacity + 1)
    dp = [[0.0 for _ in range(int_capacity + 1)] for _ in range(n + 1)]
    
    # Visualizer steps trace
    visualizer_steps: List[Dict[str, Any]] = []

    # DP Table Filling
    for i in range(1, n + 1):
        item = deliveries[i - 1]
        w_i = weights[i - 1]
        p_i = profits[i - 1]
        
        for c in range(int_capacity + 1):
            exclude_val = dp[i - 1][c]
            
            if w_i <= c:
                include_val = p_i + dp[i - 1][c - w_i]
                if include_val > exclude_val:
                    dp[i][c] = include_val
                    decision = "INCLUDE"
                    explanation = (
                        f"Item {item.id} (Weight {item.weight}kg, Profit Rs.{p_i:.0f}) fits in capacity {c / scale:.1f}kg. "
                        f"Including it yields Rs.{include_val:.0f} > excluding value Rs.{exclude_val:.0f}. "
                        f"Cell dp[{i}][{c}] set to Rs.{include_val:.0f}."
                    )
                else:
                    dp[i][c] = exclude_val
                    decision = "EXCLUDE"
                    explanation = (
                        f"Item {item.id} fits in capacity {c / scale:.1f}kg, but keeping previous optimal subset "
                        f"yields Rs.{exclude_val:.0f} >= including value Rs.{include_val:.0f}. "
                        f"Cell dp[{i}][{c}] set to Rs.{exclude_val:.0f}."
                    )
            else:
                dp[i][c] = exclude_val
                decision = "EXCLUDE_WEIGHT"
                explanation = (
                    f"Item {item.id} requires {item.weight}kg, which exceeds current capacity {c / scale:.1f}kg. "
                    f"Inheriting dp[{i-1}][{c}] = Rs.{exclude_val:.0f}."
                )

            # Record sample steps or key intervals for educational step-by-step replay
            record_step_interval = max(1, capacity_step * scale)
            if c % record_step_interval == 0:
                visualizer_steps.append({
                    "step_type": "CELL_EVALUATION",
                    "row_index": i,
                    "col_capacity": int(round(c / scale)),
                    "item_id": item.id,
                    "item_weight": item.weight,
                    "item_profit": p_i,
                    "exclude_val": exclude_val,
                    "include_val": p_i + dp[i - 1][c - w_i] if w_i <= c else None,
                    "assigned_val": dp[i][c],
                    "decision": decision,
                    "explanation": explanation
                })

    # Optimal profit
    optimal_profit = dp[n][int_capacity]

    # Backtracking to reconstruct selected items
    selected_indices: List[int] = []
    backtrack_cells: List[List[int]] = []
    
    curr_c = int_capacity
    for i in range(n, 0, -1):
        display_c = int(round(curr_c / scale))
        backtrack_cells.append([i, display_c])
        # If value is different from row above, item i-1 was included
        if dp[i][curr_c] != dp[i - 1][curr_c]:
            selected_indices.append(i - 1)
            visualizer_steps.append({
                "step_type": "BACKTRACK",
                "row_index": i,
                "col_capacity": display_c,
                "item_id": deliveries[i - 1].id,
                "action": "SELECTED",
                "explanation": (
                    f"Backtracking: dp[{i}][{curr_c}] (Rs.{dp[i][curr_c]:.0f}) != dp[{i-1}][{curr_c}] "
                    f"(Rs.{dp[i-1][curr_c]:.0f}). Delivery {deliveries[i-1].id} is SELECTED. "
                    f"Remaining capacity: {display_c} - {deliveries[i-1].weight}kg."
                )
            })
            curr_c -= weights[i - 1]
        else:
            visualizer_steps.append({
                "step_type": "BACKTRACK",
                "row_index": i,
                "col_capacity": display_c,
                "item_id": deliveries[i - 1].id,
                "action": "REJECTED",
                "explanation": (
                    f"Backtracking: dp[{i}][{curr_c}] == dp[{i-1}][{curr_c}] (Rs.{dp[i][curr_c]:.0f}). "
                    f"Delivery {deliveries[i-1].id} is REJECTED."
                )
            })
            
    backtrack_cells.append([0, int(round(curr_c / scale))])

    selected_indices.reverse()
    selected_deliveries = [deliveries[idx] for idx in selected_indices]
    selected_ids_set = {d.id for d in selected_deliveries}
    rejected_deliveries = [d for d in deliveries if d.id not in selected_ids_set]

    # Generate grid representation for UI
    cap_kg = int(math.floor(capacity))
    if cap_kg <= 24:
        display_capacities = list(range(0, cap_kg + 1, 2)) if cap_kg >= 10 else list(range(cap_kg + 1))
        if cap_kg not in display_capacities:
            display_capacities.append(cap_kg)
    else:
        step = max(2, cap_kg // 12)
        display_capacities = list(range(0, cap_kg + 1, step))
        if cap_kg not in display_capacities:
            display_capacities.append(cap_kg)

    grid_data: List[List[float]] = []
    for i in range(n + 1):
        row_vals = [dp[i][min(int_capacity, int(round(c * scale)))] for c in display_capacities]
        grid_data.append(row_vals)

    dp_table_data = DPTableData(
        item_ids=["Base"] + [d.id for d in deliveries],
        capacities=display_capacities,
        grid=grid_data,
        backtrack_cells=backtrack_cells,
        optimal_profit=optimal_profit,
        selected_ids=[d.id for d in selected_deliveries]
    )

    return selected_deliveries, rejected_deliveries, dp_table_data, visualizer_steps
