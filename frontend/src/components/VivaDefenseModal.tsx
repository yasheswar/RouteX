import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  Clock,
  Scale,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Calculator,
} from 'lucide-react';
import { Delivery, Vehicle, OptimizationResult } from '../types';

interface VivaDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: Delivery[];
  vehicle: Vehicle | null;
  optimization: OptimizationResult | null;
  onApplyScenario: (cap: number, traffic: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const VivaDefenseModal: React.FC<VivaDefenseModalProps> = ({
  isOpen,
  onClose,
  deliveries,
  vehicle,
  optimization,
  onApplyScenario,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'complexities' | 'stress_tests' | 'qa'>('calculator');
  const [calcItemId, setCalcItemId] = useState<string>(deliveries[1]?.id || 'D2');
  const [calcCapacity, setCalcCapacity] = useState<number>(10);

  if (!isOpen) return null;

  // Selected item for live recurrence calculator
  const selectedDelivery = deliveries.find((d) => d.id === calcItemId) || deliveries[0];
  const itemWeight = selectedDelivery ? Math.max(1, Math.round(selectedDelivery.weight)) : 1;
  const itemProfit = selectedDelivery ? selectedDelivery.profit : 0;
  const canFit = itemWeight <= calcCapacity;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-blue-600/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-900/30">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                DAA Viva Defense Master Toolkit
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Faculty Defense Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive recurrence calculator, formal asymptotic proofs, and 1-click examiner stress-tests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'calculator'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Live Recurrence Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('complexities')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'complexities'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Asymptotic Complexities (Big-O)</span>
          </button>

          <button
            onClick={() => setActiveTab('stress_tests')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'stress_tests'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Faculty Stress-Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'qa'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Examiner Q&A Defense Dossier</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: Live Recurrence Calculator */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  0/1 Knapsack Bellman Recurrence Equation Prover
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select any order request and sub-capacity state to verify the exact state transition evaluated by the dynamic programming solver.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Item Considered (i):
                    </label>
                    <select
                      value={calcItemId}
                      onChange={(e) => setCalcItemId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg text-xs text-white p-2 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      {deliveries.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.id} — Weight: {d.weight} kg, Profit: ₹{d.profit} (Pickup {d.pickup} → Drop {d.drop})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Knapsack Capacity Sub-state (c): <strong className="text-blue-400">{calcCapacity} kg</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={vehicle?.capacity || 20}
                      step="1"
                      value={calcCapacity}
                      onChange={(e) => setCalcCapacity(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer mt-2"
                    />
                  </div>
                </div>

                {/* Mathematical Proof Card */}
                {selectedDelivery && (
                  <div className="bg-slate-950 border border-blue-900/50 rounded-xl p-4 font-mono text-xs space-y-3">
                    <div className="text-blue-300 font-bold text-sm">
                      Recurrence: dp[i][c] = max(dp[i-1][c], profit[i] + dp[i-1][c - weight[i]])
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Branch 1 (Exclude Item):</span>
                        <span className="font-semibold text-white">Value = dp[i-1][{calcCapacity} kg]</span>
                        <p className="text-[10px] text-slate-500 mt-1">Inherits the optimal subset from first i-1 items without using extra capacity.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Branch 2 (Include Item):</span>
                        {canFit ? (
                          <>
                            <span className="font-semibold text-emerald-400">
                              Value = ₹{itemProfit} + dp[i-1][{calcCapacity} - {itemWeight} = {calcCapacity - itemWeight} kg]
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">Item fits! Consumes {itemWeight} kg and adds ₹{itemProfit} to remaining capacity optimal.</p>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-rose-400">
                              Infeasible: Weight ({itemWeight} kg) &gt; Capacity ({calcCapacity} kg)
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">Item exceeds current capacity state. Must default to Branch 1.</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200">
                      <strong className="block text-white mb-1">Algorithmic Decision:</strong>
                      {canFit ? (
                        <span>
                          The solver compares Branch 1 vs Branch 2. If including {selectedDelivery.id} yields strictly higher cumulative revenue than excluding it, <code className="text-emerald-400">dp[i][{calcCapacity}]</code> adopts the inclusion branch.
                        </span>
                      ) : (
                        <span>
                          Because {selectedDelivery.id} weighs {itemWeight} kg &gt; {calcCapacity} kg, inclusion is physically impossible. <code className="text-blue-300">dp[i][{calcCapacity}] = dp[i-1][{calcCapacity}]</code> by definition.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Asymptotic Complexities */}
          {activeTab === 'complexities' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Algorithm</th>
                      <th className="py-3 px-4 font-semibold">Time Complexity</th>
                      <th className="py-3 px-4 font-semibold">Space Complexity</th>
                      <th className="py-3 px-4 font-semibold">Mathematical Proof & Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">0/1 Knapsack (DP)</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">O(n · C)</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">O(n · C)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        n items × C capacity states. Each cell evaluates in O(1) time. Pseudo-polynomial; backtracking takes O(n).
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">Dijkstra Shortest Path</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">O((V + E) log V)</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">O(V + E)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Binary min-heap: each vertex extracted once (V log V), each edge relaxed at most once (E log V). Optimal for road graphs.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">Greedy Route Heuristic</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">O(k²)</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">O(k)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        At each of the k stops, evaluates all pending candidates in O(k) steps using precomputed shortest paths. Total operations: k(k+1)/2.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">Constraint Validator</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">O(k)</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">O(k)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Linear single-pass scan through ordered stops checking capacity invariants, deadline slacks, and precedence.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Faculty 1-Click Stress Tests */}
          {activeTab === 'stress_tests' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                During your defense, examiners will ask: <em>"What happens if parameters change?"</em> Click any button below to instantly reconfigure the vehicle and recalculate the live dispatch plan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      1. Severe Peak-Hour Traffic (2.0x Congestion)
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Doubles edge travel times via Dijkstra, forcing the greedy heuristic to adapt to compressed deadlines and potential lateness.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyScenario(20, 2.0);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply 2.0x Traffic & Recalculate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-rose-400" />
                      2. Fleet Capacity Crunch (12 kg Compact Van)
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Restricts vehicle capacity to 12 kg, testing whether 0/1 Knapsack DP correctly drops bulky low-value packages.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyScenario(12, 1.0);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply 12 kg Capacity & Recalculate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-400" />
                      3. Heavy-Duty Fleet Expansion (30 kg Van)
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Expands vehicle capacity to 30 kg, enabling the DP solver to pack 9+ candidate orders simultaneously.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyScenario(30, 1.0);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply 30 kg Fleet & Recalculate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      4. Restore Standard Baseline (20 kg, 1.0x Traffic)
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Restores default classroom PBL demonstration values (20 kg capacity, 1.0x baseline speed).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyScenario(20, 1.0);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Restore Baseline Defaults</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Examiner Q&A Defense Dossier */}
          {activeTab === 'qa' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300">
                  Q1: Why can't we just sort orders by Profit / Weight ratio greedily?
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Greedy ratio sorting is only optimal for the <em>Fractional Knapsack</em> problem. In 0/1 Knapsack, items are discrete. For instance, an item with high ratio might leave 4 kg unused that cannot fit any other item, whereas two medium-ratio items could fill the capacity completely and yield higher total revenue. DP guarantees global optimality by exploring all sub-problems.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300">
                  Q2: How does RouteX prevent vehicle overload at intermediate pickup stops?
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Stage 2 (0/1 Knapsack) restricts the total sum of all accepted order weights to &le; vehicle capacity. Therefore, even in the worst-case scenario where all orders are loaded simultaneously, capacity is strictly preserved. In addition, the continuous validator tracks real-time vehicle load at every individual stop.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300">
                  Q3: Why is Dijkstra chosen over Floyd-Warshall?
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Urban road distance and travel times are strictly non-negative. Dijkstra with a binary min-heap operates in O((V + E) log V). For our sparse urban road graph (10 vertices, 21 edges), Dijkstra computes on-demand paths in sub-milliseconds, whereas Floyd-Warshall requires O(V³) cubic time and O(V²) memory regardless of graph sparsity.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300">
                  Q4: Is your Greedy Route Construction globally optimal?
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  No. Traveling Salesperson with Time Windows (TSPTW) is NP-hard. RouteX deliberately uses a transparent, deadline-aware greedy heuristic: <code className="text-blue-300 font-mono">Priority = (Profit × Urgency) / (Weight × TravelTime)</code>. This provides polynomial O(k²) execution with high on-time fulfillment without exponential runtime explosions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>RouteX DAA Project Defense Edition</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('optimization');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>View DP Table Inspector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              Close Toolkit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
