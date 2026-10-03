export interface Delivery {
  id: string;
  pickup: string;
  drop: string;
  weight: number;
  profit: number;
  deadline: number;
  priority: 'High' | 'Medium' | 'Low' | string;
  service_time: number;
  volume?: number;
  status?: 'Pending' | 'Selected' | 'Rejected' | string;
}

export interface Vehicle {
  id: string;
  capacity: number;
  depot: string;
  max_operating_time: number;
  service_time: number;
  traffic_multiplier: number;
}

export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Edge {
  from_node: string;
  to_node: string;
  distance_km: number;
  travel_time_min: number;
}

export interface NetworkGraph {
  nodes: Node[];
  edges: Edge[];
}

export interface RouteStop {
  stop_number: number;
  type: string;
  delivery_id?: string | null;
  node_id: string;
  node_name: string;
  arrival_time: number;
  departure_time: number;
  distance_from_prev_km: number;
  travel_time_from_prev_min: number;
  deadline?: number | null;
  slack?: number | null;
  status: 'On-time' | 'Late' | 'Depot' | 'Departed' | string;
  current_load_kg?: number | null;
}

export interface GreedyPriorityRow {
  delivery_id: string;
  profit: number;
  weight: number;
  travel_time: number;
  deadline: number;
  urgency: number;
  priority_score: number;
  feasible: boolean;
}

export interface DPTableData {
  item_ids: string[];
  capacities: number[];
  grid: number[][];
  backtrack_cells: number[][]; // [i, c]
  optimal_profit: number;
  selected_ids: string[];
}

export interface OptimizationResult {
  selected_deliveries: string[];
  rejected_deliveries: string[];
  total_profit: number;
  total_weight: number;
  total_distance_km: number;
  total_route_time_min: number;
  on_time_count: number;
  late_count: number;
  on_time_percentage: number;
  vehicle_utilization: number;
  stops: RouteStop[];
  route_sequence_nodes: string[];
  full_path_coords: [number, number][];
  dp_table: DPTableData;
  greedy_priorities: GreedyPriorityRow[];
  greedy_steps: any[];
  dijkstra_steps: any[];
  validation_passed: boolean;
  validation_notes: string[];
  timestamp: string;
}

export interface StrategyResult {
  strategy_name: string;
  description: string;
  total_profit: number;
  total_distance_km: number;
  total_route_time_min: number;
  on_time_count: number;
  late_count: number;
  on_time_percentage: number;
  vehicle_utilization: number;
  selected_count: number;
  rejected_count: number;
  selected_deliveries: string[];
  stops_count: number;
}

export interface ComparisonResult {
  strategies: StrategyResult[];
  analysis: string;
}

export interface SimulationMetric {
  metric: string;
  baseline: string;
  scenario: string;
  change: string;
  is_positive: boolean;
}

export interface SimulationResponse {
  baseline: OptimizationResult;
  scenario: OptimizationResult;
  comparison_metrics: SimulationMetric[];
  summary_note: string;
}

export interface VisualizerStep {
  step_type: string;
  row_index?: number;
  col_capacity?: number;
  item_id?: string;
  item_weight?: number;
  item_profit?: number;
  exclude_val?: number;
  include_val?: number | null;
  assigned_val?: number;
  decision?: string;
  action?: string;
  explanation: string;
}

export interface VisualizerTracesResponse {
  knapsack_trace: VisualizerStep[];
  knapsack_table: DPTableData;
  dijkstra_trace: any[];
  dijkstra_path: string[];
  dijkstra_target: { from: string; to: string; dist: number; time: number };
  greedy_trace: any[];
}
