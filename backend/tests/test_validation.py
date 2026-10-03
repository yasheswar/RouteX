import pytest
from backend.app.models.schemas import Delivery, Vehicle, RouteStop
from backend.app.algorithms.validation import validate_solution


def test_validation_capacity_violation():
    selected = [
        Delivery(id="D1", pickup="A", drop="B", weight=15.0, profit=500.0, deadline=30.0),
        Delivery(id="D2", pickup="A", drop="C", weight=10.0, profit=600.0, deadline=40.0),
    ]
    # Total weight 25 > 20 capacity
    vehicle = Vehicle(capacity=20.0, depot="A")
    stops = []
    passed, notes, on_time, late, pct = validate_solution(selected, vehicle, stops)
    assert not passed
    assert any("VIOLATION: Vehicle capacity exceeded" in n for n in notes)


def test_validation_deadline_violation():
    selected = [
        Delivery(id="D1", pickup="A", drop="B", weight=5.0, profit=500.0, deadline=15.0)
    ]
    vehicle = Vehicle(capacity=20.0, depot="A")
    stops = [
        RouteStop(
            stop_number=0,
            type="Depot",
            node_id="A",
            node_name="Depot",
            arrival_time=0.0,
            departure_time=0.0,
            distance_from_prev_km=0.0,
            travel_time_from_prev_min=0.0,
            status="Depot"
        ),
        RouteStop(
            stop_number=1,
            type="Drop (D1)",
            delivery_id="D1",
            node_id="B",
            node_name="Drop B",
            arrival_time=20.0,  # Arrival 20 > Deadline 15
            departure_time=23.0,
            distance_from_prev_km=5.0,
            travel_time_from_prev_min=20.0,
            deadline=15.0,
            slack=-5.0,
            status="Late"
        )
    ]
    passed, notes, on_time, late, pct = validate_solution(selected, vehicle, stops)
    assert on_time == 0
    assert late == 1
    assert pct == 0.0
    assert any("DEADLINE WARNING" in n for n in notes)
