import React from 'react';
import { HopNode } from '../types';
import {
  Laptop,
  Router,
  Server,
  Globe,
  Cloud,
  Database,
  MapPin,
  Clock,
  Shield,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';

interface HopCardProps {
  hop: HopNode;
  isCurrentHop: boolean;
  isCompletedHop: boolean;
  isSelected: boolean;
  onSelect: (hop: HopNode) => void;
}

export const HopCard: React.FC<HopCardProps> = ({
  hop,
  isCurrentHop,
  isCompletedHop,
  isSelected,
  onSelect
}) => {
  const getIcon = () => {
    switch (hop.type) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'router':
        return <Router className="w-5 h-5 text-blue-400" />;
      case 'isp':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'ixp':
        return <Globe className="w-5 h-5 text-yellow-400" />;
      case 'destination_net':
        return <Cloud className="w-5 h-5 text-pink-400" />;
      case 'destination_server':
        return <Database className="w-5 h-5 text-emerald-400" />;
      default:
        return <Server className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Calculate percentage of max 60ms latency for bar display
  const latencyPercent = Math.min(100, Math.max(8, (hop.latency / 60) * 100));

  return (
    <div
      onClick={() => onSelect(hop)}
      className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'glass-panel-cyan ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(0,243,255,0.3)] scale-[1.02]'
          : isCompletedHop
          ? 'glass-panel-green border-emerald-500/40 hover:border-emerald-400'
          : isCurrentHop
          ? 'glass-panel-cyan border-cyan-400/60 animate-pulse-glow'
          : 'glass-panel border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-lg border ${
              isCompletedHop
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : isCurrentHop
                ? 'bg-cyan-950/90 border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-400'
            }`}
          >
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-orbitron font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded">
                HOP #{hop.hopNumber}
              </span>
              <h4 className="text-sm font-bold text-slate-100 font-rajdhani tracking-wide">
                {hop.name}
              </h4>
            </div>
            <p className="text-xs font-mono-code text-slate-400 mt-0.5">
              {hop.ip}
            </p>
          </div>
        </div>

        {/* Status Tag */}
        <div>
          {isCompletedHop ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(0,255,157,0.3)]">
              <CheckCircle2 className="w-3 h-3" />
              <span>PASS</span>
            </span>
          ) : isCurrentHop ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/60 animate-pulse">
              <Activity className="w-3 h-3 animate-spin" />
              <span>PINGING</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-500 border border-slate-800">
              WAITING
            </span>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="truncate text-[11px]">{hop.location}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400 justify-end">
          <Shield className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="truncate text-[11px] font-mono-code">{hop.asn}</span>
        </div>
      </div>

      {/* Latency Meter Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-mono-code mb-1">
          <span className="text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>LATENCY:</span>
          </span>
          <span
            className={`font-bold ${
              isCompletedHop
                ? 'text-emerald-400 text-glow-green'
                : isCurrentHop
                ? 'text-cyan-300 text-glow-cyan animate-pulse'
                : 'text-slate-500'
            }`}
          >
            {isCompletedHop || isCurrentHop ? `${hop.latency} ms` : '-- ms'}
          </span>
        </div>

        {/* Progress Bar for Latency */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompletedHop
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_#00ff9d]'
                : isCurrentHop
                ? 'bg-cyan-400 shadow-[0_0_8px_#00f3ff] animate-pulse'
                : 'bg-slate-800'
            }`}
            style={{
              width: isCompletedHop || isCurrentHop ? `${latencyPercent}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};
