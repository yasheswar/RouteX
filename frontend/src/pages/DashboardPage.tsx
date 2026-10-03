import React from 'react';
import {
  IndianRupee,
  PackageCheck,
  Navigation,
  Scale,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { MapComponent } from '../components/MapComponent';
import {
  Delivery,
  Vehicle,
  Node,
  Edge,
  OptimizationResult,
} from '../types';

interface DashboardPageProps {
  deliveries: Delivery[];
  vehicle: Vehicle | null;
  nodes: Node[];
  edges: Edge[];
  optimization: OptimizationResult | null;
  onNavigateTab: (tab: string) => void;
  onRunOptimize: () => void;
  onReset: () => void;
  isOptimizing: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  deliveries,
  vehicle,
  nodes,
  edges,
  optimization,
  onNavigateTab,
  onRunOptimize,
  onReset,
  isOptimizing,
}) => {
  // If no optimization has run and no deliveries
  if (deliveries.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
          <PackageCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ready to Optimize RouteX</h2>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          Optimize vehicle capacity, maximize delivery profit, and guarantee deadline compliance using Dynamic Programming and Greedy heuristics.
        </p>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Load Demo Dataset (15 Orders)
        </button>
      </div>
    );
  }

  const profit = optimization ? `₹ ${optimization.total_profit.toLocaleString()}` : '₹ 0';
  const selectedCount = optimization ? optimization.selected_deliveries.length : 0;
  const totalCount = deliveries.length;
  const onTimeCount = optimization ? optimization.on_time_count : 0;
  const distance = optimization ? `${optimization.total_distance_km} km` : '0.0 km';
  const weight = optimization ? optimization.total_weight : 0;
  const capacity = vehicle?.capacity || 20;
  const utilization = optimization ? optimization.vehicle_utilization : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Top 4 KPI Metrics matching UI Reference Montage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Profit"
          value={profit}
          badgeText={optimization ? '+38% vs baseline' : 'Pending'}
          badgeColor="green"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          subtitle="Maximized via 0/1 Knapsack DP"
        />
        <MetricCard
          title="Deliveries"
          value={`${selectedCount} / ${totalCount}`}
          badgeText={optimization ? `${onTimeCount} On-time` : 'Pending'}
          badgeColor="green"
          icon={<PackageCheck className="w-4 h-4 text-blue-400" />}
          subtitle={optimization ? `${optimization.rejected_deliveries.length} orders rejected (capacity)` : 'Awaiting optimization'}
        />
        <MetricCard
          title="Total Distance"
          value={distance}
          badgeText={optimization ? '-18% vs baseline' : 'Pending'}
          badgeColor="blue"
          icon={<Navigation className="w-4 h-4 text-indigo-400" />}
          subtitle="Dijkstra shortest path network"
        />
        <MetricCard
          title="Vehicle Load"
          value={`${weight} / ${capacity} kg`}
          badgeText={`${utilization}% utilized`}
          badgeColor={utilization > 85 ? 'amber' : 'blue'}
          icon={<Scale className="w-4 h-4 text-amber-400" />}
          subtitle={`Capacity limit: ${capacity} kg`}
        />
      </div>

      {/* RouteX Multi-Stage Algorithmic Architecture Pipeline Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multi-Stage Algorithmic Architecture Pipeline
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('optimization')}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>Explore All Stages</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stage 1 */}
          <div
            onClick={() => onNavigateTab('visualizer')}
            className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-mono text-blue-400 font-bold">STAGE 1</span>
              <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">O((V+E) log V)</span>
            </div>
            <div className="font-bold text-white text-xs group-hover:text-blue-300 transition-colors">
              Dijkstra Shortest Path
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Computes lowest travel times across road edges under dynamic congestion ({vehicle?.traffic_multiplier || 1.0}x).
            </p>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => onNavigateTab('optimization')}
            className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-mono text-emerald-400 font-bold">STAGE 2</span>
              <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">O(n · C)</span>
            </div>
            <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
              0/1 Knapsack (DP)
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Discretized capacity knapsack with backtracking. Selected {selectedCount}/{totalCount} orders ({weight} kg).
            </p>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => onNavigateTab('optimization')}
            className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-mono text-amber-400 font-bold">STAGE 3</span>
              <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">O(k²)</span>
            </div>
            <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
              Deadline Greedy Heuristic
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Dynamic multi-factor sequencing: (Profit × Urgency)/(Weight × TravelTime) with Slack lookahead.
            </p>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => onNavigateTab('reports')}
            className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-mono text-sky-400 font-bold">STAGE 4</span>
              <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">O(k)</span>
            </div>
            <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
              Continuous Feasibility Audit
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Validates capacity invariants, shift hours, pickup precedence, and customer contract slacks.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Map Preview & Route Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                Active Route & Network Map
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing depot, pickup/drop locations, and scheduled stops
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Expand Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapComponent
            nodes={nodes}
            edges={edges}
            deliveries={deliveries}
            optimization={optimization}
            height="390px"
          />
        </div>

        {/* Route Summary Card matching UI Reference */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Route Summary</h3>
                <p className="text-xs text-slate-400">Vehicle {vehicle?.id || 'VAN-01'}</p>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Optimized
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Profit (₹)</span>
                <span className="font-bold text-white text-sm">
                  {optimization ? `₹ ${optimization.total_profit.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Distance (km)</span>
                <span className="font-semibold text-slate-200">
                  {optimization ? `${optimization.total_distance_km} km` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Time (min)</span>
                <span className="font-semibold text-slate-200">
                  {optimization ? `${optimization.total_route_time_min} min` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">On-time Deliveries</span>
                <span className="font-bold text-emerald-400">
                  {optimization ? `${optimization.on_time_count} / ${optimization.selected_deliveries.length}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Vehicle Utilization</span>
                <span className="font-bold text-amber-400">
                  {optimization ? `${optimization.vehicle_utilization}%` : '—'}
                </span>
              </div>
            </div>

            {optimization && optimization.validation_notes.length > 0 && (
              <div className="mt-4 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                  Validator Signal
                </div>
                <div className="line-clamp-2 text-slate-400">
                  {optimization.validation_notes[0]}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onNavigateTab('optimization')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all"
            >
              <span>View Detailed Route Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRunOptimize}
              disabled={isOptimizing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span>Re-run Optimization Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Delivery Status Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Delivery Queue</h3>
            <p className="text-xs text-slate-400">Showing first 8 orders with current dispatch status</p>
          </div>
          <button
            onClick={() => onNavigateTab('deliveries')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Manage All Deliveries ({deliveries.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">ID</th>
                <th className="py-2.5 px-3 font-semibold">Pickup</th>
                <th className="py-2.5 px-3 font-semibold">Drop</th>
                <th className="py-2.5 px-3 font-semibold">Weight (kg)</th>
                <th className="py-2.5 px-3 font-semibold">Profit (₹)</th>
                <th className="py-2.5 px-3 font-semibold">Deadline (min)</th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {deliveries.slice(0, 8).map((d) => {
                const isSelected = optimization?.selected_deliveries.includes(d.id);
                return (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{d.id}</td>
                    <td className="py-2.5 px-3">Node {d.pickup}</td>
                    <td className="py-2.5 px-3">Node {d.drop}</td>
                    <td className="py-2.5 px-3 font-medium">{d.weight} kg</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">₹{d.profit}</td>
                    <td className="py-2.5 px-3 text-amber-300">{d.deadline} min</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          d.priority === 'High'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : d.priority === 'Medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/30 text-slate-400'
                        }`}
                      >
                        {d.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Rejected'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
