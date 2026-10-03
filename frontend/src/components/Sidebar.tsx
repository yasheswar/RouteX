import React from 'react';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Cpu,
  Activity,
  SlidersHorizontal,
  BarChart3,
  FileText,
  Settings,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Vehicle } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  vehicle: Vehicle | null;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  vehicle,
  onOpenSettings,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Deliveries', icon: Package },
    { id: 'map', label: 'Map & Route', icon: MapPin },
    { id: 'optimization', label: 'Optimization', icon: Cpu },
    { id: 'visualizer', label: 'Algorithm Visualizer', icon: Activity },
    { id: 'simulation', label: 'Simulation', icon: SlidersHorizontal },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">RouteX</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PBL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Last-Mile Optimizer</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Vehicle Status Snippet & Settings */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              {vehicle?.id || 'VAN-01'}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="text-xs text-slate-300 flex justify-between">
            <span>Capacity:</span>
            <span className="font-semibold text-white">{vehicle?.capacity || 20} kg</span>
          </div>
          <div className="text-xs text-slate-300 flex justify-between mt-1">
            <span>Hub / Depot:</span>
            <span className="font-semibold text-white">Node {vehicle?.depot || 'A'}</span>
          </div>
          <div className="text-xs text-slate-300 flex justify-between mt-1">
            <span>Traffic factor:</span>
            <span className="font-semibold text-blue-400">{vehicle?.traffic_multiplier || 1.0}x</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          Vehicle Configuration
        </button>
      </div>
    </aside>
  );
};
