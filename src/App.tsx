import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Server,
  ArrowRight,
  Info,
  Search,
  Sliders
} from 'lucide-react';
import { HopNode, TraceStatus } from './types';
import { DOMAIN_PRESETS, cleanDomainInput, generateHopsForDomain, generateResolvedIp } from './utils/routeGenerator';
import { soundFx } from './utils/audio';
import { NetworkMapCanvas } from './components/NetworkMapCanvas';
import { PacketVisualizer } from './components/PacketVisualizer';
import { HopCard } from './components/HopCard';
import { TracerouteTerminal } from './components/TracerouteTerminal';
import { PacketInspector } from './components/PacketInspector';
import { HopDetailModal } from './components/HopDetailModal';

export default function App() {
  const [inputDomain, setInputDomain] = useState('google.com');
  const [activeDomain, setActiveDomain] = useState('google.com');
  const [resolvedIp, setResolvedIp] = useState('142.250.190.46');
  const [hops, setHops] = useState<HopNode[]>(() => generateHopsForDomain('google.com'));

  const [status, setStatus] = useState<TraceStatus>('waiting');
  const [activeHopIndex, setActiveHopIndex] = useState<number>(-1);
  const [traceSpeed, setTraceSpeed] = useState<number>(1000); // ms per hop
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [selectedHop, setSelectedHop] = useState<HopNode | null>(null);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);
  const [showPacketInspector, setShowPacketInspector] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync domain and resolved IP when starting
  const initializeRoute = (domainToUse: string) => {
    const cleaned = cleanDomainInput(domainToUse);
    setActiveDomain(cleaned);
    const ip = generateResolvedIp(cleaned);
    setResolvedIp(ip);
    const newHops = generateHopsForDomain(cleaned);
    setHops(newHops);
    setActiveHopIndex(-1);
    setStatus('waiting');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Handle Start Trace
  const handleStartTrace = () => {
    soundFx.playClick();
    const cleaned = cleanDomainInput(inputDomain);
    initializeRoute(cleaned);

    // Short timeout to kick off tracing state cleanly
    setTimeout(() => {
      setStatus('tracing');
      setActiveHopIndex(0);
      soundFx.playHopPing(1, hops[0]?.latency || 10);
    }, 200);
  };

  // Handle Restart
  const handleRestart = () => {
    soundFx.playClick();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveHopIndex(-1);
    setStatus('waiting');
    setHops(generateHopsForDomain(activeDomain));
  };

  // Handle Preset Domain Selection
  const handleSelectPreset = (domain: string) => {
    soundFx.playClick();
    setInputDomain(domain);
    initializeRoute(domain);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const isEnabled = soundFx.toggleSound();
    setSoundEnabled(isEnabled);
  };

  // Tracing Step Engine Effect
  useEffect(() => {
    if (status !== 'tracing') return;

    if (activeHopIndex >= 0 && activeHopIndex < hops.length) {
      // Play ping audio for current hop
      const currentHop = hops[activeHopIndex];
      if (currentHop) {
        soundFx.playHopPing(activeHopIndex + 1, currentHop.latency);
      }

      timerRef.current = setTimeout(() => {
        if (activeHopIndex + 1 < hops.length) {
          setActiveHopIndex(prev => prev + 1);
        } else {
          // Tracing complete
          setStatus('completed');
          soundFx.playComplete();
        }
      }, traceSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status, activeHopIndex, hops, traceSpeed]);

  // Cumulative total latency calculation
  const totalLatency = hops
    .slice(0, status === 'completed' ? hops.length : Math.max(0, activeHopIndex + 1))
    .reduce((acc, h) => acc + h.latency, 0);

  // Progress percentage
  const progressPercent =
    status === 'completed'
      ? 100
      : status === 'tracing' && activeHopIndex >= 0
      ? Math.round(((activeHopIndex + 1) / hops.length) * 100)
      : 0;

  return (
    <div className="relative min-h-screen bg-[#050814] text-slate-100 font-rajdhani flex flex-col overflow-x-hidden scanlines">
      {/* Background Animated Map Canvas */}
      <NetworkMapCanvas
        hops={hops}
        activeHopIndex={activeHopIndex}
        isTracing={status === 'tracing'}
        isCompleted={status === 'completed'}
      />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 tracking-wider">
              INTERNET ROUTE VISUALIZER
            </h1>
            <p className="text-xs font-mono-code text-cyan-300/70 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>PACKET TRACER & ICMP NETWORK TOPOLOGY ENGINE</span>
            </p>
          </div>
        </div>

        {/* Status Badge & Audio Toggle */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Status Indicator */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-orbitron font-bold flex items-center space-x-2 border transition-all ${
              status === 'completed'
                ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                : status === 'tracing'
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/80 animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'completed'
                  ? 'bg-emerald-400'
                  : status === 'tracing'
                  ? 'bg-cyan-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {status === 'completed'
                ? 'COMPLETED'
                : status === 'tracing'
                ? 'TRACING...'
                : 'WAITING'}
            </span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs font-mono-code flex items-center space-x-1.5 transition-all ${
              soundEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
            title="Toggle Audio Effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Domain Input Bar & Controls */}
        <div className="glass-panel-cyan rounded-2xl p-4 lg:p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Input Box */}
            <div className="flex-1">
              <label className="block text-xs font-orbitron text-cyan-300 font-bold mb-1.5 tracking-wider">
                TARGET DOMAIN / HOSTNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={inputDomain}
                  onChange={e => setInputDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStartTrace()}
                  placeholder="Enter domain (e.g., google.com, github.com)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-cyan-500/40 rounded-xl text-slate-100 font-mono-code text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2 lg:pt-5">
              <button
                onClick={handleStartTrace}
                disabled={status === 'tracing'}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-sm tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START TRACE</span>
              </button>

              <button
                onClick={handleRestart}
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-orbitron font-bold text-sm tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer hover:border-cyan-500/50"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>RESTART</span>
              </button>
            </div>
          </div>

          {/* Quick Domain Presets */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-code text-slate-400 mr-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRESETS:</span>
            </span>
            {DOMAIN_PRESETS.map(preset => (
              <button
                key={preset.domain}
                onClick={() => handleSelectPreset(preset.domain)}
                className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all border ${
                  activeDomain === preset.domain
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400/80 shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset.domain}
              </button>
            ))}
          </div>
        </div>

        {/* Progress & Route Overview Bar */}
        <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Target Info */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono-code text-cyan-400 font-bold tracking-wide">
                ROUTE TO: <span className="text-white text-sm">{activeDomain}</span>
              </p>
              <p className="text-xs font-mono-code text-slate-400">
                RESOLVED TARGET IP: <span className="text-emerald-400 font-semibold">{resolvedIp}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Numbers */}
          <div className="flex items-center space-x-6 w-full md:w-auto justify-around md:justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
            <div className="text-center">
              <span className="block text-[10px] font-orbitron text-slate-400">TOTAL HOPS</span>
              <span className="text-lg font-orbitron font-bold text-cyan-300 text-glow-cyan">
                {hops.length}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-center">
              <span className="block text-[10px] font-orbitron text-slate-400">TOTAL LATENCY</span>
              <span className="text-lg font-mono-code font-bold text-emerald-400 text-glow-green">
                {totalLatency} ms
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-center min-w-[80px]">
              <span className="block text-[10px] font-orbitron text-slate-400">PROGRESS</span>
              <span className="text-lg font-orbitron font-bold text-purple-300 text-glow-purple">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_#00f3ff]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Glowing Success Message Banner when Tracing Completed */}
        {status === 'completed' && (
          <div className="glass-panel-green rounded-2xl p-4 border border-emerald-400/80 flex items-center justify-between shadow-[0_0_30px_rgba(0,255,157,0.3)] animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-orbitron font-extrabold text-emerald-300 text-glow-green">
                  Trace Completed Successfully
                </h3>
                <p className="text-xs text-slate-300 font-rajdhani">
                  Packet reached destination host <span className="font-mono-code text-emerald-300">{activeDomain}</span> ({resolvedIp}) across {hops.length} network hops with total latency of {totalLatency} ms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Node Packet Visualizer Diagram */}
        <div className="glass-panel rounded-2xl p-4 lg:p-6 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-orbitron font-bold text-slate-200 tracking-wider">
                PACKET TRAVEL TOPOLOGY MAP
              </h2>
            </div>
            <span className="text-xs font-mono-code text-slate-400">
              Click any node to inspect telemetry
            </span>
          </div>

          <PacketVisualizer
            hops={hops}
            activeHopIndex={activeHopIndex}
            isTracing={status === 'tracing'}
            isCompleted={status === 'completed'}
            selectedHopId={selectedHop?.id || null}
            onSelectHop={hop => setSelectedHop(hop)}
          />
        </div>

        {/* Hop Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-orbitron font-bold text-slate-300 tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>NETWORK HOP NODES ({hops.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hops.map((hop, index) => {
              const isCompletedHop = index < activeHopIndex || status === 'completed';
              const isCurrentHop = status === 'tracing' && index === activeHopIndex;

              return (
                <HopCard
                  key={hop.id}
                  hop={hop}
                  isCurrentHop={isCurrentHop}
                  isCompletedHop={isCompletedHop}
                  isSelected={selectedHop?.id === hop.id}
                  onSelect={selected => setSelectedHop(selected)}
                />
              );
            })}
          </div>
        </div>

        {/* Lower Tools: CLI Terminal & Packet Header Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Traceroute Terminal */}
          <TracerouteTerminal
            domain={activeDomain}
            resolvedIp={resolvedIp}
            hops={hops}
            activeHopIndex={activeHopIndex}
            isTracing={status === 'tracing'}
            isCompleted={status === 'completed'}
            totalLatency={totalLatency}
          />

          {/* Packet Header Inspector */}
          <PacketInspector
            currentHop={
              activeHopIndex >= 0 && activeHopIndex < hops.length
                ? hops[activeHopIndex]
                : null
            }
            targetDomain={activeDomain}
            targetIp={resolvedIp}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-4 px-6 text-center text-xs font-mono-code text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cyberpunk Internet Route Visualizer v2.4</span>
          </div>
          <p className="text-slate-400">
            Simulating BGP Peering, ICMP Echo Requests & Edge Hop Telemetry
          </p>
        </div>
      </footer>

      {/* Hop Detail Modal */}
      <HopDetailModal hop={selectedHop} onClose={() => setSelectedHop(null)} />
    </div>
  );
}
