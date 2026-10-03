import {
  Delivery,
  Vehicle,
  NetworkGraph,
  OptimizationResult,
  ComparisonResult,
  SimulationResponse,
  VisualizerTracesResponse,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getNetwork(): Promise<NetworkGraph> {
    const res = await fetch(`${API_BASE}/network`);
    if (!res.ok) throw new Error('Failed to fetch network graph');
    return res.json();
  },

  async getDeliveries(): Promise<Delivery[]> {
    const res = await fetch(`${API_BASE}/deliveries`);
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    return res.json();
  },

  async addDelivery(delivery: Delivery): Promise<Delivery> {
    const res = await fetch(`${API_BASE}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add delivery');
    }
    return res.json();
  },

  async updateDelivery(id: string, delivery: Delivery): Promise<Delivery> {
    const res = await fetch(`${API_BASE}/deliveries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update delivery');
    }
    return res.json();
  },

  async deleteDelivery(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/deliveries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete delivery');
  },

  async resetDeliveries(): Promise<Delivery[]> {
    const res = await fetch(`${API_BASE}/deliveries/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo dataset');
    return res.json();
  },

  async clearDeliveries(): Promise<Delivery[]> {
    const res = await fetch(`${API_BASE}/deliveries/clear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear deliveries');
    return res.json();
  },

  async getVehicle(): Promise<Vehicle> {
    const res = await fetch(`${API_BASE}/vehicle`);
    if (!res.ok) throw new Error('Failed to fetch vehicle configuration');
    return res.json();
  },

  async updateVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const res = await fetch(`${API_BASE}/vehicle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    if (!res.ok) throw new Error('Failed to update vehicle configuration');
    return res.json();
  },

  async runOptimization(deliveries?: Delivery[], vehicle?: Vehicle): Promise<OptimizationResult> {
    const res = await fetch(`${API_BASE}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveries, vehicle }),
    });
    if (!res.ok) throw new Error('Optimization failed');
    return res.json();
  },

  async compareStrategies(): Promise<ComparisonResult> {
    const res = await fetch(`${API_BASE}/compare`, { method: 'POST' });
    if (!res.ok) throw new Error('Strategy comparison failed');
    return res.json();
  },

  async runSimulation(params: {
    capacity: number;
    num_deliveries: number;
    traffic_multiplier: number;
    max_delivery_time: number;
    seed?: number;
  }): Promise<SimulationResponse> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  async getVisualizerTraces(): Promise<VisualizerTracesResponse> {
    const res = await fetch(`${API_BASE}/visualizer/trace`);
    if (!res.ok) throw new Error('Failed to load visualizer traces');
    return res.json();
  },

  async getReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/report`);
    if (!res.ok) throw new Error('Failed to fetch operational report');
    return res.json();
  },
};
