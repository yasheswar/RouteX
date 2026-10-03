import datetime
from typing import List, Tuple, Dict, Any
from ..models.schemas import (
    Delivery, Vehicle, Node, Edge, NetworkGraph,
    OptimizationResult, StrategyResult, ComparisonResult, RouteStop
)
from .knapsack import solve_knapsack_01
from .dijkstra import GraphNetwork
from .greedy import construct_greedy_route, compute_greedy_priority_table
from .validation import validate_solution


def construct_sequential_route(
    deliveries: List[Delivery],
    vehicle: Vehicle,
    graph: GraphNetwork
) -> List[RouteStop]:
    """
    Constructs a baseline route following the exact provided sequence of deliveries
    without deadline-aware priority dynamic lookahead.
    """
    if not deliveries:
        depot_name = graph.nodes_dict[vehicle.depot].name if vehicle.depot in graph.nodes_dict else vehicle.depot
        return [
            RouteStop(
                stop_number=0,
                type="Depot (Hub)",
                node_id=vehicle.depot,
                node_name=depot_name,
                arrival_time=0.0,
                departure_time=0.0,
                distance_from_prev_km=0.0,
                travel_time_from_prev_min=0.0,
                status="Depot"
            )
        ]

    current_node = vehicle.depot
    current_time = 0.0
    stops: List[RouteStop] = []
    depot_name = graph.nodes_dict[vehicle.depot].name if vehicle.depot in graph.nodes_dict else vehicle.depot

    onboard_packages = {d.id for d in deliveries if d.pickup == vehicle.depot}
    current_load_kg = sum(d.weight for d in deliveries if d.pickup == vehicle.depot)
    loaded_str = f" ({len(onboard_packages)} orders loaded)" if onboard_packages else ""
    stops.append(RouteStop(
        stop_number=0,
        type=f"Depot - Dispatch{loaded_str}",
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

    for d in deliveries:
        # If not already onboard, visit external pickup first
        if d.id not in onboard_packages:
            if current_node != d.pickup:
                _, dist_p, time_p, _ = graph.shortest_path(current_node, d.pickup)
                current_time += time_p
                current_load_kg += d.weight
                p_name = graph.nodes_dict[d.pickup].name if d.pickup in graph.nodes_dict else d.pickup
                stops.append(RouteStop(
                    stop_number=stop_counter,
                    type=f"Pickup ({d.id})",
                    delivery_id=d.id,
                    node_id=d.pickup,
                    node_name=p_name,
                    arrival_time=round(current_time, 1),
                    departure_time=round(current_time + (vehicle.service_time * 0.5), 1),
                    distance_from_prev_km=round(dist_p, 2),
                    travel_time_from_prev_min=round(time_p, 1),
                    deadline=None,
                    slack=None,
                    status="Departed",
                    current_load_kg=round(current_load_kg, 1)
                ))
                current_time += vehicle.service_time * 0.5
                stop_counter += 1
                current_node = d.pickup
            onboard_packages.add(d.id)

        # Drop stop
        _, dist_d, time_d, _ = graph.shortest_path(current_node, d.drop)
        current_time += time_d
        slack = d.deadline - current_time
        status = "On-time" if slack >= 0 else "Late"
        current_load_kg = max(0.0, current_load_kg - d.weight)
        d_name = graph.nodes_dict[d.drop].name if d.drop in graph.nodes_dict else d.drop
        stops.append(RouteStop(
            stop_number=stop_counter,
            type=f"Drop ({d.id})",
            delivery_id=d.id,
            node_id=d.drop,
            node_name=d_name,
            arrival_time=round(current_time, 1),
            departure_time=round(current_time + d.service_time, 1),
            distance_from_prev_km=round(dist_d, 2),
            travel_time_from_prev_min=round(time_d, 1),
            deadline=round(d.deadline, 1),
            slack=round(slack, 1),
            status=status,
            current_load_kg=round(current_load_kg, 1)
        ))
        current_time += d.service_time
        stop_counter += 1
        current_node = d.drop

    # Return to depot
    if current_node != vehicle.depot:
        _, dist_ret, time_ret, _ = graph.shortest_path(current_node, vehicle.depot)
        current_time += time_ret
        stops.append(RouteStop(
            stop_number=stop_counter,
            type="Depot (Return)",
            node_id=vehicle.depot,
            node_name=depot_name,
            arrival_time=round(current_time, 1),
            departure_time=round(current_time, 1),
            distance_from_prev_km=round(dist_ret, 2),
            travel_time_from_prev_min=round(time_ret, 1),
            deadline=None,
            slack=None,
            status="Depot",
            current_load_kg=0.0
        ))

    return stops


def run_routex_optimization(
    deliveries: List[Delivery],
    vehicle: Vehicle,
    graph_nodes: List[Node],
    graph_edges: List[Edge]
) -> OptimizationResult:
    """
    Executes the full RouteX multi-stage algorithmic optimization pipeline.
    """
    graph = GraphNetwork(graph_nodes, graph_edges, traffic_multiplier=vehicle.traffic_multiplier)
    
    # Stage 2: 0/1 Knapsack DP
    selected_deliveries, rejected_deliveries, dp_table_data, dp_steps = solve_knapsack_01(
        deliveries=deliveries,
        capacity=vehicle.capacity
    )
    
    # Priority table calculation
    greedy_priority_table = compute_greedy_priority_table(
        deliveries=deliveries,
        depot_node=vehicle.depot,
        graph=graph,
        traffic_multiplier=vehicle.traffic_multiplier
    )

    # Stage 3: Greedy Route Construction
    stops, route_nodes, greedy_steps = construct_greedy_route(
        selected_deliveries=selected_deliveries,
        vehicle=vehicle,
        graph=graph
    )

    # Sample Dijkstra trace from depot to first stop for visualizer
    dijkstra_trace = []
    if len(route_nodes) > 1:
        _, _, _, dijkstra_trace = graph.shortest_path(route_nodes[0], route_nodes[1], record_trace=True)

    # Stage 4: Validation
    passed, notes, on_time, late, on_time_pct = validate_solution(
        selected_deliveries=selected_deliveries,
        vehicle=vehicle,
        stops=stops
    )

    # Calculate Aggregates
    total_profit = sum(d.profit for d in selected_deliveries)
    total_weight = sum(d.weight for d in selected_deliveries)
    total_dist = sum(s.distance_from_prev_km for s in stops)
    total_time = stops[-1].departure_time if stops else 0.0
    utilization = (total_weight / vehicle.capacity * 100.0) if vehicle.capacity > 0 else 0.0

    # Build full lat/lng coordinates sequence for Leaflet polyline
    full_coords: List[List[float]] = []
    for node_id in route_nodes:
        if node_id in graph.nodes_dict:
            n = graph.nodes_dict[node_id]
            full_coords.append([n.lat, n.lng])

    return OptimizationResult(
        selected_deliveries=[d.id for d in selected_deliveries],
        rejected_deliveries=[d.id for d in rejected_deliveries],
        total_profit=round(total_profit, 2),
        total_weight=round(total_weight, 2),
        total_distance_km=round(total_dist, 2),
        total_route_time_min=round(total_time, 1),
        on_time_count=on_time,
        late_count=late,
        on_time_percentage=on_time_pct,
        vehicle_utilization=round(utilization, 1),
        stops=stops,
        route_sequence_nodes=route_nodes,
        full_path_coords=full_coords,
        dp_table=dp_table_data,
        greedy_priorities=greedy_priority_table,
        greedy_steps=greedy_steps,
        dijkstra_steps=dijkstra_trace,
        validation_passed=passed,
        validation_notes=notes,
        timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


def run_strategy_comparison(
    deliveries: List[Delivery],
    vehicle: Vehicle,
    graph_nodes: List[Node],
    graph_edges: List[Edge]
) -> ComparisonResult:
    """
    Executes 3 distinct algorithmic strategies on the identical input dataset:
    1. Nearest Neighbor Heuristic
    2. Pure Profit-Based Greedy Selection
    3. RouteX Multi-Stage (0/1 DP + Deadline-Aware Greedy + Dijkstra)
    """
    graph = GraphNetwork(graph_nodes, graph_edges, traffic_multiplier=vehicle.traffic_multiplier)

    # Strategy 1: Nearest Neighbor
    nn_selected: List[Delivery] = []
    current_cap = vehicle.capacity
    current_node = vehicle.depot
    remaining = list(deliveries)

    while remaining:
        fitting = [d for d in remaining if d.weight <= current_cap]
        if not fitting:
            break
        best_d = min(fitting, key=lambda d: graph.shortest_path(current_node, d.pickup)[1])
        nn_selected.append(best_d)
        current_cap -= best_d.weight
        current_node = best_d.drop
        remaining.remove(best_d)

    nn_stops = construct_sequential_route(nn_selected, vehicle, graph)
    _, _, nn_on_time, nn_late, nn_on_time_pct = validate_solution(nn_selected, vehicle, nn_stops)
    nn_profit = sum(d.profit for d in nn_selected)
    nn_weight = sum(d.weight for d in nn_selected)
    nn_dist = sum(s.distance_from_prev_km for s in nn_stops)
    nn_time = nn_stops[-1].departure_time if nn_stops else 0.0

    res_nn = StrategyResult(
        strategy_name="Nearest Neighbor",
        description="Selects nearest geographic order greedily. Ignores profit optimization and deadline urgency.",
        total_profit=round(nn_profit, 2),
        total_distance_km=round(nn_dist, 2),
        total_route_time_min=round(nn_time, 1),
        on_time_count=nn_on_time,
        late_count=nn_late,
        on_time_percentage=nn_on_time_pct,
        vehicle_utilization=round((nn_weight / vehicle.capacity * 100) if vehicle.capacity else 0, 1),
        selected_count=len(nn_selected),
        rejected_count=len(deliveries) - len(nn_selected),
        selected_deliveries=[d.id for d in nn_selected],
        stops_count=len(nn_stops)
    )

    # Strategy 2: Profit-Based Greedy
    sorted_by_ratio = sorted(deliveries, key=lambda d: (d.profit / max(0.1, d.weight)), reverse=True)
    pg_selected: List[Delivery] = []
    cap_left = vehicle.capacity
    for d in sorted_by_ratio:
        if d.weight <= cap_left:
            pg_selected.append(d)
            cap_left -= d.weight

    pg_stops = construct_sequential_route(pg_selected, vehicle, graph)
    _, _, pg_on_time, pg_late, pg_on_time_pct = validate_solution(pg_selected, vehicle, pg_stops)
    pg_profit = sum(d.profit for d in pg_selected)
    pg_weight = sum(d.weight for d in pg_selected)
    pg_dist = sum(s.distance_from_prev_km for s in pg_stops)
    pg_time = pg_stops[-1].departure_time if pg_stops else 0.0

    res_pg = StrategyResult(
        strategy_name="Profit-based Greedy",
        description="Packs orders by Profit/Weight ratio in fixed order. Lacks dynamic travel-time lookahead and deadline urgency scoring.",
        total_profit=round(pg_profit, 2),
        total_distance_km=round(pg_dist, 2),
        total_route_time_min=round(pg_time, 1),
        on_time_count=pg_on_time,
        late_count=pg_late,
        on_time_percentage=pg_on_time_pct,
        vehicle_utilization=round((pg_weight / vehicle.capacity * 100) if vehicle.capacity else 0, 1),
        selected_count=len(pg_selected),
        rejected_count=len(deliveries) - len(pg_selected),
        selected_deliveries=[d.id for d in pg_selected],
        stops_count=len(pg_stops)
    )

    # Strategy 3: RouteX (DP Knapsack + Deadline-aware Greedy + Dijkstra)
    routex_res = run_routex_optimization(deliveries, vehicle, graph_nodes, graph_edges)
    res_routex = StrategyResult(
        strategy_name="RouteX (DP + Greedy + Dijkstra)",
        description="Optimal 0/1 Knapsack selection combined with multi-factor deadline-aware greedy sequencing and Dijkstra shortest paths.",
        total_profit=routex_res.total_profit,
        total_distance_km=routex_res.total_distance_km,
        total_route_time_min=routex_res.total_route_time_min,
        on_time_count=routex_res.on_time_count,
        late_count=routex_res.late_count,
        on_time_percentage=routex_res.on_time_percentage,
        vehicle_utilization=routex_res.vehicle_utilization,
        selected_count=len(routex_res.selected_deliveries),
        rejected_count=len(routex_res.rejected_deliveries),
        selected_deliveries=routex_res.selected_deliveries,
        stops_count=len(routex_res.stops)
    )

    analysis_text = (
        f"Comparative Analysis: RouteX achieves Rs.{res_routex.total_profit:.0f} revenue with "
        f"{res_routex.on_time_percentage:.1f}% on-time compliance. In contrast, Nearest Neighbor prioritized short distances "
        f"yielding only Rs.{res_nn.total_profit:.0f} profit, while Profit-based Greedy yielded lower on-time rates "
        f"({res_pg.on_time_percentage:.1f}%) due to ignorance of deadline urgency and dynamic network travel times."
    )

    return ComparisonResult(
        strategies=[res_nn, res_pg, res_routex],
        analysis=analysis_text
    )
