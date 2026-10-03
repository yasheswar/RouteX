import React from 'react';
import { Play, RotateCcw, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { Vehicle } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  vehicle: Vehicle | null;
  onOptimize: () => void;
  onReset: () => void;
  onClear: () => void;
  onOpenVivaModal: () => void;
  isOptimizing: boolean;
  deliveriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  vehicle,
  onOptimize,
  onReset,
  onClear,
  onOpenVivaModal,
  isOptimizing,
  deliveriesCount,
}) => {
  return (
    <header className="h-16 px-6 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Viva Defense Mode Button */}
        <button
          onClick={onOpenVivaModal}
          title="Open DAA Viva Defense Dossier, Recurrence Calculator, and Examiner Stress-Tests"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-600/40 rounded-lg shadow-sm transition-all"
        >
          <span className="text-sm">🎓</span>
          <span>Viva Defense Mode</span>
        </button>

        {/* Dataset Quick Actions */}
        <button
          onClick={onReset}
          title="Reload 15 default deliveries with balanced trade-offs"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Load Demo
        </button>

        <button
          onClick={onClear}
          title="Clear all delivery requests"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          Clear
        </button>

        {/* Primary CTA */}
        <button
          onClick={onOptimize}
          disabled={isOptimizing || deliveriesCount === 0}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-md transition-all ${
            isOptimizing || deliveriesCount === 0
              ? 'bg-blue-600/50 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 active:scale-95'
          }`}
        >
          {isOptimizing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-blue-200 fill-blue-200" />
          )}
          <span>{isOptimizing ? 'Optimizing Pipeline...' : 'Run Optimization'}</span>
        </button>
      </div>
    </header>
  );
};
