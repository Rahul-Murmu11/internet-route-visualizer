import React from 'react';
import { HopNode } from '../types';
import { Package, Hash, Layers, ShieldCheck, Cpu } from 'lucide-react';

interface PacketInspectorProps {
  currentHop: HopNode | null;
  targetDomain: string;
  targetIp: string;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({
  currentHop,
  targetDomain,
  targetIp
}) => {
  const srcIp = '192.168.1.105';
  const currentIp = currentHop ? currentHop.ip : '192.168.1.105';
  const ttl = currentHop ? currentHop.ttl : 64;

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-orbitron font-bold text-slate-200">
            ICMP Packet Header Inspector
          </h3>
        </div>
        <span className="text-[10px] font-mono-code text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          TYPE: ICMP ECHO (8)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono-code mb-3">
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">SRC IP</div>
          <div className="text-cyan-300 font-bold truncate">{srcIp}</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">CURRENT HOP</div>
          <div className="text-emerald-300 font-bold truncate">{currentIp}</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">DEST IP</div>
          <div className="text-purple-300 font-bold truncate">{targetIp}</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">TTL / CHECKSUM</div>
          <div className="text-amber-300 font-bold">TTL: {ttl} | 0x4f2a</div>
        </div>
      </div>

      {/* Hex Payload Dump */}
      <div className="bg-[#02050e] p-3 rounded-lg border border-slate-900 font-mono-code text-[11px] text-slate-400">
        <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
          <span>PAYLOAD HEX DUMP (64 bytes)</span>
          <span className="text-cyan-400">ASCII DATA</span>
        </div>
        <div className="text-cyan-500/80 tracking-widest leading-relaxed font-mono">
          0000: 45 00 00 3c 1a 2b 00 00 40 01 8c 4f c0 a8 01 69 &nbsp;&nbsp; E..&lt;.+..@..O...i
          <br />
          0010: 8e fa be 2e 08 00 5d 2e 00 01 00 01 e2 3a 00 00 &nbsp;&nbsp; ......]......:..
          <br />
          0020: 72 6f 75 74 65 2d 74 72 61 63 65 72 2d 70 61 63 &nbsp;&nbsp; route-tracer-pac
          <br />
          0030: 6b 65 74 2d 74 61 72 67 65 74 3d 7b 64 6f 6d 7d &nbsp;&nbsp; ket-target={targetDomain.slice(0, 3)}
        </div>
      </div>
    </div>
  );
};
