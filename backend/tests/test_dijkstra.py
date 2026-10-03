import pytest
from backend.app.models.schemas import Node, Edge
from backend.app.algorithms.dijkstra import GraphNetwork


def test_dijkstra_normal_graph():
    nodes = [
        Node(id="A", name="Depot", lat=10.0, lng=20.0),
        Node(id="B", name="Station B", lat=10.1, lng=20.1),
        Node(id="C", name="Station C", lat=10.2, lng=20.2),
    ]
    edges = [
        Edge(from_node="A", to_node="B", distance_km=2.0, travel_time_min=5.0),
        Edge(from_node="B", to_node="C", distance_km=3.0, travel_time_min=6.0),
        Edge(from_node="A", to_node="C", distance_km=10.0, travel_time_min=20.0),
    ]
    graph = GraphNetwork(nodes, edges, traffic_multiplier=1.0)
    path, dist, travel_time, trace = graph.shortest_path("A", "C", record_trace=True)
    assert path == ["A", "B", "C"]
    assert dist == 5.0
    assert travel_time == 11.0
    assert len(trace) > 0


def test_dijkstra_single_node():
    nodes = [Node(id="A", name="Depot", lat=10.0, lng=20.0)]
    edges = []
    graph = GraphNetwork(nodes, edges)
    path, dist, travel_time, _ = graph.shortest_path("A", "A")
    assert path == ["A"]
    assert dist == 0.0
    assert travel_time == 0.0


def test_dijkstra_disconnected_graph():
    nodes = [
        Node(id="A", name="Island 1", lat=10.0, lng=20.0),
        Node(id="B", name="Island 2", lat=20.0, lng=30.0),
    ]
    edges = []  # No bridge
    graph = GraphNetwork(nodes, edges)
    path, dist, travel_time, _ = graph.shortest_path("A", "B")
    assert path == []
    assert dist == 0.0
    assert travel_time == 0.0
