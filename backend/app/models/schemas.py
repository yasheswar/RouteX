from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Delivery(BaseModel):
    id: str
    pickup: str
    drop: str
    weight: float = Field(..., ge=0.1, description="Weight in kilograms")
    profit: float = Field(..., ge=0, description="Revenue / Profit in currency units")
    deadline: float = Field(..., ge=1, description="Delivery deadline in minutes from route start")
    priority: str = Field(default="Medium", description="Priority level: High, Medium, Low")
    service_time: float = Field(default=3.0, ge=0, description="Service / unloading time in minutes")
    volume: Optional[float] = Field(default=0.0, description="Volume in m3")
    status: Optional[str] = Field(default="Pending", description="Pending, Selected, Rejected")


class Vehicle(BaseModel):
    id: str = "VAN-01"
    capacity: float = Field(default=20.0, ge=1.0, description="Maximum weight capacity in kg")
    depot: str = Field(default="A", description="Starting / Depot node ID")
    max_operating_time: float = Field(default=480.0, ge=30.0, description="Max shift duration in minutes")
    service_time: float = Field(default=3.0, ge=0, description="Default service time per stop in minutes")
    traffic_multiplier: float = Field(default=1.0, ge=0.5, le=3.0, description="Traffic congestion factor")


class Node(BaseModel):
    id: str
    name: str
    lat: float
    lng: float


class Edge(BaseModel):
    from_node: str
    to_node: str
    distance_km: float
    travel_time_min: float


class NetworkGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class RouteStop(BaseModel):
    stop_number: int
    type: str  # "Depot", "Pickup", "Drop"
    delivery_id: Optional[str] = None
    node_id: str
    node_name: str
    arrival_time: float
    departure_time: float
    distance_from_prev_km: float
    travel_time_from_prev_min: float
    deadline: Optional[float] = None
    slack: Optional[float] = None
    status: str  # "On-time", "Late", "Depot"
    current_load_kg: Optional[float] = None


class GreedyPriorityRow(BaseModel):
    delivery_id: str
    profit: float
    weight: float
    travel_time: float
    deadline: float
    urgency: float
    priority_score: float
    feasible: bool


class DPTableData(BaseModel):
    item_ids: List[str]
    capacities: List[int]
    grid: List[List[float]]
    backtrack_cells: List[List[int]]  # [i, c]
    optimal_profit: float
    selected_ids: List[str]


class OptimizationResult(BaseModel):
    selected_deliveries: List[str]
    rejected_deliveries: List[str]
    total_profit: float
    total_weight: float
    total_distance_km: float
    total_route_time_min: float
    on_time_count: int
    late_count: int
    on_time_percentage: float
    vehicle_utilization: float
    stops: List[RouteStop]
    route_sequence_nodes: List[str]
    full_path_coords: List[List[float]]
    dp_table: DPTableData
    greedy_priorities: List[GreedyPriorityRow]
    greedy_steps: List[Dict[str, Any]]
    dijkstra_steps: List[Dict[str, Any]]
    validation_passed: bool
    validation_notes: List[str]
    timestamp: str


class OptimizationRequest(BaseModel):
    deliveries: Optional[List[Delivery]] = None
    vehicle: Optional[Vehicle] = None


class SimulationRequest(BaseModel):
    capacity: float
    num_deliveries: int
    traffic_multiplier: float
    max_delivery_time: float
    seed: Optional[int] = 42


class StrategyResult(BaseModel):
    strategy_name: str
    description: str
    total_profit: float
    total_distance_km: float
    total_route_time_min: float
    on_time_count: int
    late_count: int
    on_time_percentage: float
    vehicle_utilization: float
    selected_count: int
    rejected_count: int
    selected_deliveries: List[str]
    stops_count: int


class ComparisonResult(BaseModel):
    strategies: List[StrategyResult]
    analysis: str
