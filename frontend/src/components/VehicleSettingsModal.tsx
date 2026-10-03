import React, { useState } from 'react';
import { X, Truck, Save } from 'lucide-react';
import { Vehicle, Node } from '../types';

interface VehicleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  nodes: Node[];
  onSave: (updated: Vehicle) => void;
}

export const VehicleSettingsModal: React.FC<VehicleSettingsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  nodes,
  onSave,
}) => {
  if (!isOpen || !vehicle) return null;

  const [formData, setFormData] = useState<Vehicle>({ ...vehicle });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Vehicle & Logistics Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Vehicle Identifier</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Vehicle Capacity (kg)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Used by 0/1 Knapsack DP</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Depot Hub</label>
              <select
                value={formData.depot}
                onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Node {n.id} - {n.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400">Route starting/ending point</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Shift Max Operating Time (min)
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                value={formData.max_operating_time}
                onChange={(e) => setFormData({ ...formData, max_operating_time: parseFloat(e.target.value) || 480 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Avg Service Time (min/stop)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={formData.service_time}
                onChange={(e) => setFormData({ ...formData, service_time: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Traffic Multiplier</label>
              <span className="text-blue-400 font-bold">{formData.traffic_multiplier}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={formData.traffic_multiplier}
              onChange={(e) => setFormData({ ...formData, traffic_multiplier: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0.5x (Light)</span>
              <span>1.0x (Normal)</span>
              <span>2.5x (Heavy Congestion)</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
