import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  Navigation,
} from 'lucide-react';
import { Delivery, Vehicle, OptimizationResult } from '../types';

interface OptimizationPageProps {
  deliveries: Delivery[];
  vehicle: Vehicle | null;
  optimization: OptimizationResult | null;
  onOptimize: () => void;
  onUpdateVehicle: (v: Vehicle) => void;
  isOptimizing: boolean;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({
  deliveries,
  vehicle,
  optimization,
  onOptimize,
  onUpdateVehicle,
  isOptimizing,
}) => {
  const [activeTab, setActiveTab] = useState<'dp' | 'greedy' | 'schedule'>('dp');
  const [capacityInput, setCapacityInput] = useState<number>(vehicle?.capacity || 20);
  const [inspectedCell, setInspectedCell] = useState<{
    rowIdx: number;
    itemId: string;
    cap: number;
    val: number;
    isBacktracked: boolean;
  } | null>(null);

  const handleApplyCapacity = () => {
    if (vehicle) {
      onUpdateVehicle({ ...vehicle, capacity: capacityInput });
      onOptimize();
    }
  };

  // Sort candidate deliveries by profit / weight descending
  const sortedDeliveries = [...deliveries].sort(
    (a, b) => (b.profit / Math.max(0.1, b.weight)) - (a.profit / Math.max(0.1, a.weight))
  );

  return (
    <div className="p-6 space-y-6">
      {/* 3-Step Navigation Tabs matching UI Reference Montage Screens 4, 5, 8 */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-1.5 flex gap-1.5 max-w-2xl">
        <button
          onClick={() => setActiveTab('dp')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'dp'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>1. Delivery Selection (DP)</span>
        </button>

        <button
          onClick={() => setActiveTab('greedy')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'greedy'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>2. Prioritization (Greedy)</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>3. Route Schedule</span>
        </button>
      </div>

      {/* TAB 1: 0/1 Knapsack Dynamic Programming Selection (Screen 4) */}
      {activeTab === 'dp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Deliveries Table (sorted by profit/weight) */}
            <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">
                  Deliveries (sorted by profit/weight)
                </h3>
                <span className="text-xs text-slate-400">Total: {deliveries.length} orders</span>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Weight (kg)</th>
                      <th className="py-2.5 px-3">Profit (₹)</th>
                      <th className="py-2.5 px-3">Profit / Weight</th>
                      <th className="py-2.5 px-3">Selection Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {sortedDeliveries.map((d) => {
                      const ratio = (d.profit / d.weight).toFixed(1);
                      const isSelected = optimization?.selected_deliveries.includes(d.id);
                      return (
                        <tr key={d.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-white">{d.id}</td>
                          <td className="py-2 px-3">{d.weight} kg</td>
                          <td className="py-2 px-3 font-semibold text-emerald-400">₹{d.profit}</td>
                          <td className="py-2 px-3 text-blue-400 font-medium">₹{ratio}/kg</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
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


            {/* Right: Capacity Selector & Selected Summary Box */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Vehicle Capacity Control</h3>
                <p className="text-xs text-slate-400 mb-4">
                  0/1 Knapsack solves profit maximization strictly within this constraint.
                </p>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Vehicle Capacity (C):</span>
                    <span className="font-bold text-white text-sm">{capacityInput} kg</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(parseInt(e.target.value) || 20)}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <button
                    onClick={handleApplyCapacity}
                    disabled={isOptimizing}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run 0/1 DP Knapsack</span>
                  </button>
                </div>

                {/* Selected Deliveries Box matching UI Reference */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Selected Deliveries</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Optimal
                    </span>
                  </div>

                  <p className="text-blue-400 font-semibold tracking-wide">
                    {optimization && optimization.selected_deliveries.length > 0
                      ? optimization.selected_deliveries.join(', ')
                      : 'None'}
                  </p>

                  <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-300">
                    <span>Total Weight:</span>
                    <span className="font-bold text-white">
                      {optimization ? optimization.total_weight : 0} kg / {vehicle?.capacity} kg
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Total Profit:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {optimization ? `₹${optimization.total_profit.toLocaleString()}` : '₹0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DAA Academic Formulation Callout */}
              <div className="mt-4 p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg text-[11px] text-blue-200">
                <span className="font-semibold block mb-0.5">Recurrence Formulation:</span>
                <code>dp[i][c] = max(dp[i-1][c], profit[i] + dp[i-1][c - weight[i]])</code>
              </div>
            </div>
          </div>

          {/* Bottom: Visual DP Table (Profit vs Capacity) matching UI Reference */}
          {optimization && optimization.dp_table && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    DP Table (Profit vs Capacity Matrix)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Columns represent discretized capacity states (kg). Cells in cyan/emerald indicate the optimal backtrack trajectory.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Backtracked Cell
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-800 inline-block" /> State Cell
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3 text-left font-semibold">Item \ Cap</th>
                      {optimization.dp_table.capacities.map((c) => (
                        <th key={`cap-${c}`} className="py-2 px-2.5 font-bold text-slate-300">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {optimization.dp_table.item_ids.map((itemId, rIdx) => {
                      return (
                        <tr key={`dp-row-${rIdx}`} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 text-left font-bold text-white bg-[#0f172a]/60">
                            {itemId}
                          </td>
                          {optimization.dp_table.capacities.map((cVal, cIdx) => {
                            const val = optimization.dp_table.grid[rIdx]?.[cIdx] ?? 0;
                            // Check if this cell is in backtrack trajectory
                            const isBacktracked = optimization.dp_table.backtrack_cells.some(
                              ([bRow, bCap]) => bRow === rIdx && bCap === cVal
                            );

                            return (
                              <td
                                key={`cell-${rIdx}-${cVal}`}
                                onClick={() => setInspectedCell({ rowIdx: rIdx, itemId, cap: cVal, val, isBacktracked })}
                                title={`Click to inspect calculation at row ${itemId}, capacity ${cVal}kg`}
                                className={`py-2 px-2.5 transition-all cursor-pointer ${
                                  inspectedCell?.rowIdx === rIdx && inspectedCell?.cap === cVal
                                    ? 'bg-blue-500 text-white font-bold ring-2 ring-white scale-105 z-10'
                                    : isBacktracked
                                    ? 'bg-blue-600/40 text-blue-200 font-bold border border-blue-500/40 hover:bg-blue-600/60'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Interactive DP Cell Inspector Card */}
              {inspectedCell && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-blue-800/50 text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      DP Cell Inspector: dp[{inspectedCell.rowIdx}][{inspectedCell.cap} kg] = ₹{inspectedCell.val}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inspectedCell.isBacktracked
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {inspectedCell.isBacktracked ? 'Optimal Backtrack Path' : 'Non-Optimal State'}
                      </span>
                      <button
                        onClick={() => setInspectedCell(null)}
                        className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Item Considered:</span>
                      <strong className="text-white">{inspectedCell.itemId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Capacity State (c):</span>
                      <strong className="text-blue-400">{inspectedCell.cap} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Maximum Value:</span>
                      <strong className="text-emerald-400">₹{inspectedCell.val}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans pt-1">
                    Calculated via Bellman equation:{' '}
                    <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded">
                      dp[{inspectedCell.rowIdx}][{inspectedCell.cap}] = max(dp[{inspectedCell.rowIdx - 1}][{inspectedCell.cap}], profit[{inspectedCell.itemId}] + dp[{inspectedCell.rowIdx - 1}][{inspectedCell.cap} - weight])
                    </code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Greedy Prioritization & Route Sequencing (Screen 5) */}
      {activeTab === 'greedy' && (
        <div className="space-y-6">
          {/* Mathematical Formula Banner matching UI Reference */}
          <div className="bg-[#111827] border border-blue-800/40 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Greedy Priority Heuristic Formula
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Constructs dispatch order by balancing profit reward, physical weight inertia, real network travel time, and deadline urgency.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl font-mono text-xs">
              <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                <span className="text-[11px] text-slate-400 block mb-1">Priority Metric:</span>
                <code className="text-blue-300 font-bold text-sm">
                  Priority = (Profit × Urgency) / (Weight × TravelTime)
                </code>
              </div>
              <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                <span className="text-[11px] text-slate-400 block mb-1">Deadline Urgency Factor:</span>
                <code className="text-emerald-300 font-bold text-sm">
                  Urgency = 1 + max(0, (MaxDeadline - Deadline) / MaxDeadline)
                </code>
              </div>
            </div>
          </div>

          {/* Greedy Priority Calculation Table matching UI Reference */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Greedy Priority Calculation Table</h3>
              <span className="text-xs text-slate-400">Ranked by Priority Score descending</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">ID</th>
                    <th className="py-2.5 px-3 font-semibold">Profit (₹)</th>
                    <th className="py-2.5 px-3 font-semibold">Weight (kg)</th>
                    <th className="py-2.5 px-3 font-semibold">Travel Time (min)</th>
                    <th className="py-2.5 px-3 font-semibold">Deadline (min)</th>
                    <th className="py-2.5 px-3 font-semibold">Urgency</th>
                    <th className="py-2.5 px-3 font-semibold">Priority Score</th>
                    <th className="py-2.5 px-3 font-semibold">Initial Feasible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-xs">
                  {optimization?.greedy_priorities.map((row) => (
                    <tr key={row.delivery_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white font-sans">{row.delivery_id}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">₹{row.profit}</td>
                      <td className="py-2.5 px-3">{row.weight}</td>
                      <td className="py-2.5 px-3 text-blue-400">{row.travel_time}m</td>
                      <td className="py-2.5 px-3 text-amber-300">{row.deadline}m</td>
                      <td className="py-2.5 px-3 text-purple-300">{row.urgency}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-400 text-sm">
                        {row.priority_score.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            row.feasible
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {row.feasible ? 'Feasible' : 'Late'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Constructed Route Breadcrumbs matching UI Reference */}
          {optimization && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-2">
                Constructed Route (Greedy Heuristic Sequence)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Dynamic sequential traversal starting and ending at Depot Node {vehicle?.depot || 'A'}
              </p>

              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
                  Depot
                </span>
                {optimization.selected_deliveries.map((delivId) => (
                  <React.Fragment key={`crumb-${delivId}`}>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 font-bold text-xs border border-slate-700">
                      {delivId}
                    </span>
                  </React.Fragment>
                ))}
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
                  Depot
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Detailed Route Schedule (Screen 8) */}
      {activeTab === 'schedule' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Complete Route Dispatch Schedule</h3>
              <p className="text-xs text-slate-400">
                Stop-by-stop breakdown with arrival time, service window, departure, and deadline slack
              </p>
            </div>
            <div className="text-xs text-slate-300">
              Total Stops:{' '}
              <span className="font-bold text-white">{optimization?.stops.length || 0}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">Stop #</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Location</th>
                  <th className="py-3 px-3 font-semibold">Vehicle Load</th>
                  <th className="py-3 px-3 font-semibold">Arrival (min)</th>
                  <th className="py-3 px-3 font-semibold">Depart (min)</th>
                  <th className="py-3 px-3 font-semibold">Deadline</th>
                  <th className="py-3 px-3 font-semibold">Slack</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {optimization?.stops.map((stop) => {
                  const isDepot = stop.type.includes('Depot');
                  const isOnTime = stop.status === 'On-time';
                  const isLate = stop.status === 'Late';

                  return (
                    <tr key={`schedule-stop-${stop.stop_number}`} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white">{stop.stop_number}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{stop.type}</td>
                      <td className="py-2.5 px-3">
                        Node {stop.node_id} ({stop.node_name})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-300 font-semibold">
                        {stop.current_load_kg !== undefined && stop.current_load_kg !== null
                          ? `${stop.current_load_kg} kg`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400">
                        {stop.arrival_time.toFixed(1)}m
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-300">
                        {stop.departure_time.toFixed(1)}m
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-300">
                        {stop.deadline !== null ? `${stop.deadline}m` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {stop.slack !== null && stop.slack !== undefined ? (
                          <span
                            className={
                              stop.slack >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                            }
                          >
                            {stop.slack > 0 ? `+${stop.slack.toFixed(1)}m` : `${stop.slack.toFixed(1)}m`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isDepot
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : isOnTime
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isLate
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-slate-700/30 text-slate-400'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
