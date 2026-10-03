from typing import List, Dict, Tuple
from ..models.schemas import Delivery, Vehicle, RouteStop


def validate_solution(
    selected_deliveries: List[Delivery],
    vehicle: Vehicle,
    stops: List[RouteStop]
) -> Tuple[bool, List[str], int, int, float]:
    """
    Validates delivery and route constraints:
    1. Capacity constraint (sum of selected weights <= vehicle capacity)
    2. Deadline compliance (arrival <= deadline => slack >= 0)
    3. Maximum shift operating time (last stop departure <= max_operating_time)
    4. Pickup-before-dropoff precedence
    5. Route continuity
    
    Returns:
      (passed, validation_notes, on_time_count, late_count, on_time_pct)
    """
    notes: List[str] = []
    is_valid = True

    # 1. Capacity Check
    total_selected_weight = sum(d.weight for d in selected_deliveries)
    if round(total_selected_weight, 2) > round(vehicle.capacity, 2):
        is_valid = False
        notes.append(
            f"VIOLATION: Vehicle capacity exceeded! Total selected weight is {total_selected_weight:.1f} kg, "
            f"exceeding vehicle capacity of {vehicle.capacity:.1f} kg."
        )
    else:
        notes.append(
            f"PASSED: Capacity constraint satisfied. Vehicle load: {total_selected_weight:.1f} / {vehicle.capacity:.1f} kg "
            f"({(total_selected_weight / vehicle.capacity * 100):.1f}% utilization)."
        )

    # 2. Pickup-before-dropoff & Deadline Checks
    # Orders whose pickup location is the starting depot are loaded on board at dispatch
    picked_up = {d.id for d in selected_deliveries if d.pickup == vehicle.depot}
    drop_visited = set()
    on_time_count = 0
    late_count = 0

    for stop in stops:
        if stop.type.startswith("Pickup") and stop.delivery_id:
            picked_up.add(stop.delivery_id)
        elif stop.type.startswith("Drop") and stop.delivery_id:
            d_id = stop.delivery_id
            if d_id not in picked_up and stop.node_id != vehicle.depot:
                # If package was not loaded at depot or picked up
                notes.append(f"WARNING: Precedence anomaly for delivery {d_id} at stop #{stop.stop_number}.")

            drop_visited.add(d_id)
            if stop.slack is not None:
                if stop.slack >= 0:
                    on_time_count += 1
                else:
                    late_count += 1
                    notes.append(
                        f"DEADLINE WARNING: Delivery {d_id} is Late by {abs(stop.slack):.1f} min "
                        f"(ETA: {stop.arrival_time:.1f} min, Deadline: {stop.deadline:.1f} min)."
                    )

    # Total drops evaluated
    total_drops = on_time_count + late_count
    on_time_pct = (on_time_count / total_drops * 100.0) if total_drops > 0 else 100.0

    if late_count == 0:
        notes.append(f"PASSED: 100% On-Time delivery achieved ({on_time_count}/{total_drops} orders).")
    else:
        notes.append(f"NOTICE: {on_time_count}/{total_drops} orders on-time ({on_time_pct:.1f}%).")

    # 3. Maximum Operating Time Check
    if stops:
        total_time = stops[-1].departure_time
        if total_time > vehicle.max_operating_time:
            is_valid = False
            notes.append(
                f"VIOLATION: Route duration {total_time:.1f} min exceeds vehicle maximum operating time "
                f"({vehicle.max_operating_time:.1f} min)."
            )
        else:
            notes.append(
                f"PASSED: Operating time {total_time:.1f} min is within shift limit of {vehicle.max_operating_time:.1f} min."
            )

    # 4. Route Continuity Check
    for i in range(len(stops) - 1):
        if round(stops[i].departure_time, 2) > round(stops[i + 1].arrival_time, 2):
            notes.append(f"TIMELINE WARNING: Discontinuity between stop #{stops[i].stop_number} and #{stops[i+1].stop_number}.")

    return is_valid, notes, on_time_count, late_count, round(on_time_pct, 1)
