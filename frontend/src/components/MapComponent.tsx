import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, Truck, Navigation, CheckCircle2 } from 'lucide-react';
import { Node, Edge, Delivery, OptimizationResult, RouteStop } from '../types';

interface MapComponentProps {
  nodes: Node[];
  edges: Edge[];
  deliveries: Delivery[];
  optimization: OptimizationResult | null;
  filterMode?: 'all' | 'selected' | 'rejected';
  height?: string;
}

// Custom Leaflet DivIcon helpers
const createDepotIcon = (label: string) => {
  return L.divIcon({
    className: 'custom-depot-marker',
    html: `
      <div style="background-color: #2563eb; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const createNodeIcon = (label: string, color: string, border: string = '#ffffff') => {
  return L.divIcon({
    className: 'custom-node-marker',
    html: `
      <div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; border: 2px solid ${border}; box-shadow: 0 3px 8px rgba(0,0,0,0.5);">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(59, 130, 246, 0.4); animation: pulse-ring 1.8s infinite;"></div>
        <div style="background-color: #1d4ed8; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid #60a5fa; box-shadow: 0 4px 12px rgba(0,0,0,0.7); z-index: 10;">
          🚚
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

// Component to dynamically fit bounds and invalidate size on tab switch
const MapController: React.FC<{ nodes: Node[] }> = ({ nodes }) => {
  const map = useMap();
  useEffect(() => {
    // Prevent gray tiles bug when switching tabs
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (nodes.length > 0) {
        const bounds = L.latLngBounds(nodes.map((n) => [n.lat, n.lng]));
        map.fitBounds(bounds, { padding: [45, 45] });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [nodes, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  nodes,
  edges,
  deliveries,
  optimization,
  filterMode = 'all',
  height = '500px',
}) => {
  const defaultCenter: [number, number] = nodes.length > 0 ? [nodes[0].lat, nodes[0].lng] : [12.9716, 77.5946];
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  // Route animation states
  const [animStopIdx, setAnimStopIdx] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simTimerRef = useRef<any>(null);

  const stops = optimization?.stops || [];

  useEffect(() => {
    if (isSimulating && stops.length > 0) {
      simTimerRef.current = setInterval(() => {
        setAnimStopIdx((prev) => {
          if (prev >= stops.length - 1) {
            setIsSimulating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    } else if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, stops]);

  const handleResetSim = () => {
    setIsSimulating(false);
    setAnimStopIdx(0);
  };

  // Selected delivery IDs
  const selectedSet = new Set(optimization?.selected_deliveries || []);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterMode === 'selected') return selectedSet.has(d.id);
    if (filterMode === 'rejected') return !selectedSet.has(d.id);
    return true;
  });

  const routeCoords: [number, number][] = optimization?.full_path_coords || [];

  // Stop lookup for ETA & slack
  const stopByDelivery = new Map<string, RouteStop>();
  if (optimization) {
    for (const stop of optimization.stops) {
      if (stop.delivery_id) {
        stopByDelivery.set(stop.delivery_id, stop);
      }
    }
  }

  // Active simulated stop
  const currentSimStop = stops[animStopIdx] || null;
  const currentSimNode = currentSimStop ? nodesMap.get(currentSimStop.node_id) : null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-lg" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController nodes={nodes} />

        {/* Network base road connections */}
        {edges.map((edge, idx) => {
          const fromNode = nodesMap.get(edge.from_node);
          const toNode = nodesMap.get(edge.to_node);
          if (!fromNode || !toNode) return null;
          return (
            <Polyline
              key={`edge-${idx}`}
              positions={[
                [fromNode.lat, fromNode.lng],
                [toNode.lat, toNode.lng],
              ]}
              color="#334155"
              weight={2}
              opacity={0.4}
              dashArray="4, 4"
            />
          );
        })}

        {/* Active optimized route polyline */}
        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />
        )}

        {/* Network Transfer Nodes */}
        {nodes.map((node) => {
          const isDepot = node.id === 'A';
          const icon = isDepot ? createDepotIcon('HUB') : createNodeIcon(node.id, '#475569');

          return (
            <Marker
              key={`node-${node.id}`}
              position={[node.lat, node.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 text-slate-100 text-xs">
                  <div className="font-bold text-sm text-blue-400 mb-1">
                    {node.name} (Node {node.id})
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {isDepot ? 'Vehicle Dispatch Hub & Start/End Depot' : 'Network Transfer Node'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Delivery Waypoint Markers */}
        {filteredDeliveries.map((delivery) => {
          const isSelected = selectedSet.has(delivery.id);
          const dropNode = nodesMap.get(delivery.drop);
          const pickupNode = nodesMap.get(delivery.pickup);
          const stopInfo = stopByDelivery.get(delivery.id);

          const statusColor = isSelected
            ? (stopInfo?.status === 'Late' ? '#f59e0b' : '#10b981')
            : '#ef4444';

          if (!dropNode) return null;

          // Slight offset to prevent identical overlap
          const offsetLat = (parseInt(delivery.id.replace(/\D/g, '') || '1') % 5) * 0.0012 - 0.0025;
          const offsetLng = ((parseInt(delivery.id.replace(/\D/g, '') || '1') * 2) % 5) * 0.0012 - 0.0025;

          const deliveryIcon = createNodeIcon(delivery.id, statusColor);

          return (
            <Marker
              key={`delivery-${delivery.id}`}
              position={[dropNode.lat + offsetLat, dropNode.lng + offsetLng]}
              icon={deliveryIcon}
            >
              <Popup>
                <div className="p-1.5 text-slate-100 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
                    <span className="font-bold text-sm text-white">Delivery {delivery.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? stopInfo?.status === 'Late'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isSelected ? (stopInfo?.status || 'Selected') : 'Rejected'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pickup:</span>
                      <span className="font-semibold text-white">Node {delivery.pickup} ({pickupNode?.name || ''})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drop:</span>
                      <span className="font-semibold text-white">Node {delivery.drop} ({dropNode.name})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weight:</span>
                      <span className="font-semibold text-white">{delivery.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profit:</span>
                      <span className="font-semibold text-emerald-400">₹{delivery.profit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-semibold text-amber-300">{delivery.deadline} min</span>
                    </div>

                    {stopInfo && (
                      <>
                        <div className="border-t border-slate-700/80 pt-1 mt-1 flex justify-between">
                          <span className="text-slate-400">Calculated ETA:</span>
                          <span className="font-semibold text-blue-400">{stopInfo.arrival_time} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Slack:</span>
                          <span
                            className={`font-semibold ${
                              (stopInfo.slack || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {stopInfo.slack !== null && stopInfo.slack !== undefined ? `${stopInfo.slack > 0 ? '+' : ''}${stopInfo.slack} min` : 'N/A'}
                          </span>
                        </div>
                        {stopInfo.current_load_kg !== undefined && stopInfo.current_load_kg !== null && (
                          <div className="flex justify-between border-t border-slate-700/60 pt-1 mt-1">
                            <span className="text-slate-400">Vehicle Load:</span>
                            <span className="font-semibold text-sky-300">{stopInfo.current_load_kg} kg</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Animated Live Vehicle Van Marker */}
        {currentSimNode && (
          <Marker
            position={[currentSimNode.lat, currentSimNode.lng]}
            icon={createVehicleIcon()}
            zIndexOffset={2000}
          >
            <Popup>
              <div className="p-1 text-xs">
                <div className="font-bold text-blue-400">Delivery Vehicle Van</div>
                <div>Currently at: Node {currentSimStop?.node_id} ({currentSimStop?.node_name})</div>
                <div>Timeline: {currentSimStop?.arrival_time} - {currentSimStop?.departure_time} min</div>
                {currentSimStop?.current_load_kg !== undefined && (
                  <div className="text-sky-300 font-semibold">Onboard Load: {currentSimStop.current_load_kg} kg</div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Interactive Route Run Simulator (Top Right) */}
      {stops.length > 0 && (
        <div className="absolute top-3 right-3 bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300 z-[1000] shadow-xl max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              Live Route Simulator
            </span>
            <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Stop {animStopIdx} / {stops.length - 1}
            </span>
          </div>

          {currentSimStop && (
            <div className="space-y-1 text-[11px] bg-slate-900/90 p-2 rounded-lg border border-slate-800 font-mono">
              <div className="text-white font-bold truncate">
                {currentSimStop.type}
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Location: Node {currentSimStop.node_id}</span>
                <span className="text-blue-400 font-bold">{currentSimStop.arrival_time} min</span>
              </div>
              {currentSimStop.current_load_kg !== undefined && currentSimStop.current_load_kg !== null && (
                <div className="text-slate-400 flex justify-between">
                  <span>Payload:</span>
                  <span className="text-sky-300 font-bold">{currentSimStop.current_load_kg} kg</span>
                </div>
              )}
              {currentSimStop.slack !== null && currentSimStop.slack !== undefined && (
                <div className="flex justify-between border-t border-slate-800/80 pt-0.5">
                  <span className="text-slate-500">Slack:</span>
                  <span className={currentSimStop.slack >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {currentSimStop.slack > 0 ? `+${currentSimStop.slack}` : currentSimStop.slack}m ({currentSimStop.status})
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isSimulating ? 'Pause Run' : 'Simulate Run'}</span>
            </button>
            <button
              onClick={handleResetSim}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Reset Trip Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Map Legend (Bottom Left, safely away from Zoom Controls) */}
      <div className="absolute bottom-3 left-3 bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 z-[1000] shadow-md space-y-1.5">
        <div className="font-semibold text-white text-xs border-b border-slate-700 pb-1 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block" />
          <span>Depot (Hub)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500 border border-white inline-block" />
          <span>Transfer Node</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />
          <span>Selected & On-time</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block" />
          <span>Selected & Late</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-white inline-block" />
          <span>Rejected Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-blue-600 rounded inline-block" />
          <span>Optimized Route</span>
        </div>
      </div>
    </div>
  );
};
