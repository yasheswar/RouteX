import random
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models.schemas import (
    Delivery, Vehicle, Node, Edge, NetworkGraph,
    OptimizationRequest, OptimizationResult,
    SimulationRequest, ComparisonResult, StrategyResult
)
from .data.dataset import (
    get_default_nodes, get_default_edges,
    get_default_deliveries, get_default_vehicle
)
from .algorithms.routing import run_routex_optimization, run_strategy_comparison
from .algorithms.knapsack import solve_knapsack_01
from .algorithms.dijkstra import GraphNetwork
from .algorithms.greedy import construct_greedy_route, compute_greedy_priority_table

app = FastAPI(
    title="RouteX Optimization Engine",
    description="Algorithmic Decision-Support and Route Optimizer for Last-Mile Logistics",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory single source of truth state
state_nodes: List[Node] = get_default_nodes()
state_edges: List[Edge] = get_default_edges()
state_deliveries: List[Delivery] = get_default_deliveries()
state_vehicle: Vehicle = get_default_vehicle()
latest_optimization: Optional[OptimizationResult] = None


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RouteX Engine"}


@app.get("/api/network", response_model=NetworkGraph)
def get_network():
    return NetworkGraph(nodes=state_nodes, edges=state_edges)


@app.get("/api/deliveries", response_model=List[Delivery])
def get_deliveries():
    return state_deliveries


@app.post("/api/deliveries", response_model=Delivery)
def add_delivery(delivery: Delivery):
    global state_deliveries, latest_optimization
    latest_optimization = None
    # Check for duplicate ID
    if any(d.id.upper() == delivery.id.upper() for d in state_deliveries):
        raise HTTPException(status_code=400, detail=f"Delivery with ID '{delivery.id}' already exists.")
    
    # Check if pickup and drop nodes exist
    node_ids = {n.id for n in state_nodes}
    if delivery.pickup not in node_ids:
        raise HTTPException(status_code=400, detail=f"Pickup node '{delivery.pickup}' does not exist.")
    if delivery.drop not in node_ids:
        raise HTTPException(status_code=400, detail=f"Drop node '{delivery.drop}' does not exist.")
    
    state_deliveries.append(delivery)
    return delivery


@app.put("/api/deliveries/{delivery_id}", response_model=Delivery)
def update_delivery(delivery_id: str, updated: Delivery):
    global state_deliveries, latest_optimization
    latest_optimization = None
    for i, d in enumerate(state_deliveries):
        if d.id.upper() == delivery_id.upper():
            state_deliveries[i] = updated
            return updated
    raise HTTPException(status_code=404, detail=f"Delivery '{delivery_id}' not found.")


@app.delete("/api/deliveries/{delivery_id}")
def delete_delivery(delivery_id: str):
    global state_deliveries, latest_optimization
    latest_optimization = None
    initial_len = len(state_deliveries)
    state_deliveries = [d for d in state_deliveries if d.id.upper() != delivery_id.upper()]
    if len(state_deliveries) == initial_len:
        raise HTTPException(status_code=404, detail=f"Delivery '{delivery_id}' not found.")
    return {"message": f"Delivery {delivery_id} deleted successfully."}


@app.post("/api/deliveries/reset", response_model=List[Delivery])
def reset_deliveries():
    global state_deliveries, state_vehicle, latest_optimization
    latest_optimization = None
    state_deliveries = get_default_deliveries()
    state_vehicle = get_default_vehicle()
    return state_deliveries


@app.post("/api/deliveries/clear", response_model=List[Delivery])
def clear_deliveries():
    global state_deliveries, latest_optimization
    latest_optimization = None
    state_deliveries = []
    return state_deliveries


@app.get("/api/vehicle", response_model=Vehicle)
def get_vehicle():
    return state_vehicle


@app.put("/api/vehicle", response_model=Vehicle)
def update_vehicle(vehicle: Vehicle):
    global state_vehicle, latest_optimization
    latest_optimization = None
    state_vehicle = vehicle
    return state_vehicle


@app.post("/api/optimize", response_model=OptimizationResult)
def optimize_route(request: Optional[OptimizationRequest] = None):
    global latest_optimization, state_deliveries, state_vehicle
    
    deliveries_to_use = request.deliveries if (request and request.deliveries is not None) else state_deliveries
    vehicle_to_use = request.vehicle if (request and request.vehicle is not None) else state_vehicle

    result = run_routex_optimization(
        deliveries=deliveries_to_use,
        vehicle=vehicle_to_use,
        graph_nodes=state_nodes,
        graph_edges=state_edges
    )
    
    # Update delivery statuses in memory if using state_deliveries
    if deliveries_to_use is state_deliveries:
        selected_set = set(result.selected_deliveries)
        for d in state_deliveries:
            d.status = "Selected" if d.id in selected_set else "Rejected"

    latest_optimization = result
    return result


@app.post("/api/compare", response_model=ComparisonResult)
def compare_strategies(request: Optional[OptimizationRequest] = None):
    deliveries_to_use = request.deliveries if (request and request.deliveries is not None) else state_deliveries
    vehicle_to_use = request.vehicle if (request and request.vehicle is not None) else state_vehicle

    return run_strategy_comparison(
        deliveries=deliveries_to_use,
        vehicle=vehicle_to_use,
        graph_nodes=state_nodes,
        graph_edges=state_edges
    )


@app.post("/api/simulate")
def simulate_scenario(req: SimulationRequest):
    """
    Runs What-If parameter sensitivity simulation comparing:
    - Baseline (default settings)
    - New Scenario (user modified capacity, traffic, deliveries, deadline strictness)
    """
    # 1. Baseline Run with current defaults
    baseline_result = run_routex_optimization(
        deliveries=state_deliveries,
        vehicle=state_vehicle,
        graph_nodes=state_nodes,
        graph_edges=state_edges
    )

    # 2. Synthesize Scenario Deliveries based on parameters and seed
    rng = random.Random(req.seed if req.seed is not None else 42)
    
    # Sample or generate req.num_deliveries
    node_ids = [n.id for n in state_nodes]
    scenario_deliveries: List[Delivery] = []
    
    for i in range(1, req.num_deliveries + 1):
        p_node = rng.choice(node_ids)
        d_node = rng.choice([n for n in node_ids if n != p_node] or node_ids)
        w = round(rng.uniform(1.5, 7.5), 1)
        p = round(rng.uniform(250, 950), 0)
        # Scale deadline according to max_delivery_time slider
        dl = round(rng.uniform(15.0, req.max_delivery_time), 1)
        prio = rng.choice(["High", "Medium", "Low"])
        scenario_deliveries.append(Delivery(
            id=f"S{i:02d}",
            pickup=p_node,
            drop=d_node,
            weight=w,
            profit=p,
            deadline=dl,
            priority=prio,
            service_time=3.0
        ))

    # Vehicle with new capacity & traffic multiplier
    scenario_vehicle = Vehicle(
        id=state_vehicle.id,
        capacity=req.capacity,
        depot=state_vehicle.depot,
        max_operating_time=state_vehicle.max_operating_time,
        service_time=state_vehicle.service_time,
        traffic_multiplier=req.traffic_multiplier
    )

    scenario_result = run_routex_optimization(
        deliveries=scenario_deliveries,
        vehicle=scenario_vehicle,
        graph_nodes=state_nodes,
        graph_edges=state_edges
    )

    # Calculate percentage changes
    def pct_change(base: float, new: float) -> str:
        if base == 0:
            return "+0%"
        diff = ((new - base) / base) * 100.0
        sign = "+" if diff > 0 else ""
        return f"{sign}{diff:.1f}%"

    comparison_metrics = [
        {
            "metric": "Total Profit (₹)",
            "baseline": f"₹{baseline_result.total_profit:.0f}",
            "scenario": f"₹{scenario_result.total_profit:.0f}",
            "change": pct_change(baseline_result.total_profit, scenario_result.total_profit),
            "is_positive": scenario_result.total_profit >= baseline_result.total_profit
        },
        {
            "metric": "Total Distance (km)",
            "baseline": f"{baseline_result.total_distance_km:.1f} km",
            "scenario": f"{scenario_result.total_distance_km:.1f} km",
            "change": pct_change(baseline_result.total_distance_km, scenario_result.total_distance_km),
            "is_positive": scenario_result.total_distance_km <= baseline_result.total_distance_km
        },
        {
            "metric": "On-Time Deliveries",
            "baseline": f"{baseline_result.on_time_count} / {len(baseline_result.selected_deliveries)} ({baseline_result.on_time_percentage:.0f}%)",
            "scenario": f"{scenario_result.on_time_count} / {len(scenario_result.selected_deliveries)} ({scenario_result.on_time_percentage:.0f}%)",
            "change": pct_change(baseline_result.on_time_percentage, scenario_result.on_time_percentage),
            "is_positive": scenario_result.on_time_percentage >= baseline_result.on_time_percentage
        },
        {
            "metric": "Vehicle Load",
            "baseline": f"{baseline_result.total_weight:.1f} / {state_vehicle.capacity:.0f} kg ({baseline_result.vehicle_utilization:.0f}%)",
            "scenario": f"{scenario_result.total_weight:.1f} / {req.capacity:.0f} kg ({scenario_result.vehicle_utilization:.0f}%)",
            "change": pct_change(baseline_result.vehicle_utilization, scenario_result.vehicle_utilization),
            "is_positive": scenario_result.vehicle_utilization >= 75.0
        },
        {
            "metric": "Total Route Time",
            "baseline": f"{baseline_result.total_route_time_min:.1f} min",
            "scenario": f"{scenario_result.total_route_time_min:.1f} min",
            "change": pct_change(baseline_result.total_route_time_min, scenario_result.total_route_time_min),
            "is_positive": scenario_result.total_route_time_min <= baseline_result.total_route_time_min
        }
    ]

    summary_note = (
        f"Sensitivity Result: Operating with {req.capacity:.0f} kg capacity and {req.traffic_multiplier:.2f}x traffic "
        f"resulted in ₹{scenario_result.total_profit:.0f} revenue across {len(scenario_result.selected_deliveries)} selected deliveries "
        f"with {scenario_result.on_time_percentage:.1f}% deadline compliance."
    )

    return {
        "baseline": baseline_result,
        "scenario": scenario_result,
        "comparison_metrics": comparison_metrics,
        "summary_note": summary_note
    }


@app.get("/api/visualizer/trace")
def get_visualizer_traces():
    """
    Returns pre-computed trace data for:
    - 0/1 Knapsack DP step-by-step
    - Dijkstra shortest path step-by-step
    - Greedy route sequencing step-by-step
    """
    # Run DP with small step size to get detailed cell-by-cell evaluations
    _, _, dp_table, dp_steps = solve_knapsack_01(state_deliveries, state_vehicle.capacity, capacity_step=2)
    
    # Run Dijkstra between A and H or F
    graph = GraphNetwork(state_nodes, state_edges, traffic_multiplier=state_vehicle.traffic_multiplier)
    path, dist, t, dijkstra_steps = graph.shortest_path("A", "D", record_trace=True)

    # Run Greedy trace
    selected, _, _, _ = solve_knapsack_01(state_deliveries, state_vehicle.capacity)
    _, _, greedy_steps = construct_greedy_route(selected, state_vehicle, graph)

    return {
        "knapsack_trace": dp_steps,
        "knapsack_table": dp_table,
        "dijkstra_trace": dijkstra_steps,
        "dijkstra_path": path,
        "dijkstra_target": {"from": "A", "to": "D", "dist": dist, "time": t},
        "greedy_trace": greedy_steps
    }


@app.get("/api/report")
def get_operational_report():
    """
    Returns full operational and academic report data for printing / CSV export.
    """
    opt = latest_optimization or run_routex_optimization(
        state_deliveries, state_vehicle, state_nodes, state_edges
    )
    
    academic_complexities = [
        {
            "algorithm": "0/1 Knapsack Dynamic Programming",
            "role": "Capacity-Constrained Profit Maximization Selection",
            "time_complexity": "O(n · C)",
            "space_complexity": "O(n · C)",
            "type": "Optimal (Exact)",
            "description": "Computes exact global maximum profit subset via recurrence dp[i][c] = max(dp[i-1][c], profit + dp[i-1][c-w]). Backtracks indices."
        },
        {
            "algorithm": "Dijkstra's Shortest Path",
            "role": "Urban Road Network Travel Distance & Time Calculation",
            "time_complexity": "O((V + E) log V)",
            "space_complexity": "O(V + E)",
            "type": "Optimal (Shortest Path)",
            "description": "Utilizes min-heap priority queue to guarantee lowest travel-time paths under variable traffic congestion multipliers."
        },
        {
            "algorithm": "Multi-Factor Greedy Route Construction",
            "role": "Deadline-Aware Dispatch & Stop Sequencing",
            "time_complexity": "O(k²)",
            "space_complexity": "O(k)",
            "type": "Heuristic (Approximation)",
            "description": "Repeatedly prioritizes feasible deliveries with highest Urgency/Travel-Cost ratio score: (Profit · Urgency)/(Weight · TravelTime)."
        },
        {
            "algorithm": "Operational Feasibility Validator",
            "role": "Multi-Constraint Timeline & Precedence Verification",
            "time_complexity": "O(k)",
            "space_complexity": "O(k)",
            "type": "Exact Verification",
            "description": "Verifies Σ weight ≤ Capacity, ETA ≤ Deadline (Slack ≥ 0), Shift Limit, and Pickup-before-Drop precedence."
        }
    ]

    return {
        "title": "RouteX Operational & Algorithmic Dispatch Report",
        "timestamp": opt.timestamp,
        "vehicle": state_vehicle,
        "total_deliveries": len(state_deliveries),
        "metrics": {
            "total_profit": opt.total_profit,
            "total_weight": opt.total_weight,
            "vehicle_capacity": state_vehicle.capacity,
            "utilization_pct": opt.vehicle_utilization,
            "total_distance_km": opt.total_distance_km,
            "total_time_min": opt.total_route_time_min,
            "selected_count": len(opt.selected_deliveries),
            "rejected_count": len(opt.rejected_deliveries),
            "on_time_count": opt.on_time_count,
            "late_count": opt.late_count,
            "on_time_percentage": opt.on_time_percentage
        },
        "selected_deliveries": opt.selected_deliveries,
        "rejected_deliveries": opt.rejected_deliveries,
        "stops": opt.stops,
        "complexities": academic_complexities,
        "validation_notes": opt.validation_notes
    }
