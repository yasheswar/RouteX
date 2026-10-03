import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  Truck,
  Car,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { SimulationResponse } from '../types';

export const SimulationPage: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(20);
  const [numDeliveries, setNumDeliveries] = useState<number>(15);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.0);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState<number>(90);
  const [seed, setSeed] = useState<number>(42);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);

  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.runSimulation({
        capacity,
        num_deliveries: numDeliveries,
        traffic_multiplier: trafficMultiplier,
        max_delivery_time: maxDeliveryTime,
        seed,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = async (cap: number, num: number, traffic: number, deadline: number) => {
    setCapacity(cap);
    setNumDeliveries(num);
    setTrafficMultiplier(traffic);
    setMaxDeliveryTime(deadline);
    try {
      setLoading(true);
      const res = await api.runSimulation({
        capacity: cap,
        num_deliveries: num,
        traffic_multiplier: traffic,
        max_delivery_time: deadline,
        seed,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    applyPreset(20, 15, 1.0, 90);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Quick Scenario Presets */}
      <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            What-If Scenario Simulation
          </h2>
          <p className="text-xs text-slate-400">
            Stress-test vehicle capacity, road congestion, and customer deadline strictness under reproducible random seeds
          </p>
        </div>

        {/* Quick Scenario Presets for Presentation */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Demo Presets:</span>
          <button
            onClick={() => applyPreset(20, 15, 1.8, 45)}
            className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 rounded-lg transition-colors"
          >
            Rush Hour (1.8x)
          </button>
          <button
            onClick={() => applyPreset(35, 22, 1.0, 90)}
            className="px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 rounded-lg transition-colors"
          >
            Heavy Fleet (35kg)
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Baseline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders (4 cols) matching UI Reference */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Simulation Parameters
          </h3>

          {/* 1. Vehicle Capacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                Vehicle Capacity (kg)
              </span>
              <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {capacity} kg
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 kg (Compact)</span>
              <span>20 kg (Default)</span>
              <span>35 kg (Heavy Van)</span>
            </div>
          </div>

          {/* 2. Number of Deliveries */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                Candidate Order Volume
              </span>
              <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {numDeliveries} orders
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              step="1"
              value={numDeliveries}
              onChange={(e) => setNumDeliveries(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>8 orders</span>
              <span>15 orders</span>
              <span>25 orders</span>
            </div>
          </div>

          {/* 3. Traffic Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Traffic Congestion Multiplier
              </span>
              <span className="font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {trafficMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={trafficMultiplier}
              onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.5x (Night / Free Flow)</span>
              <span>1.0x (Baseline)</span>
              <span>2.0x (Peak Rush Hour)</span>
            </div>
          </div>

          {/* 4. Max Delivery Time / Deadline strictness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Max Delivery Deadline Window
              </span>
              <span className="font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {maxDeliveryTime} min
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              step="5"
              value={maxDeliveryTime}
              onChange={(e) => setMaxDeliveryTime(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>40 min (Strict)</span>
              <span>90 min (Normal)</span>
              <span>150 min (Relaxed)</span>
            </div>
          </div>

          {/* Seed Input */}
          <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
            <span className="text-slate-400">Random Seed (Reproducibility):</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Right Column: Results Comparison Table matching UI Reference */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Results Comparison</h3>
                <p className="text-xs text-slate-400">
                  Measuring algorithmic performance shifts against baseline configuration
                </p>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Real Recalculation
              </span>
            </div>

            <div className="overflow-x-auto mb-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Metric</th>
                    <th className="py-2.5 px-4 font-semibold">Baseline</th>
                    <th className="py-2.5 px-4 font-semibold">New Scenario</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {result?.comparison_metrics.map((row, idx) => {
                    const isPositive = row.is_positive;
                    return (
                      <tr key={`sim-metric-${idx}`} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-white">{row.metric}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{row.baseline}</td>
                        <td className="py-3 px-4 text-white font-mono font-bold">{row.scenario}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${
                              isPositive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {row.change}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Insight Badge matching UI Reference Screen 7 */}
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-200 mb-0.5">Algorithmic Insight:</span>
                <p className="text-emerald-300/90 leading-relaxed">
                  {result?.summary_note ||
                    'Higher capacity and optimized routing improves profit and on-time rate.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Deterministic simulation grounded in pure algorithmic execution.</span>
            <span>Zero hardcoded mock numbers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
