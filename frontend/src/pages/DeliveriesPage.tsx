import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Delivery, Node, OptimizationResult } from '../types';
import { DeliveryModal } from '../components/DeliveryModal';

interface DeliveriesPageProps {
  deliveries: Delivery[];
  nodes: Node[];
  optimization: OptimizationResult | null;
  onAddDelivery: (delivery: Delivery) => void;
  onUpdateDelivery: (delivery: Delivery) => void;
  onDeleteDelivery: (id: string) => void;
  onReset: () => void;
}

export const DeliveriesPage: React.FC<DeliveriesPageProps> = ({
  deliveries,
  nodes,
  optimization,
  onAddDelivery,
  onUpdateDelivery,
  onDeleteDelivery,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const selectedSet = new Set(optimization?.selected_deliveries || []);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.drop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === 'All' || d.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const totalWeight = deliveries.reduce((acc, d) => acc + d.weight, 0);
  const totalProfit = deliveries.reduce((acc, d) => acc + d.profit, 0);

  const handleEdit = (d: Delivery) => {
    setEditingDelivery(d);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDelivery(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (delivery: Delivery) => {
    if (editingDelivery) {
      onUpdateDelivery(delivery);
    } else {
      onAddDelivery(delivery);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar with Add Delivery CTA matching UI Reference Montage Screen 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            Delivery Requests Pool ({deliveries.length} total)
          </h2>
          <p className="text-xs text-slate-400">
            Candidate orders awaiting algorithmic capacity selection and deadline dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Load Demo Set
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Delivery
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Pickup, Drop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Delivery Requests Table matching UI Reference Montage */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Pickup</th>
                <th className="py-3 px-4 font-semibold">Drop</th>
                <th className="py-3 px-4 font-semibold">Weight (kg)</th>
                <th className="py-3 px-4 font-semibold">Profit (₹)</th>
                <th className="py-3 px-4 font-semibold">Deadline (min)</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No delivery requests match the current filters.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => {
                  const isSelected = selectedSet.has(d.id);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white">{d.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">Node {d.pickup}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">Node {d.drop}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{d.weight} kg</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{d.profit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-medium">
                        {d.deadline} min
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            d.priority === 'High'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : d.priority === 'Medium'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-700/30 text-slate-400 border-slate-700/50'
                          }`}
                        >
                          {d.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit delivery"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDelivery(d.id)}
                            className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40"
                            title="Delete delivery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Aggregate Summary Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{filteredDeliveries.length}</span> of{' '}
            <span className="font-semibold text-white">{deliveries.length}</span> requests
          </div>
          <div className="flex items-center gap-6">
            <div>
              Total Requested Weight:{' '}
              <span className="font-semibold text-white">{totalWeight.toFixed(1)} kg</span>
            </div>
            <div>
              Total Potential Revenue:{' '}
              <span className="font-bold text-emerald-400">₹{totalProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nodes={nodes}
        initialData={editingDelivery}
        onSave={handleSaveModal}
      />
    </div>
  );
};
