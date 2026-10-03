import React, { useState } from 'react';
import {
  MapPin,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { Node, Edge, Delivery, Vehicle, OptimizationResult } from '../types';

interface MapRoutePageProps {
  nodes: Node[];
  edges: Edge[];
  deliveries: Delivery[];
  vehicle: Vehicle | null;
  optimization: OptimizationResult | null;
  onOptimize: () => void;
  onReset: () => void;
  isOptimizing: boolean;
}

export const MapRoutePage: React.FC<MapRoutePageProps> = ({
  nodes,
  edges,
  deliveries,
  vehicle,
  optimization,
  onOptimize,
  onReset,
  isOptimizing,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'rejected'>('all');

  return (
    <div className="p-6 space-y-5">
      {/* Top Header & Controls matching UI Reference Montage Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Interactive Map & Network Routing
          </h2>
          <p className="text-xs text-slate-400">
            OpenStreetMap GIS visualization showing depot loop, transfer nodes, and customer drop points
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Show:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="all" className="bg-slate-900">All Deliveries</option>
              <option value="selected" className="bg-slate-900">Selected Only</option>
              <option value="rejected" className="bg-slate-900">Rejected Only</option>
            </select>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Route'}</span>
          </button>
        </div>
      </div>

      {/* Main Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3">
          <MapComponent
            nodes={nodes}
            edges={edges}
            deliveries={deliveries}
            optimization={optimization}
            filterMode={filterMode}
            height="620px"
          />
        </div>

        {/* Live Route Summary & Timeline Sidebar */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[620px]">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white">Route Stops Manifest</h3>
              <p className="text-[11px] text-slate-400">
                {optimization ? `${optimization.stops.length} scheduled waypoints` : 'Run optimization to generate'}
              </p>
            </div>

            {/* Scrollable list of stops */}
            <div className="overflow-y-auto max-h-[460px] pr-1 space-y-2">
              {!optimization || optimization.stops.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No route generated yet. Click "Optimize Route" above to compute.
                </div>
              ) : (
                optimization.stops.map((stop, index) => {
                  const isDepot = stop.type.includes('Depot');
                  const isOnTime = stop.status === 'On-time';
                  const isLate = stop.status === 'Late';

                  return (
                    <div
                      key={`stop-${index}`}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                            {stop.stop_number}
                          </span>
                          <span>{stop.type}</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isDepot
                              ? 'bg-blue-500/20 text-blue-400'
                              : isOnTime
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isLate
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-700/30 text-slate-400'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex justify-between">
                        <span>Node {stop.node_id} ({stop.node_name})</span>
                        <span className="font-semibold text-slate-200">
                          {stop.arrival_time}m - {stop.departure_time}m
                        </span>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        {stop.current_load_kg !== undefined && stop.current_load_kg !== null ? (
                          <span>Load: <strong className="text-sky-300 font-mono">{stop.current_load_kg} kg</strong></span>
                        ) : <span />}
                        {stop.distance_from_prev_km > 0 && (
                          <span>+{stop.distance_from_prev_km} km</span>
                        )}
                      </div>

                      {stop.slack !== null && stop.slack !== undefined && (
                        <div className="text-[10px] mt-1 flex justify-between border-t border-slate-800/80 pt-1">
                          <span className="text-slate-500">Deadline: {stop.deadline}m</span>
                          <span
                            className={`font-semibold ${
                              stop.slack >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            Slack: {stop.slack > 0 ? `+${stop.slack}` : stop.slack} min
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Metrics Footer */}
          {optimization && (
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 flex justify-between font-medium">
              <span>Total Dist: <strong className="text-white">{optimization.total_distance_km} km</strong></span>
              <span>Total Time: <strong className="text-white">{optimization.total_route_time_min} min</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
