import React, { useState } from 'react';
import { Terminal, Copy, Check, TerminalSquare, ShieldAlert } from 'lucide-react';
import { HopNode } from '../types';

interface TracerouteTerminalProps {
  domain: string;
  resolvedIp: string;
  hops: HopNode[];
  activeHopIndex: number;
  isTracing: boolean;
  isCompleted: boolean;
  totalLatency: number;
}

export const TracerouteTerminal: React.FC<TracerouteTerminalProps> = ({
  domain,
  resolvedIp,
  hops,
  activeHopIndex,
  isCompleted,
  totalLatency
}) => {
  const [copied, setCopied] = useState(false);

  const generateTerminalText = (): string => {
    let output = `[CYBER-CLI v4.2.0] root@network-node:~# traceroute ${domain}\n`;
    output += `traceroute to ${domain} (${resolvedIp}), 64 hops max, 52 byte ICMP echo packets\n`;
    output += `--------------------------------------------------------------------------------\n`;

    hops.forEach((hop, idx) => {
      if (idx <= activeHopIndex || isCompleted) {
        output += ` ${hop.hopNumber.toString().padStart(2, ' ')}  ${hop.ip.padEnd(16, ' ')} (${hop.hostname})  ${hop.rtt1} ms  ${hop.rtt2} ms  ${hop.rtt3} ms  [${hop.asn}]\n`;
      }
    });

    if (isCompleted) {
      output += `--------------------------------------------------------------------------------\n`;
      output += `[STATUS] Trace completed successfully. Total hops: ${hops.length} | Cumulative Latency: ${totalLatency} ms\n`;
    }

    return output;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTerminalText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
      {/* Terminal Bar */}
      <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/50" />
          </div>
          <span className="text-xs font-mono-code text-slate-400 flex items-center space-x-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300">icmptrace --host {domain}</span>
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 font-mono-code transition-colors"
          title="Copy CLI output"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Content Body */}
      <div className="p-4 bg-[#030612] text-xs font-mono-code text-emerald-400/90 leading-relaxed overflow-x-auto max-h-56 select-text">
        <div className="text-cyan-400 font-bold mb-1">
          $ traceroute -I -m 64 {domain}
        </div>
        <div className="text-slate-400 text-[11px] mb-2">
          traceroute to {domain} ({resolvedIp}), 64 hops max, 52 byte packets
        </div>

        {hops.map((hop, idx) => {
          const isShown = idx <= activeHopIndex || isCompleted;
          if (!isShown) return null;

          return (
            <div
              key={hop.id}
              className="flex items-center space-x-3 py-0.5 border-b border-slate-900/60 hover:bg-slate-900/40 text-[11px]"
            >
              <span className="text-cyan-400 font-bold w-6 text-right">
                {hop.hopNumber}
              </span>
              <span className="text-slate-200 w-32 font-semibold">
                {hop.ip}
              </span>
              <span className="text-slate-400 truncate max-w-[200px]">
                ({hop.hostname})
              </span>
              <span className="text-emerald-400 font-bold ml-auto">
                {hop.rtt1} ms
              </span>
              <span className="text-emerald-400/80">
                {hop.rtt2} ms
              </span>
              <span className="text-emerald-300">
                {hop.rtt3} ms
              </span>
            </div>
          );
        })}

        {isCompleted && (
          <div className="mt-3 text-cyan-300 font-bold border-t border-cyan-900/60 pt-2 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Trace completed successfully. Total hops: {hops.length} | Cumulative Latency: {totalLatency} ms</span>
          </div>
        )}
      </div>
    </div>
  );
};
