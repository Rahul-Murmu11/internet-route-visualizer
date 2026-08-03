import React from 'react';
import { HopNode } from '../types';
import {
  X,
  Server,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  Cpu,
  Radio,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface HopDetailModalProps {
  hop: HopNode | null;
  onClose: () => void;
}

export const HopDetailModal: React.FC<HopDetailModalProps> = ({ hop, onClose }) => {
  if (!hop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel-cyan rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-orbitron font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                HOP #{hop.hopNumber}
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-rajdhani">
                {hop.name}
              </h3>
            </div>
            <p className="text-xs font-mono-code text-cyan-300/80 mt-0.5">
              IP: {hop.ip} ({hop.hostname})
            </p>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Location</span>
            </div>
            <p className="text-sm font-semibold text-slate-100">{hop.location}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Autonomous System (ASN)</span>
            </div>
            <p className="text-sm font-mono-code font-semibold text-slate-100 truncate">
              {hop.asn}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Hop Latency</span>
            </div>
            <p className="text-lg font-mono-code font-bold text-emerald-400 text-glow-green">
              {hop.latency} ms
            </p>
            <p className="text-[10px] text-slate-400 font-mono-code mt-0.5">
              RTT: {hop.rtt1}ms | {hop.rtt2}ms | {hop.rtt3}ms
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Packet Loss / TTL</span>
            </div>
            <p className="text-sm font-mono-code font-semibold text-slate-100">
              Loss: {hop.packetLoss}% | TTL: {hop.ttl}
            </p>
          </div>
        </div>

        {/* Technical Description */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/50 mb-6">
          <h4 className="text-xs font-bold text-cyan-300 font-orbitron mb-1.5 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Node Function & Architecture</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-rajdhani">
            {hop.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Node Status: Operational & Online</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
