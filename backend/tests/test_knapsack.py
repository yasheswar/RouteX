import pytest
from backend.app.models.schemas import Delivery
from backend.app.algorithms.knapsack import solve_knapsack_01


def test_knapsack_normal():
    deliveries = [
        Delivery(id="D1", pickup="A", drop="B", weight=4.0, profit=500.0, deadline=30.0),
        Delivery(id="D2", pickup="A", drop="C", weight=6.0, profit=800.0, deadline=45.0),
        Delivery(id="D3", pickup="B", drop="C", weight=3.0, profit=400.0, deadline=25.0),
    ]
    # Capacity 10: Best combination is D2 (6kg, 800) + D1 (4kg, 500) = 10kg, 1300
    # or D2 (6kg, 800) + D3 (3kg, 400) = 9kg, 1200
    selected, rejected, dp_table, _ = solve_knapsack_01(deliveries, capacity=10.0)
    selected_ids = {d.id for d in selected}
    assert "D1" in selected_ids
    assert "D2" in selected_ids
    assert dp_table.optimal_profit == 1300.0
    assert len(rejected) == 1
    assert rejected[0].id == "D3"


def test_knapsack_zero_capacity():
    deliveries = [
        Delivery(id="D1", pickup="A", drop="B", weight=4.0, profit=500.0, deadline=30.0)
    ]
    selected, rejected, dp_table, _ = solve_knapsack_01(deliveries, capacity=0.0)
    assert len(selected) == 0
    assert len(rejected) == 1
    assert dp_table.optimal_profit == 0.0


def test_knapsack_item_heavier_than_capacity():
    deliveries = [
        Delivery(id="D1", pickup="A", drop="B", weight=25.0, profit=1000.0, deadline=30.0),
        Delivery(id="D2", pickup="A", drop="C", weight=5.0, profit=300.0, deadline=40.0)
    ]
    selected, rejected, dp_table, _ = solve_knapsack_01(deliveries, capacity=10.0)
    selected_ids = [d.id for d in selected]
    assert selected_ids == ["D2"]
    assert "D1" in [d.id for d in rejected]
    assert dp_table.optimal_profit == 300.0


def test_knapsack_multiple_optimal():
    deliveries = [
        Delivery(id="D1", pickup="A", drop="B", weight=5.0, profit=500.0, deadline=30.0),
        Delivery(id="D2", pickup="A", drop="C", weight=5.0, profit=500.0, deadline=40.0)
    ]
    selected, rejected, dp_table, _ = solve_knapsack_01(deliveries, capacity=5.0)
    assert len(selected) == 1
    assert len(rejected) == 1
    assert dp_table.optimal_profit == 500.0


def test_knapsack_fractional_weights():
    deliveries = [
        Delivery(id="F1", pickup="A", drop="B", weight=2.4, profit=300.0, deadline=30.0),
        Delivery(id="F2", pickup="A", drop="C", weight=3.5, profit=450.0, deadline=40.0),
        Delivery(id="F3", pickup="B", drop="C", weight=4.1, profit=500.0, deadline=50.0),
    ]
    # Capacity 6.0:
    # F1 (2.4) + F2 (3.5) = 5.9 kg <= 6.0 kg -> Profit 750
    # F2 (3.5) + F3 (4.1) = 7.6 kg > 6.0 kg (cannot fit)
    # F1 (2.4) + F3 (4.1) = 6.5 kg > 6.0 kg (cannot fit)
    selected, rejected, dp_table, _ = solve_knapsack_01(deliveries, capacity=6.0)
    selected_ids = {d.id for d in selected}
    assert selected_ids == {"F1", "F2"}
    assert sum(d.weight for d in selected) <= 6.0
    assert dp_table.optimal_profit == 750.0
