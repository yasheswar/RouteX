import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ComparisonResult, StrategyResult } from '../types';

export const ComparisonPage: React.FC = () => {
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runComparison();
  }, []);

  const runComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.compareStrategies();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compare strategies');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Executing 3 algorithmic strategies on identical dataset...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p className="text-sm mb-4">{error || 'Failed to generate comparison'}</p>
        <button
          onClick={runComparison}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  // Bar chart series data
  const chartDataProfit = data.strategies.map((s) => ({
    name: s.strategy_name.replace(' (DP + Greedy + Dijkstra)', '').replace(' (Our Approach)', ''),
    value: s.total_profit,
  }));

  const chartDataDistance = data.strategies.map((s) => ({
    name: s.strategy_name.replace(' (DP + Greedy + Dijkstra)', '').replace(' (Our Approach)', ''),
    value: s.total_distance_km,
  }));

  const chartDataOnTime = data.strategies.map((s) => ({
    name: s.strategy_name.replace(' (DP + Greedy + Dijkstra)', '').replace(' (Our Approach)', ''),
    value: s.on_time_count,
  }));

  const chartDataUtilization = data.strategies.map((s) => ({
    name: s.strategy_name.replace(' (DP + Greedy + Dijkstra)', '').replace(' (Our Approach)', ''),
    value: s.vehicle_utilization,
  }));

  // Strategy bar colors matching UI reference
  const colors = ['#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Run All Strategies button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Algorithmic Benchmark & Strategy Comparison
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating 3 distinct approaches on the exact same delivery requests and vehicle constraints
          </p>
        </div>

        <button
          onClick={runComparison}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Re-run All Strategies
        </button>
      </div>

      {/* 4 Strategy Comparison Bar Charts matching UI Reference Montage Screen 6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Chart 1: Total Profit */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-white">Total Profit (₹)</h4>
            <p className="text-[10px] text-slate-400">Higher is better</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataProfit} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  formatter={(val: any) => [`₹${val}`, 'Profit']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartDataProfit.map((_, idx) => (
                    <Cell key={`p-cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Total Distance */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-white">Total Distance (km)</h4>
            <p className="text-[10px] text-slate-400">Balanced routing</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataDistance} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} km`, 'Distance']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartDataDistance.map((_, idx) => (
                    <Cell key={`d-cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: On-time Deliveries */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-white">On-time Deliveries</h4>
            <p className="text-[10px] text-slate-400">Deadline reliability</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataOnTime} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} orders`, 'On-Time']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartDataOnTime.map((_, idx) => (
                    <Cell key={`ot-cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Vehicle Utilization */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-white">Vehicle Utilization (%)</h4>
            <p className="text-[10px] text-slate-400">Capacity efficiency</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataUtilization} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Utilization']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartDataUtilization.map((_, idx) => (
                    <Cell key={`u-cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tabular Comparison */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Comprehensive Strategy Evaluation</h3>
          <span className="text-xs text-slate-400">Identical 15-order test instance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Strategy</th>
                <th className="py-3 px-4 font-semibold">Profit (₹)</th>
                <th className="py-3 px-4 font-semibold">Distance</th>
                <th className="py-3 px-4 font-semibold">Total Time</th>
                <th className="py-3 px-4 font-semibold">On-Time</th>
                <th className="py-3 px-4 font-semibold">Load Util.</th>
                <th className="py-3 px-4 font-semibold">Selected Orders</th>
                <th className="py-3 px-4 font-semibold">Algorithmic Philosophy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.strategies.map((strat, idx) => {
                const isOur = strat.strategy_name.includes('RouteX');
                return (
                  <tr
                    key={`strat-${idx}`}
                    className={`hover:bg-slate-800/40 ${
                      isOur ? 'bg-blue-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: colors[idx] }}
                      />
                      <span>{strat.strategy_name}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{strat.total_profit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono">{strat.total_distance_km} km</td>
                    <td className="py-3 px-4 font-mono">{strat.total_route_time_min} min</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-emerald-400 font-bold">{strat.on_time_count}</span> /{' '}
                      {strat.selected_count} ({strat.on_time_percentage.toFixed(0)}%)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {strat.vehicle_utilization}%
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] font-mono">
                      {strat.selected_deliveries.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                      {strat.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Academic Synthesis Box */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Academic Synthesis for Faculty Evaluation</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {data.analysis}
          </p>
        </div>
      </div>
    </div>
  );
};
