import React from 'react';
import { HopNode } from '../types';
import {
  Laptop,
  Router,
  Server,
  Globe,
  Cloud,
  Database,
  CheckCircle2,
  Activity,
  Sparkles
} from 'lucide-react';

interface PacketVisualizerProps {
  hops: HopNode[];
  activeHopIndex: number;
  isTracing: boolean;
  isCompleted: boolean;
  selectedHopId: number | null;
  onSelectHop: (hop: HopNode) => void;
}

export const PacketVisualizer: React.FC<PacketVisualizerProps> = ({
  hops,
  activeHopIndex,
  isTracing,
  isCompleted,
  selectedHopId,
  onSelectHop
}) => {
  const getHopIcon = (type: string, className = 'w-5 h-5') => {
    switch (type) {
      case 'laptop':
        return <Laptop className={className} />;
      case 'router':
        return <Router className={className} />;
      case 'isp':
        return <Server className={className} />;
      case 'ixp':
        return <Globe className={className} />;
      case 'destination_net':
        return <Cloud className={className} />;
      case 'destination_server':
        return <Database className={className} />;
      default:
        return <Server className={className} />;
    }
  };

  return (
    <div className="relative w-full overflow-x-auto py-6 px-2 scrollbar-none">
      <div className="min-w-[760px] flex items-center justify-between relative px-6 py-4">
        
        {/* Connecting Lines & Animated Packet overlay */}
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1 bg-slate-800/80 -z-0 rounded-full overflow-visible">
          {/* Progress fill line */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(0,255,157,0.6)]"
            style={{
              width: isCompleted
                ? '100%'
                : `${(Math.max(0, activeHopIndex) / Math.max(1, hops.length - 1)) * 100}%`
            }}
          />

          {/* Animated Glowing Traveling Packet */}
          {isTracing && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 -ml-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_#00f3ff] border-2 border-white flex items-center justify-center animate-bounce z-20 transition-all duration-300"
              style={{
                left: `${(Math.max(0, activeHopIndex) / Math.max(1, hops.length - 1)) * 100}%`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          )}
        </div>

        {/* Hop Nodes */}
        {hops.map((hop, index) => {
          const isDone = index < activeHopIndex || isCompleted;
          const isActive = isTracing && index === activeHopIndex;
          const isSelected = selectedHopId === hop.id;

          return (
            <div
              key={hop.id}
              onClick={() => onSelectHop(hop)}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
            >
              {/* Hop Number Badge */}
              <div
                className={`mb-2 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold tracking-wider transition-all duration-300 border ${
                  isDone
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(0,255,157,0.3)]'
                    : isActive
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 animate-pulse shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700/60'
                }`}
              >
                HOP #{hop.hopNumber}
              </div>

              {/* Glowing Circle Node */}
              <div className="relative">
                {/* Active Ping Aura */}
                {isActive && (
                  <div className="absolute -inset-2 rounded-full bg-cyan-500/20 ping-ring border border-cyan-400/50" />
                )}

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-cyan-400/60 scale-110 z-20'
                      : ''
                  } ${
                    isDone
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(0,255,157,0.5)] scale-105'
                      : isActive
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(0,243,255,0.7)] scale-110'
                      : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {isDone ? (
                    getHopIcon(hop.type, 'w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,157,0.8)]')
                  ) : isActive ? (
                    getHopIcon(hop.type, 'w-6 h-6 text-cyan-300 animate-pulse drop-shadow-[0_0_10px_rgba(0,243,255,0.9)]')
                  ) : (
                    getHopIcon(hop.type, 'w-5 h-5 text-slate-400')
                  )}
                </div>

                {/* Status Indicator Icon */}
                {isDone && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-cyan-400">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Hop Details Labels */}
              <div className="mt-3 text-center max-w-[110px]">
                <p className="text-xs font-semibold text-slate-200 truncate font-rajdhani">
                  {hop.name}
                </p>
                <p className="text-[11px] font-mono-code text-slate-400 truncate mt-0.5">
                  {hop.ip}
                </p>

                {/* Latency Tag */}
                <div className="mt-1.5 flex items-center justify-center">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                      isDone
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : isActive
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 animate-pulse'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isDone || isActive ? `${hop.latency} ms` : '-- ms'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
