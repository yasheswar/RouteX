import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save } from 'lucide-react';
import { Delivery, Node } from '../types';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  initialData?: Delivery | null;
  onSave: (delivery: Delivery) => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  nodes,
  initialData,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Delivery>({
    id: `D${Math.floor(Math.random() * 90 + 10)}`,
    pickup: 'A',
    drop: 'B',
    weight: 4.0,
    profit: 500,
    deadline: 30,
    priority: 'Medium',
    service_time: 3.0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        id: `D${Math.floor(Math.random() * 90 + 10)}`,
        pickup: 'A',
        drop: nodes.length > 1 ? nodes[1].id : 'B',
        weight: 4.0,
        profit: 500,
        deadline: 30,
        priority: 'Medium',
        service_time: 3.0,
      });
    }
  }, [initialData, nodes]);

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
            <PackagePlus className="w-4 h-4 text-blue-500" />
            <span>{initialData ? `Edit Delivery ${initialData.id}` : 'Create Delivery Request'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Delivery ID</label>
              <input
                type="text"
                disabled={!!initialData}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pickup Node</label>
              <select
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {nodes.map((n) => (
                  <option key={`p-${n.id}`} value={n.id}>
                    Node {n.id} ({n.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Drop Node</label>
              <select
                value={formData.drop}
                onChange={(e) => setFormData({ ...formData, drop: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {nodes.map((n) => (
                  <option key={`d-${n.id}`} value={n.id}>
                    Node {n.id} ({n.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Package Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.5 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Profit / Revenue (₹)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={formData.profit}
                onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Deadline (min)</label>
              <input
                type="number"
                min="5"
                max="600"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: parseFloat(e.target.value) || 10 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Service Time (min)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.service_time}
                onChange={(e) => setFormData({ ...formData, service_time: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
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
              {initialData ? 'Update Delivery' : 'Add Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
