import heapq
from typing import Dict, List, Tuple, Optional, Any
from ..models.schemas import Node, Edge, NetworkGraph


class GraphNetwork:
    """
    Weighted road network graph with Dijkstra Shortest Path calculation.
    
    Time Complexity: O((V + E) log V) using a binary min-heap.
    Space Complexity: O(V + E) for adjacency list representation.
    """
    def __init__(self, nodes: List[Node], edges: List[Edge], traffic_multiplier: float = 1.0):
        self.nodes_dict: Dict[str, Node] = {n.id: n for n in nodes}
        self.traffic_multiplier = max(0.5, traffic_multiplier)
        self.adj: Dict[str, List[Tuple[str, float, float]]] = {n.id: [] for n in nodes}
        
        for e in edges:
            effective_time = e.travel_time_min * self.traffic_multiplier
            # Road network is bidirectional unless directed
            self.adj[e.from_node].append((e.to_node, e.distance_km, effective_time))
            self.adj[e.to_node].append((e.from_node, e.distance_km, effective_time))

    def shortest_path(
        self,
        start_node: str,
        end_node: str,
        record_trace: bool = False
    ) -> Tuple[List[str], float, float, List[Dict[str, Any]]]:
        """
        Calculates shortest path from start_node to end_node using Dijkstra's algorithm.
        Returns:
          (path_nodes, total_distance_km, total_travel_time_min, trace_steps)
        """
        if start_node not in self.nodes_dict or end_node not in self.nodes_dict:
            return [], 0.0, 0.0, []

        if start_node == end_node:
            return [start_node], 0.0, 0.0, []

        # Min-heap priority queue storing: (cumulative_time, cumulative_dist, current_node)
        pq: List[Tuple[float, float, str]] = [(0.0, 0.0, start_node)]
        
        best_time: Dict[str, float] = {node_id: float('inf') for node_id in self.nodes_dict}
        best_dist: Dict[str, float] = {node_id: float('inf') for node_id in self.nodes_dict}
        parent: Dict[str, Optional[str]] = {node_id: None for node_id in self.nodes_dict}
        
        best_time[start_node] = 0.0
        best_dist[start_node] = 0.0
        visited = set()

        trace_steps: List[Dict[str, Any]] = []

        if record_trace:
            trace_steps.append({
                "type": "INITIALIZE",
                "start": start_node,
                "target": end_node,
                "explanation": f"Initialize Dijkstra from {start_node} ({self.nodes_dict[start_node].name}) to {end_node} ({self.nodes_dict[end_node].name}). Set dist[{start_node}] = 0, others = INF."
            })

        while pq:
            curr_time, curr_dist, u = heapq.heappop(pq)

            if u in visited:
                continue
            visited.add(u)

            if record_trace:
                trace_steps.append({
                    "type": "VISIT_NODE",
                    "current_node": u,
                    "current_node_name": self.nodes_dict[u].name,
                    "cumulative_time": round(curr_time, 2),
                    "cumulative_dist": round(curr_dist, 2),
                    "visited_count": len(visited),
                    "explanation": f"Extracted min-time node {u} ({self.nodes_dict[u].name}) with travel time {curr_time:.1f} min."
                })

            if u == end_node:
                break

            for v, dist_uv, time_uv in self.adj.get(u, []):
                if v in visited:
                    continue

                new_time = curr_time + time_uv
                new_dist = curr_dist + dist_uv

                if new_time < best_time[v]:
                    old_time = best_time[v]
                    best_time[v] = new_time
                    best_dist[v] = new_dist
                    parent[v] = u
                    heapq.heappush(pq, (new_time, new_dist, v))

                    if record_trace:
                        trace_steps.append({
                            "type": "RELAX_EDGE",
                            "from_node": u,
                            "to_node": v,
                            "edge_time": round(time_uv, 2),
                            "old_time": "INF" if old_time == float('inf') else round(old_time, 2),
                            "new_time": round(new_time, 2),
                            "explanation": (
                                f"Relaxing edge {u} -> {v}: new travel time {new_time:.1f} min is shorter "
                                f"than previous ({'INF' if old_time == float('inf') else f'{old_time:.1f} min'}). Updated!"
                            )
                        })

        # Reconstruct path
        if best_time[end_node] == float('inf'):
            # No path found
            return [], 0.0, 0.0, trace_steps

        path = []
        curr: Optional[str] = end_node
        while curr is not None:
            path.append(curr)
            curr = parent[curr]
        path.reverse()

        if record_trace:
            trace_steps.append({
                "type": "COMPLETED",
                "path": path,
                "total_time": round(best_time[end_node], 2),
                "total_dist": round(best_dist[end_node], 2),
                "explanation": f"Optimal shortest path found: {' -> '.join(path)} in {best_time[end_node]:.1f} min ({best_dist[end_node]:.1f} km)."
            })

        return path, round(best_dist[end_node], 2), round(best_time[end_node], 2), trace_steps

    def compute_all_pairs(self) -> Dict[Tuple[str, str], Tuple[List[str], float, float]]:
        """
        Precomputes all-pairs shortest paths using Dijkstra from each node.
        Returns map: (start, end) -> (path, distance_km, travel_time_min)
        """
        all_pairs = {}
        for start_id in self.nodes_dict:
            for end_id in self.nodes_dict:
                if start_id == end_id:
                    all_pairs[(start_id, end_id)] = ([start_id], 0.0, 0.0)
                else:
                    path, dist, t, _ = self.shortest_path(start_id, end_id, record_trace=False)
                    all_pairs[(start_id, end_id)] = (path, dist, t)
        return all_pairs
