import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VehicleSettingsModal } from './components/VehicleSettingsModal';
import { VivaDefenseModal } from './components/VivaDefenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { MapRoutePage } from './pages/MapRoutePage';
import { OptimizationPage } from './pages/OptimizationPage';
import { VisualizerPage } from './pages/VisualizerPage';
import { SimulationPage } from './pages/SimulationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './services/api';
import { Delivery, Vehicle, Node, Edge, OptimizationResult } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [netRes, vehRes, delivRes] = await Promise.all([
        api.getNetwork(),
        api.getVehicle(),
        api.getDeliveries(),
      ]);

      setNodes(netRes.nodes);
      setEdges(netRes.edges);
      setVehicle(vehRes);
      setDeliveries(delivRes);

      // Auto-run initial optimization if deliveries exist
      if (delivRes.length > 0) {
        setIsOptimizing(true);
        const optRes = await api.runOptimization(delivRes, vehRes);
        setOptimization(optRes);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error initializing data: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunOptimization = async () => {
    if (!vehicle || deliveries.length === 0) return;
    try {
      setIsOptimizing(true);
      const optRes = await api.runOptimization(deliveries, vehicle);
      setOptimization(optRes);
      // Refresh deliveries with updated selection status
      const updatedDelivs = await api.getDeliveries();
      setDeliveries(updatedDelivs);
      showToast(`Optimization complete! Profit: ₹${optRes.total_profit.toLocaleString()} across ${optRes.selected_deliveries.length} orders.`);
    } catch (err: any) {
      showToast('Optimization failed: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsOptimizing(true);
      const resetDelivs = await api.resetDeliveries();
      setDeliveries(resetDelivs);
      const veh = await api.getVehicle();
      setVehicle(veh);
      const optRes = await api.runOptimization(resetDelivs, veh);
      setOptimization(optRes);
      showToast('Demo dataset loaded successfully (15 orders).');
    } catch (err: any) {
      showToast('Reset failed: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.clearDeliveries();
      setDeliveries([]);
      setOptimization(null);
      showToast('Dataset cleared.');
    } catch (err: any) {
      showToast('Clear failed: ' + err.message);
    }
  };

  const handleAddDelivery = async (d: Delivery) => {
    try {
      const created = await api.addDelivery(d);
      setDeliveries((prev) => [...prev, created]);
      showToast(`Delivery ${created.id} added.`);
      handleRunOptimization();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleUpdateDelivery = async (d: Delivery) => {
    try {
      const updated = await api.updateDelivery(d.id, d);
      setDeliveries((prev) => prev.map((item) => (item.id === d.id ? updated : item)));
      showToast(`Delivery ${d.id} updated.`);
      handleRunOptimization();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      await api.deleteDelivery(id);
      setDeliveries((prev) => prev.filter((item) => item.id !== id));
      showToast(`Delivery ${id} deleted.`);
      handleRunOptimization();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleUpdateVehicle = async (updated: Vehicle) => {
    try {
      const res = await api.updateVehicle(updated);
      setVehicle(res);
      showToast('Vehicle configuration saved.');
      handleRunOptimization();
    } catch (err: any) {
      showToast('Vehicle update failed: ' + err.message);
    }
  };

  const handleApplyVivaScenario = async (cap: number, traffic: number) => {
    if (!vehicle) return;
    try {
      setIsOptimizing(true);
      const updatedVehicle = { ...vehicle, capacity: cap, traffic_multiplier: traffic };
      const savedVehicle = await api.updateVehicle(updatedVehicle);
      setVehicle(savedVehicle);
      const optRes = await api.runOptimization(deliveries, savedVehicle);
      setOptimization(optRes);
      showToast(`Viva Scenario applied: ${cap} kg capacity, ${traffic}x traffic congestion. Pipeline recalculated.`);
    } catch (err: any) {
      showToast('Scenario failed: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const pageHeaders: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Live fleet performance, capacity utilization, and delivery fulfillment',
    },
    deliveries: {
      title: 'Delivery Management',
      subtitle: 'Configure order requests, weights, revenues, and service deadlines',
    },
    map: {
      title: 'Map & Route Visualization',
      subtitle: 'Geographic road network with vehicle routing paths and waypoint status',
    },
    optimization: {
      title: 'Algorithmic Optimization Pipeline',
      subtitle: 'Multi-stage decision engine: 0/1 Knapsack DP + Greedy Heuristic + Timeline Scheduling',
    },
    visualizer: {
      title: 'Algorithm Visualizer',
      subtitle: 'Step-by-step interactive inspection of DP recurrence, min-heap, and greedy scores',
    },
    simulation: {
      title: 'What-If Scenario Simulation',
      subtitle: 'Sensitivity stress testing for vehicle capacity, road congestion, and order deadlines',
    },
    comparison: {
      title: 'Algorithmic Strategy Comparison',
      subtitle: 'Benchmarking Nearest Neighbor, Profit-based Greedy, and RouteX Multi-Stage',
    },
    reports: {
      title: 'Operational Manifest & Complexity Report',
      subtitle: 'Official dispatch records, formal asymptotic proofs, and exportable data',
    },
  };

  const headerInfo = pageHeaders[currentTab] || pageHeaders.dashboard;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        vehicle={vehicle}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          vehicle={vehicle}
          onOptimize={handleRunOptimization}
          onReset={handleReset}
          onClear={handleClear}
          onOpenVivaModal={() => setIsVivaModalOpen(true)}
          isOptimizing={isOptimizing}
          deliveriesCount={deliveries.length}
        />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f19]">
          {currentTab === 'dashboard' && (
            <DashboardPage
              deliveries={deliveries}
              vehicle={vehicle}
              nodes={nodes}
              edges={edges}
              optimization={optimization}
              onNavigateTab={setCurrentTab}
              onRunOptimize={handleRunOptimization}
              onReset={handleReset}
              isOptimizing={isOptimizing}
            />
          )}

          {currentTab === 'deliveries' && (
            <DeliveriesPage
              deliveries={deliveries}
              nodes={nodes}
              optimization={optimization}
              onAddDelivery={handleAddDelivery}
              onUpdateDelivery={handleUpdateDelivery}
              onDeleteDelivery={handleDeleteDelivery}
              onReset={handleReset}
            />
          )}

          {currentTab === 'map' && (
            <MapRoutePage
              nodes={nodes}
              edges={edges}
              deliveries={deliveries}
              vehicle={vehicle}
              optimization={optimization}
              onOptimize={handleRunOptimization}
              onReset={handleReset}
              isOptimizing={isOptimizing}
            />
          )}

          {currentTab === 'optimization' && (
            <OptimizationPage
              deliveries={deliveries}
              vehicle={vehicle}
              optimization={optimization}
              onOptimize={handleRunOptimization}
              onUpdateVehicle={handleUpdateVehicle}
              isOptimizing={isOptimizing}
            />
          )}

          {currentTab === 'visualizer' && <VisualizerPage />}

          {currentTab === 'simulation' && <SimulationPage />}

          {currentTab === 'comparison' && <ComparisonPage />}

          {currentTab === 'reports' && (
            <ReportsPage optimization={optimization} vehicle={vehicle} />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1e293b] border border-blue-500/40 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Vehicle Settings Modal */}
      <VehicleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        vehicle={vehicle}
        nodes={nodes}
        onSave={handleUpdateVehicle}
      />

      {/* DAA Viva Defense Mode Modal */}
      <VivaDefenseModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        deliveries={deliveries}
        vehicle={vehicle}
        optimization={optimization}
        onApplyScenario={handleApplyVivaScenario}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setIsVivaModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
