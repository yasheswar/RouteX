import pytest
from starlette.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_deliveries_crud(client):
    # Reset
    res_reset = client.post("/api/deliveries/reset")
    assert res_reset.status_code == 200
    assert len(res_reset.json()) == 15

    # Get deliveries
    res_get = client.get("/api/deliveries")
    assert res_get.status_code == 200
    assert len(res_get.json()) == 15

    # Add custom delivery
    new_deliv = {
        "id": "D99",
        "pickup": "A",
        "drop": "B",
        "weight": 2.5,
        "profit": 350.0,
        "deadline": 45.0,
        "priority": "High",
        "service_time": 2.0
    }
    res_add = client.post("/api/deliveries", json=new_deliv)
    assert res_add.status_code == 200
    assert res_add.json()["id"] == "D99"

    # Delete delivery
    res_del = client.delete("/api/deliveries/D99")
    assert res_del.status_code == 200


def test_api_optimize(client):
    client.post("/api/deliveries/reset")
    res = client.post("/api/optimize")
    assert res.status_code == 200
    data = res.json()
    assert "selected_deliveries" in data
    assert "total_profit" in data
    assert data["total_profit"] > 0
    assert len(data["selected_deliveries"]) > 0
    assert "dp_table" in data
    assert "greedy_priorities" in data
    assert "stops" in data


def test_api_compare(client):
    client.post("/api/deliveries/reset")
    res = client.post("/api/compare")
    assert res.status_code == 200
    data = res.json()
    assert len(data["strategies"]) == 3
    assert data["strategies"][0]["strategy_name"] == "Nearest Neighbor"
    assert data["strategies"][1]["strategy_name"] == "Profit-based Greedy"
    assert data["strategies"][2]["strategy_name"] == "RouteX (DP + Greedy + Dijkstra)"


def test_api_simulate(client):
    sim_payload = {
        "capacity": 25.0,
        "num_deliveries": 12,
        "traffic_multiplier": 1.2,
        "max_delivery_time": 80.0,
        "seed": 101
    }
    res = client.post("/api/simulate", json=sim_payload)
    assert res.status_code == 200
    data = res.json()
    assert "baseline" in data
    assert "scenario" in data
    assert "comparison_metrics" in data


def test_api_report(client):
    res = client.get("/api/report")
    assert res.status_code == 200
    data = res.json()
    assert "title" in data
    assert "complexities" in data
    assert len(data["complexities"]) == 4
