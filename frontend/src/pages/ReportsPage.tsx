import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { OptimizationResult, Vehicle } from '../types';

interface ReportsPageProps {
  optimization: OptimizationResult | null;
  vehicle: Vehicle | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ optimization, vehicle }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReport();
  }, [optimization]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getReport();
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const headers = ['StopNumber', 'Type', 'DeliveryID', 'NodeID', 'ArrivalTime', 'DepartureTime', 'Deadline', 'Slack', 'Status'];
    const rows = reportData.stops.map((s: any) => [
      s.stop_number,
      `"${s.type}"`,
      s.delivery_id || '',
      s.node_id,
      s.arrival_time,
      s.departure_time,
      s.deadline || '',
      s.slack || '',
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RouteX_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Compiling operational report & academic viva dossier...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl no-print">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Operational Dispatch Manifest & DAA Academic Dossier
          </h2>
          <p className="text-xs text-slate-400">
            Official evaluation record containing multi-stage metrics, validation audits, and asymptotic complexity proofs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-md print-area space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white">RouteX</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                PBL DAA Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Intelligent Last-Mile Delivery Optimizer — Decision Support System
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Generated: <strong className="text-white">{reportData?.timestamp}</strong></div>
            <div>Vehicle: <strong className="text-blue-400">{vehicle?.id || 'VAN-01'}</strong></div>
          </div>
        </div>

        {/* Operational Key Metrics Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Operational Performance Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Total Maximized Profit</span>
              <span className="text-lg font-bold text-emerald-400">
                ₹{reportData?.metrics?.total_profit?.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Capacity Utilization</span>
              <span className="text-lg font-bold text-amber-300">
                {reportData?.metrics?.total_weight} / {vehicle?.capacity} kg ({reportData?.metrics?.utilization_pct}%)
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block text-[10px]">On-Time Rate</span>
              <span className="text-lg font-bold text-blue-400">
                {reportData?.metrics?.on_time_count} / {reportData?.metrics?.selected_count} ({reportData?.metrics?.on_time_percentage}%)
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Total Route Distance & Time</span>
              <span className="text-lg font-bold text-white">
                {reportData?.metrics?.total_distance_km} km ({reportData?.metrics?.total_time_min}m)
              </span>
            </div>
          </div>
        </div>

        {/* Selection Manifest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg">
            <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Accepted Deliveries ({reportData?.selected_deliveries?.length})
            </h4>
            <p className="font-mono text-white text-xs tracking-wider">
              {reportData?.selected_deliveries?.join(', ')}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Reason: Selected by 0/1 Knapsack DP to yield global maximum revenue within {vehicle?.capacity} kg capacity.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg">
            <h4 className="font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Rejected Deliveries ({reportData?.rejected_deliveries?.length})
            </h4>
            <p className="font-mono text-slate-300 text-xs tracking-wider">
              {reportData?.rejected_deliveries?.join(', ')}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Reason: Excluded due to capacity constraints or suboptimal profit-to-weight tradeoffs.
            </p>
          </div>
        </div>

        {/* Academic Complexity Analysis Table for DAA Viva */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            2. Design & Analysis of Algorithms (DAA) Theoretical Formulation
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Time Complexity</th>
                  <th className="py-2.5 px-3">Space Complexity</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Theoretical Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reportData?.complexities?.map((c: any, idx: number) => (
                  <tr key={`comp-${idx}`} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white">{c.algorithm}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400 font-semibold">{c.time_complexity}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">{c.space_complexity}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.type.includes('Optimal')
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Validation Audit Log */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            3. Operational Constraint Audit
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
            {reportData?.validation_notes?.map((n: string, i: number) => (
              <li key={`note-${i}`} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. DAA Viva Defense Guide (Classroom Presentation Q&A) */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white">
              4. DAA Viva Defense Dossier (Key Technical Questions & Model Answers)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-blue-300">
                Q1: Why 0/1 Knapsack DP rather than Fractional Knapsack Greedy?
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Packages cannot be divided into fractions (you cannot deliver 40% of a parcel). Fractional knapsack uses a greedy ratio that fails on discrete items because leaving partial capacity empty can exclude a higher-value combination. 0/1 Knapsack DP explores all sub-capacities via optimal substructure, guaranteeing the global maximum revenue.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-blue-300">
                Q2: Why Dijkstra instead of Bellman-Ford or Floyd-Warshall?
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Road distance and travel times are strictly non-negative (no negative weight edges). Dijkstra with a binary min-heap achieves O((V + E) log V), which is asymptotically superior to Bellman-Ford O(VE) and Floyd-Warshall O(V³).
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-blue-300">
                Q3: Is the Greedy route construction globally optimal?
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                No. Route scheduling with time-windows is a variant of the NP-hard Traveling Salesperson Problem with Time Windows (TSPTW). A greedy heuristic prioritizing (Profit × Urgency)/(Weight × TravelTime) yields an efficient O(k²) polynomial approximation rather than an intractable exponential exact search.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-blue-300">
                Q4: What is Slack time and why is it critical in scheduling?
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Slack = Deadline - ETA. If Slack ≥ 0, delivery arrives within customer contract limits (On-time). If Slack &lt; 0, delivery is late by |Slack| minutes. RouteX uses Slack in its dynamic urgency factor so closer deadlines get prioritized before they expire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
