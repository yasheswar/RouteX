from typing import List, Dict, Tuple, Optional, Any
from ..models.schemas import Delivery, Vehicle, RouteStop, GreedyPriorityRow
from .dijkstra import GraphNetwork


def compute_greedy_priority_table(
    deliveries: List[Delivery],
    depot_node: str,
    graph: GraphNetwork,
    traffic_multiplier: float = 1.0
) -> List[GreedyPriorityRow]:
    """
    Computes static initial priority scores from the vehicle's depot node.
    Used for Screen 5 (Greedy Prioritization Table).
    
    Urgency = 1 + max(0, (MaxDeadline - Deadline) / MaxDeadline)
    Priority = (Profit * Urgency) / (max(0.1, Weight) * max(1.0, TravelTime))
    """
    if not deliveries:
        return []

    max_deadline = max((d.deadline for d in deliveries), default=60.0)
    if max_deadline <= 0:
        max_deadline = 60.0

    rows: List[GreedyPriorityRow] = []

    for d in deliveries:
        if d.pickup == depot_node:
            # Package is loaded directly at the starting depot
            _, _, t_travel, _ = graph.shortest_path(depot_node, d.drop)
            est_travel_time = max(1.0, round(t_travel, 1))
        else:
            # External pickup leg + drop leg
            _, _, t_depot_to_pickup, _ = graph.shortest_path(depot_node, d.pickup)
            _, _, t_pickup_to_drop, _ = graph.shortest_path(d.pickup, d.drop)
            est_travel_time = max(1.0, round(t_depot_to_pickup + t_pickup_to_drop, 1))

        # Urgency formula
        urgency = 1.0 + max(0.0, (max_deadline - d.deadline) / max_deadline)

        # Priority formula
        safe_weight = max(0.1, d.weight)
        priority_score = (d.profit * urgency) / (safe_weight * est_travel_time)

        # Initial feasibility check from depot (can vehicle arrive before deadline?)
        feasible = est_travel_time <= d.deadline

        rows.append(GreedyPriorityRow(
            delivery_id=d.id,
            profit=round(d.profit, 2),
            weight=round(d.weight, 2),
            travel_time=round(est_travel_time, 1),
            deadline=round(d.deadline, 1),
            urgency=round(urgency, 2),
            priority_score=round(priority_score, 2),
            feasible=feasible
        ))

    # Sort descending by priority score
    rows.sort(key=lambda r: r.priority_score, reverse=True)
    return rows


def construct_greedy_route(
    selected_deliveries: List[Delivery],
    vehicle: Vehicle,
    graph: GraphNetwork
) -> Tuple[List[RouteStop], List[str], List[Dict[str, Any]]]:
    """
    Constructs a deadline-aware greedy delivery route.
    
    Logistics Principle:
      1. Deliveries with pickup == depot are loaded on the vehicle at Start (Depot).
      2. intra-shift on-demand pickups (pickup != depot) are collected when visited.
      3. At current time T and location L:
         - For each pending delivery, calculate travel time from L to fulfill it.
         - Check deadline feasibility: ETA <= Deadline (Slack >= 0).
         - Calculate dynamic Priority Score with deadline urgency.
         - Greedily pick the highest priority feasible delivery.
         - Move vehicle, advance clock, and update stops.
      4. Return to depot after fulfilling all deliveries.
      
    Returns:
      (stops, route_sequence_nodes, greedy_decision_steps)
    """
    if not selected_deliveries:
        depot_node_name = graph.nodes_dict[vehicle.depot].name if vehicle.depot in graph.nodes_dict else vehicle.depot
        stops = [
            RouteStop(
                stop_number=0,
                type="Depot (Hub)",
                node_id=vehicle.depot,
                node_name=depot_node_name,
                arrival_time=0.0,
                departure_time=0.0,
                distance_from_prev_km=0.0,
                travel_time_from_prev_min=0.0,
                status="Depot"
            )
        ]
        return stops, [vehicle.depot], []

    max_deadline = max((d.deadline for d in selected_deliveries), default=60.0)
    if max_deadline <= 0:
        max_deadline = 60.0

    current_node = vehicle.depot
    current_time = 0.0
    pending_deliveries = {d.id: d for d in selected_deliveries}
    
    # Packages loaded at the depot prior to dispatch
    onboard_packages = {d.id for d in selected_deliveries if d.pickup == vehicle.depot}
    current_load_kg = sum(d.weight for d in selected_deliveries if d.pickup == vehicle.depot)

    stops: List[RouteStop] = []
    route_sequence_nodes: List[str] = [vehicle.depot]
    greedy_decision_steps: List[Dict[str, Any]] = []

    # Stop 0: Starting Depot
    depot_name = graph.nodes_dict[vehicle.depot].name if vehicle.depot in graph.nodes_dict else vehicle.depot
    loaded_at_depot_str = f" ({len(onboard_packages)} orders loaded)" if onboard_packages else ""
    stops.append(RouteStop(
        stop_number=0,
        type=f"Depot - Dispatch{loaded_at_depot_str}",
        node_id=vehicle.depot,
        node_name=depot_name,
        arrival_time=0.0,
        departure_time=0.0,
        distance_from_prev_km=0.0,
        travel_time_from_prev_min=0.0,
        status="Depot",
        current_load_kg=round(current_load_kg, 1)
    ))

    stop_counter = 1

    while pending_deliveries:
        candidate_evaluations = []

        for d_id, d in pending_deliveries.items():
            is_onboard = (d_id in onboard_packages)

            if is_onboard:
                # Package is already onboard; travel directly from current location to drop
                if current_node == d.drop:
                    path_to_drop = [current_node]
                    dist_to_drop, time_to_drop = 0.0, 0.0
                else:
                    path_to_drop, dist_to_drop, time_to_drop, _ = graph.shortest_path(current_node, d.drop)
                
                total_travel_time = time_to_drop
                total_travel_dist = dist_to_drop
                path_to_pickup = []
                dist_to_pickup, time_to_pickup = 0.0, 0.0
            else:
                # Package needs to be picked up from external node d.pickup
                if current_node == d.pickup:
                    path_to_pickup = [current_node]
                    dist_to_pickup, time_to_pickup = 0.0, 0.0
                else:
                    path_to_pickup, dist_to_pickup, time_to_pickup, _ = graph.shortest_path(current_node, d.pickup)

                if d.pickup == d.drop:
                    path_to_drop = [d.pickup]
                    dist_to_drop, time_to_drop = 0.0, 0.0
                else:
                    path_to_drop, dist_to_drop, time_to_drop, _ = graph.shortest_path(d.pickup, d.drop)

                total_travel_time = time_to_pickup + time_to_drop
                total_travel_dist = dist_to_pickup + dist_to_drop

            eta = current_time + total_travel_time
            slack = d.deadline - eta
            is_feasible = (slack >= 0)

            # Urgency factor
            remaining_time = max(0.0, d.deadline - current_time)
            urgency = 1.0 + max(0.0, (max_deadline - remaining_time) / max_deadline)

            # Priority score
            safe_weight = max(0.1, d.weight)
            safe_travel = max(1.0, total_travel_time)
            score = (d.profit * urgency) / (safe_weight * safe_travel)

            candidate_evaluations.append({
                "delivery": d,
                "is_onboard": is_onboard,
                "travel_time": round(total_travel_time, 1),
                "travel_dist": round(total_travel_dist, 1),
                "eta": round(eta, 1),
                "slack": round(slack, 1),
                "urgency": round(urgency, 2),
                "priority_score": round(score, 2),
                "feasible": is_feasible,
                "path_to_pickup": path_to_pickup,
                "dist_to_pickup": dist_to_pickup,
                "time_to_pickup": time_to_pickup,
                "path_to_drop": path_to_drop,
                "dist_to_drop": dist_to_drop,
                "time_to_drop": time_to_drop
            })

        # Separate into feasible and infeasible
        feasible_candidates = [c for c in candidate_evaluations if c["feasible"]]

        if feasible_candidates:
            # Pick highest priority score among feasible
            feasible_candidates.sort(key=lambda c: c["priority_score"], reverse=True)
            chosen = feasible_candidates[0]
            selection_reason = (
                f"Selected {chosen['delivery'].id} with highest Priority Score ({chosen['priority_score']:.2f}) "
                f"among {len(feasible_candidates)} feasible candidates (Slack: +{chosen['slack']} min)."
            )
        else:
            # If no candidates meet deadline, pick the one with minimal lateness (max slack)
            candidate_evaluations.sort(key=lambda c: (c["slack"], c["priority_score"]), reverse=True)
            chosen = candidate_evaluations[0]
            selection_reason = (
                f"No feasible candidate can meet deadline without lateness. "
                f"Selected {chosen['delivery'].id} to minimize delay (Slack: {chosen['slack']} min)."
            )

        # Log decision step for Visualizer
        greedy_decision_steps.append({
            "step_index": stop_counter,
            "current_node": current_node,
            "current_time": round(current_time, 1),
            "candidates_count": len(candidate_evaluations),
            "feasible_count": len(feasible_candidates),
            "candidates": [
                {
                    "id": c["delivery"].id,
                    "profit": c["delivery"].profit,
                    "weight": c["delivery"].weight,
                    "travel_time": c["travel_time"],
                    "deadline": c["delivery"].deadline,
                    "eta": c["eta"],
                    "slack": c["slack"],
                    "priority_score": c["priority_score"],
                    "feasible": c["feasible"]
                }
                for c in candidate_evaluations
            ],
            "chosen_id": chosen["delivery"].id,
            "reason": selection_reason
        })

        d_chosen = chosen["delivery"]

        # If package was not onboard, visit its pickup node first
        if not chosen["is_onboard"]:
            if current_node != d_chosen.pickup:
                current_time += chosen["time_to_pickup"]
                pickup_dist = chosen["dist_to_pickup"]
                pickup_time_prev = chosen["time_to_pickup"]
            else:
                pickup_dist = 0.0
                pickup_time_prev = 0.0

            pickup_arrival = current_time
            pickup_depart = current_time + (vehicle.service_time * 0.5)
            current_time = pickup_depart
            current_load_kg += d_chosen.weight

            p_node_name = graph.nodes_dict[d_chosen.pickup].name if d_chosen.pickup in graph.nodes_dict else d_chosen.pickup
            stops.append(RouteStop(
                stop_number=stop_counter,
                type=f"Pickup ({d_chosen.id})",
                delivery_id=d_chosen.id,
                node_id=d_chosen.pickup,
                node_name=p_node_name,
                arrival_time=round(pickup_arrival, 1),
                departure_time=round(pickup_depart, 1),
                distance_from_prev_km=round(pickup_dist, 2),
                travel_time_from_prev_min=round(pickup_time_prev, 1),
                deadline=None,
                slack=None,
                status="Departed",
                current_load_kg=round(current_load_kg, 1)
            ))
            stop_counter += 1
            if chosen["path_to_pickup"]:
                for n in chosen["path_to_pickup"][1:]:
                    if not route_sequence_nodes or route_sequence_nodes[-1] != n:
                        route_sequence_nodes.append(n)
            current_node = d_chosen.pickup
            onboard_packages.add(d_chosen.id)

        # Drop stop
        current_time += chosen["time_to_drop"]
        drop_arrival = current_time
        drop_slack = d_chosen.deadline - drop_arrival
        drop_status = "On-time" if drop_slack >= 0 else "Late"
        drop_depart = current_time + d_chosen.service_time
        current_time = drop_depart
        current_load_kg = max(0.0, current_load_kg - d_chosen.weight)

        drop_node_name = graph.nodes_dict[d_chosen.drop].name if d_chosen.drop in graph.nodes_dict else d_chosen.drop
        stops.append(RouteStop(
            stop_number=stop_counter,
            type=f"Drop ({d_chosen.id})",
            delivery_id=d_chosen.id,
            node_id=d_chosen.drop,
            node_name=drop_node_name,
            arrival_time=round(drop_arrival, 1),
            departure_time=round(drop_depart, 1),
            distance_from_prev_km=round(chosen["dist_to_drop"], 2),
            travel_time_from_prev_min=round(chosen["time_to_drop"], 1),
            deadline=round(d_chosen.deadline, 1),
            slack=round(drop_slack, 1),
            status=drop_status,
            current_load_kg=round(current_load_kg, 1)
        ))
        stop_counter += 1

        if chosen["path_to_drop"]:
            for n in chosen["path_to_drop"][1:]:
                if not route_sequence_nodes or route_sequence_nodes[-1] != n:
                    route_sequence_nodes.append(n)
        current_node = d_chosen.drop

        # Remove fulfilled delivery
        del pending_deliveries[d_chosen.id]

    # Return to depot leg
    if current_node != vehicle.depot:
        path_back, dist_back, time_back, _ = graph.shortest_path(current_node, vehicle.depot)
        current_time += time_back
        stops.append(RouteStop(
            stop_number=stop_counter,
            type="Depot (Return)",
            node_id=vehicle.depot,
            node_name=depot_name,
            arrival_time=round(current_time, 1),
            departure_time=round(current_time, 1),
            distance_from_prev_km=round(dist_back, 2),
            travel_time_from_prev_min=round(time_back, 1),
            deadline=None,
            slack=None,
            status="Depot",
            current_load_kg=0.0
        ))
        if path_back:
            for n in path_back[1:]:
                if not route_sequence_nodes or route_sequence_nodes[-1] != n:
                    route_sequence_nodes.append(n)

    return stops, route_sequence_nodes, greedy_decision_steps
