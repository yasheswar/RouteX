from typing import List
from ..models.schemas import Node, Edge, Delivery, Vehicle


def get_default_nodes() -> List[Node]:
    """
    10 Realistic Metropolitan Urban Logistics Network Nodes
    Centered around an urban metro district.
    """
    return [
        Node(id="A", name="Central Depot Hub", lat=12.9716, lng=77.5946),
        Node(id="B", name="Commercial Metro District", lat=12.9850, lng=77.6050),
        Node(id="C", name="Tech Park Sector 4", lat=12.9920, lng=77.5850),
        Node(id="D", name="Riverside Logistics Park", lat=12.9600, lng=77.6200),
        Node(id="E", name="Industrial Corridor South", lat=12.9450, lng=77.5900),
        Node(id="F", name="West Residential Complex", lat=12.9550, lng=77.5650),
        Node(id="G", name="North Suburb Terminal", lat=13.0080, lng=77.5750),
        Node(id="H", name="Airport Express Cargo", lat=13.0150, lng=77.6150),
        Node(id="I", name="Harbor Gateway Point", lat=12.9350, lng=77.6150),
        Node(id="J", name="Old Town Merchant Center", lat=12.9750, lng=77.5700),
    ]


def get_default_edges() -> List[Edge]:
    """
    25+ Weighted Road Edges with realistic distances (km) and baseline travel times (min).
    """
    return [
        Edge(from_node="A", to_node="B", distance_km=2.4, travel_time_min=6.0),
        Edge(from_node="A", to_node="C", distance_km=3.1, travel_time_min=8.0),
        Edge(from_node="A", to_node="D", distance_km=3.8, travel_time_min=10.0),
        Edge(from_node="A", to_node="E", distance_km=3.2, travel_time_min=8.0),
        Edge(from_node="A", to_node="F", distance_km=3.6, travel_time_min=9.0),
        Edge(from_node="A", to_node="J", distance_km=2.8, travel_time_min=7.0),
        Edge(from_node="B", to_node="C", distance_km=2.6, travel_time_min=7.0),
        Edge(from_node="B", to_node="D", distance_km=3.5, travel_time_min=9.0),
        Edge(from_node="B", to_node="H", distance_km=4.2, travel_time_min=11.0),
        Edge(from_node="C", to_node="G", distance_km=2.5, travel_time_min=6.0),
        Edge(from_node="C", to_node="F", distance_km=4.5, travel_time_min=12.0),
        Edge(from_node="C", to_node="J", distance_km=2.4, travel_time_min=6.0),
        Edge(from_node="D", to_node="E", distance_km=3.9, travel_time_min=10.0),
        Edge(from_node="D", to_node="I", distance_km=3.1, travel_time_min=8.0),
        Edge(from_node="E", to_node="F", distance_km=3.4, travel_time_min=9.0),
        Edge(from_node="E", to_node="I", distance_km=2.9, travel_time_min=7.0),
        Edge(from_node="F", to_node="J", distance_km=2.7, travel_time_min=7.0),
        Edge(from_node="G", to_node="H", distance_km=4.4, travel_time_min=11.0),
        Edge(from_node="G", to_node="J", distance_km=3.9, travel_time_min=10.0),
        Edge(from_node="H", to_node="D", distance_km=6.2, travel_time_min=15.0),
        Edge(from_node="I", to_node="A", distance_km=4.8, travel_time_min=12.0),
    ]


def get_default_deliveries() -> List[Delivery]:
    """
    15 Realistic Delivery Requests creating meaningful algorithmic trade-offs.
    Notice that greedy profit/weight alone doesn't match DP optimum,
    and tight deadlines stress test the greedy heuristic.
    """
    return [
        Delivery(id="D1", pickup="A", drop="C", weight=4.0, profit=500.0, deadline=30.0, priority="High", service_time=3.0),
        Delivery(id="D2", pickup="B", drop="E", weight=6.0, profit=800.0, deadline=45.0, priority="High", service_time=4.0),
        Delivery(id="D3", pickup="C", drop="F", weight=3.0, profit=400.0, deadline=25.0, priority="High", service_time=2.0),
        Delivery(id="D4", pickup="A", drop="D", weight=7.0, profit=900.0, deadline=60.0, priority="Medium", service_time=5.0),
        Delivery(id="D5", pickup="E", drop="B", weight=4.0, profit=600.0, deadline=40.0, priority="Medium", service_time=3.0),
        Delivery(id="D6", pickup="F", drop="D", weight=8.0, profit=700.0, deadline=50.0, priority="Low", service_time=4.0),
        Delivery(id="D7", pickup="B", drop="C", weight=2.0, profit=350.0, deadline=20.0, priority="High", service_time=2.0),
        Delivery(id="D8", pickup="C", drop="E", weight=5.0, profit=650.0, deadline=55.0, priority="Medium", service_time=3.0),
        Delivery(id="D9", pickup="D", drop="F", weight=6.0, profit=750.0, deadline=70.0, priority="High", service_time=4.0),
        Delivery(id="D10", pickup="A", drop="E", weight=3.0, profit=420.0, deadline=35.0, priority="Medium", service_time=3.0),
        Delivery(id="D11", pickup="E", drop="C", weight=5.0, profit=580.0, deadline=65.0, priority="Low", service_time=3.0),
        Delivery(id="D12", pickup="B", drop="D", weight=7.0, profit=620.0, deadline=80.0, priority="Low", service_time=4.0),
        Delivery(id="D13", pickup="C", drop="A", weight=2.0, profit=380.0, deadline=40.0, priority="High", service_time=2.0),
        Delivery(id="D14", pickup="D", drop="B", weight=4.0, profit=510.0, deadline=55.0, priority="Medium", service_time=3.0),
        Delivery(id="D15", pickup="F", drop="A", weight=3.0, profit=460.0, deadline=75.0, priority="Medium", service_time=3.0),
    ]


def get_default_vehicle() -> Vehicle:
    return Vehicle(
        id="VAN-01",
        capacity=20.0,
        depot="A",
        max_operating_time=480.0,
        service_time=3.0,
        traffic_multiplier=1.0
    )
