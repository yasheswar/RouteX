import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  GitBranch,
  Network,
  CheckCircle2,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { VisualizerTracesResponse, VisualizerStep } from '../types';

export const VisualizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dp' | 'dijkstra' | 'greedy'>('dp');
  const [data, setData] = useState<VisualizerTracesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stepper state
  const [dpStepIdx, setDpStepIdx] = useState<number>(0);
  const [dijkstraStepIdx, setDijkstraStepIdx] = useState<number>(0);
  const [greedyStepIdx, setGreedyStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(800);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadTraces();
  }, []);

  const loadTraces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getVisualizerTraces();
      setData(res);
      setDpStepIdx(0);
      setDijkstraStepIdx(0);
      setGreedyStepIdx(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load visualizer traces');
    } finally {
      setLoading(false);
    }
  };

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (activeTab === 'dp') {
          setDpStepIdx((prev) => {
            if (!data?.knapsack_trace || prev >= data.knapsack_trace.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        } else if (activeTab === 'dijkstra') {
          setDijkstraStepIdx((prev) => {
            if (!data?.dijkstra_trace || prev >= data.dijkstra_trace.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        } else if (activeTab === 'greedy') {
          setGreedyStepIdx((prev) => {
            if (!data?.greedy_trace || prev >= data.greedy_trace.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }
      }, playSpeedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeTab, data, playSpeedMs]);

  const handleReset = () => {
    setIsPlaying(false);
    if (activeTab === 'dp') setDpStepIdx(0);
    if (activeTab === 'dijkstra') setDijkstraStepIdx(0);
    if (activeTab === 'greedy') setGreedyStepIdx(0);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (activeTab === 'dp' && data?.knapsack_trace) {
      setDpStepIdx((p) => Math.min(p + 1, data.knapsack_trace.length - 1));
    } else if (activeTab === 'dijkstra' && data?.dijkstra_trace) {
      setDijkstraStepIdx((p) => Math.min(p + 1, data.dijkstra_trace.length - 1));
    } else if (activeTab === 'greedy' && data?.greedy_trace) {
      setGreedyStepIdx((p) => Math.min(p + 1, data.greedy_trace.length - 1));
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (activeTab === 'dp') setDpStepIdx((p) => Math.max(0, p - 1));
    if (activeTab === 'dijkstra') setDijkstraStepIdx((p) => Math.max(0, p - 1));
    if (activeTab === 'greedy') setGreedyStepIdx((p) => Math.max(0, p - 1));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Generating algorithmic step-by-step traces...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p className="text-sm mb-4">{error || 'Failed to initialize visualizer'}</p>
        <button
          onClick={loadTraces}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  // Current step objects
  const currentDpStep = data.knapsack_trace[dpStepIdx];
  const currentDijkstraStep = data.dijkstra_trace[dijkstraStepIdx];
  const currentGreedyStep = data.greedy_trace[greedyStepIdx];

  const totalSteps =
    activeTab === 'dp'
      ? data.knapsack_trace.length
      : activeTab === 'dijkstra'
      ? data.dijkstra_trace.length
      : data.greedy_trace.length;

  const currentStepNum =
    activeTab === 'dp'
      ? dpStepIdx + 1
      : activeTab === 'dijkstra'
      ? dijkstraStepIdx + 1
      : greedyStepIdx + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Algorithm Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            DAA Algorithm Step-by-Step Visualizer
          </h2>
          <p className="text-xs text-slate-400">
            Interactive examination of recurrence relations, heap relaxations, and heuristic decisions for Viva evaluation
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex bg-slate-900 border border-slate-700/80 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('dp');
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'dp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            0/1 Knapsack DP
          </button>
          <button
            onClick={() => {
              setActiveTab('dijkstra');
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'dijkstra' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dijkstra Shortest Path
          </button>
          <button
            onClick={() => {
              setActiveTab('greedy');
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'greedy' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Greedy Route Decisions
          </button>
        </div>
      </div>

      {/* Universal Step Player Toolbar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepNum <= 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play Animation</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepNum >= totalSteps}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs text-slate-300 ml-3">
            Step <span className="font-bold text-white">{currentStepNum}</span> of{' '}
            <span className="font-bold text-white">{totalSteps}</span>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Speed:</span>
          <select
            value={playSpeedMs}
            onChange={(e) => setPlaySpeedMs(parseInt(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded-md focus:outline-none"
          >
            <option value="1500">0.7x (Slow)</option>
            <option value="800">1.0x (Normal)</option>
            <option value="400">2.0x (Fast)</option>
            <option value="150">5.0x (Ultra)</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: Dynamic Programming Stepper */}
      {activeTab === 'dp' && currentDpStep && (
        <div className="space-y-5">
          {/* Step Explanation Card */}
          <div className="bg-[#111827] border border-blue-800/40 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {currentDpStep.step_type === 'BACKTRACK'
                  ? 'Phase 2: Solution Backtracking'
                  : 'Phase 1: Cell Recurrence Evaluation'}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  currentDpStep.decision === 'INCLUDE' || currentDpStep.action === 'SELECTED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {currentDpStep.decision || currentDpStep.action || 'EVALUATING'}
              </span>
            </div>

            <p className="text-sm font-medium text-white leading-relaxed">
              {currentDpStep.explanation}
            </p>

            {currentDpStep.step_type === 'CELL_EVALUATION' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Item ID & Weight</span>
                  <span className="text-white font-bold">
                    {currentDpStep.item_id} ({currentDpStep.item_weight} kg)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Profit</span>
                  <span className="text-emerald-400 font-bold">₹{currentDpStep.item_profit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Exclude Val dp[i-1][c]</span>
                  <span className="text-slate-300 font-bold">₹{currentDpStep.exclude_val}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Include Val p + dp[i-1][c-w]</span>
                  <span className="text-blue-400 font-bold">
                    {currentDpStep.include_val !== null ? `₹${currentDpStep.include_val}` : 'Infeasible (w > c)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Table Grid with Active Cell Highlight */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white">Dynamic Programming Table State</h3>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500 border border-white inline-block" /> Active Step Cell
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Backtracked Selection
                </span>
              </div>
            </div>

            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800">
                  <th className="py-2 px-3 text-left">Item \ Cap</th>
                  {data.knapsack_table.capacities.map((c) => (
                    <th key={`c-${c}`} className="py-2 px-2.5 font-bold text-slate-300">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.knapsack_table.item_ids.map((itemId, rIdx) => (
                  <tr key={`vis-row-${rIdx}`} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-left font-bold text-white bg-[#0f172a]/60 font-sans">
                      {itemId}
                    </td>
                    {data.knapsack_table.capacities.map((cVal, cIdx) => {
                      const val = data.knapsack_table.grid[rIdx]?.[cIdx] ?? 0;
                      const isCurrentActive =
                        currentDpStep.row_index === rIdx && currentDpStep.col_capacity === cVal;
                      const isBacktracked = data.knapsack_table.backtrack_cells.some(
                        ([bRow, bCap]) => bRow === rIdx && bCap === cVal
                      );

                      return (
                        <td
                          key={`vis-cell-${rIdx}-${cVal}`}
                          className={`py-2 px-2.5 transition-all ${
                            isCurrentActive
                              ? 'bg-blue-600 text-white font-bold ring-2 ring-white scale-110 shadow-lg z-10'
                              : isBacktracked
                              ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Dijkstra Algorithm Stepper */}
      {activeTab === 'dijkstra' && currentDijkstraStep && (
        <div className="space-y-5">
          <div className="bg-[#111827] border border-blue-800/40 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Dijkstra Event: {currentDijkstraStep.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target: {data.dijkstra_target.from} → {data.dijkstra_target.to} (
                {data.dijkstra_target.dist} km, {data.dijkstra_target.time} min)
              </span>
            </div>

            <p className="text-sm font-medium text-white leading-relaxed">
              {currentDijkstraStep.explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Event Type</span>
                <span className="text-white font-bold">{currentDijkstraStep.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cumulative Travel Time</span>
                <span className="text-blue-400 font-bold">
                  {currentDijkstraStep.cumulative_time !== undefined
                    ? `${currentDijkstraStep.cumulative_time} min`
                    : currentDijkstraStep.new_time !== undefined
                    ? `${currentDijkstraStep.new_time} min`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Shortest Path Result</span>
                <span className="text-emerald-400 font-bold">
                  {data.dijkstra_path.join(' → ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Greedy Route Decisions Stepper */}
      {activeTab === 'greedy' && currentGreedyStep && (
        <div className="space-y-5">
          <div className="bg-[#111827] border border-blue-800/40 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                Greedy Stop Dispatch Decision #{currentGreedyStep.step_index}
              </span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Chosen: Delivery {currentGreedyStep.chosen_id}
              </span>
            </div>

            <div className="text-sm font-medium text-white">
              {currentGreedyStep.reason}
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300 border-t border-slate-800 pt-2 font-mono">
              <div>
                Current Location: <strong className="text-white">Node {currentGreedyStep.current_node}</strong>
              </div>
              <div>
                Current Clock: <strong className="text-blue-400">{currentGreedyStep.current_time} min</strong>
              </div>
              <div>
                Feasible Candidates:{' '}
                <strong className="text-emerald-400">
                  {currentGreedyStep.feasible_count} / {currentGreedyStep.candidates_count}
                </strong>
              </div>
            </div>
          </div>

          {/* Candidate Evaluation Table at this step */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">
              Candidate Pool Evaluations at Step #{currentGreedyStep.step_index}
            </h3>

            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Candidate</th>
                  <th className="py-2 px-3">Profit (₹)</th>
                  <th className="py-2 px-3">Weight (kg)</th>
                  <th className="py-2 px-3">Travel Time</th>
                  <th className="py-2 px-3">ETA</th>
                  <th className="py-2 px-3">Deadline</th>
                  <th className="py-2 px-3">Slack</th>
                  <th className="py-2 px-3">Priority Score</th>
                  <th className="py-2 px-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentGreedyStep.candidates?.map((cand: any) => {
                  const isChosen = cand.id === currentGreedyStep.chosen_id;
                  return (
                    <tr
                      key={`cand-${cand.id}`}
                      className={`hover:bg-slate-800/40 ${
                        isChosen ? 'bg-blue-950/40 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-white">{cand.id}</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">₹{cand.profit}</td>
                      <td className="py-2 px-3">{cand.weight}</td>
                      <td className="py-2 px-3 text-blue-400">{cand.travel_time}m</td>
                      <td className="py-2 px-3">{cand.eta}m</td>
                      <td className="py-2 px-3 text-amber-300">{cand.deadline}m</td>
                      <td className="py-2 px-3">
                        <span className={cand.slack >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {cand.slack > 0 ? `+${cand.slack}` : cand.slack}m
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-blue-400 text-sm">
                        {cand.priority_score.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        {isChosen ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            SELECTED
                          </span>
                        ) : cand.feasible ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            Deferred
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/40 text-rose-400 border border-rose-800/40">
                            Infeasible
                          </span>
                        )}
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
