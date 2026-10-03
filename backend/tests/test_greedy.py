import pytest
from backend.app.models.schemas import Delivery, Vehicle, Node, Edge
from backend.app.algorithms.dijkstra import GraphNetwork
from backend.app.algorithms.greedy import construct_greedy_route, compute_greedy_priority_table


@pytest.fixture
def sample_network():
    nodes = [
        Node(id="A", name="Depot", lat=12.9, lng=77.5),
        Node(id="B", name="East", lat=12.9, lng=77.6),
        Node(id="C", name="North", lat=13.0, lng=77.5),
    ]
    edges = [
        Edge(from_node="A", to_node="B", distance_km=3.0, travel_time_min=5.0),
        Edge(from_node="B", to_node="C", distance_km=4.0, travel_time_min=6.0),
        Edge(from_node="A", to_node="C", distance_km=5.0, travel_time_min=8.0),
    ]
    return GraphNetwork(nodes, edges), Vehicle(id="V1", capacity=20.0, depot="A")


def test_greedy_feasible_deliveries(sample_network):
    graph, vehicle = sample_network
    deliveries = [
        Delivery(id="D1", pickup="A", drop="B", weight=3.0, profit=500.0, deadline=30.0),
        Delivery(id="D2", pickup="A", drop="C", weight=4.0, profit=800.0, deadline=40.0),
    ]
    stops, route_nodes, steps = construct_greedy_route(deliveries, vehicle, graph)
    assert len(stops) >= 3  # Depot, drops, return
    assert len(steps) == 2
    # Check that all stops have valid arrivals
    assert stops[-1].status == "Depot"


def test_greedy_impossible_deadlines(sample_network):
    graph, vehicle = sample_network
    # Deadline 1 min is impossible since travel time is >= 5 min
    deliveries = [
        Delivery(id="D_TIGHT", pickup="A", drop="B", weight=3.0, profit=500.0, deadline=1.0)
    ]
    stops, route_nodes, steps = construct_greedy_route(deliveries, vehicle, graph)
    # The algorithm must handle this gracefully without crashing
    drop_stop = [s for s in stops if s.delivery_id == "D_TIGHT"][0]
    assert drop_stop.status == "Late"
    assert drop_stop.slack < 0


def test_greedy_empty_deliveries(sample_network):
    graph, vehicle = sample_network
    stops, route_nodes, steps = construct_greedy_route([], vehicle, graph)
    assert len(stops) == 1
    assert stops[0].node_id == "A"
    assert len(steps) == 0
