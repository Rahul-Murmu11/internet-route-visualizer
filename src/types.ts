export type HopType = 'laptop' | 'router' | 'isp' | 'ixp' | 'destination_net' | 'destination_server';

export type TraceStatus = 'waiting' | 'tracing' | 'completed' | 'paused';

export interface HopNode {
  id: number;
  hopNumber: number;
  name: string;
  type: HopType;
  ip: string;
  hostname: string;
  location: string;
  asn: string;
  latency: number; // in ms (5-60 ms)
  rtt1: number;
  rtt2: number;
  rtt3: number;
  status: 'pending' | 'tracing' | 'completed' | 'loss';
  packetLoss: number; // percentage
  ttl: number;
  iconName: string;
  coords: { x: number; y: number }; // percentage coords on world map
  description: string;
}

export interface DomainPreset {
  domain: string;
  name: string;
  ip: string;
  location: string;
  icon: string;
  category: string;
}
