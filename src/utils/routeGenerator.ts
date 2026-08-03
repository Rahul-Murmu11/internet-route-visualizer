import { DomainPreset, HopNode } from '../types';

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    domain: 'google.com',
    name: 'Google Infrastructure',
    ip: '142.250.190.46',
    location: 'Mountain View, California, US',
    icon: 'Globe',
    category: 'Search & Cloud'
  },
  {
    domain: 'cloudflare.com',
    name: 'Cloudflare Edge CDN',
    ip: '104.16.132.229',
    location: 'San Francisco, California, US',
    icon: 'ShieldCheck',
    category: 'Cybersecurity & Anycast'
  },
  {
    domain: 'github.com',
    name: 'GitHub / Microsoft Cloud',
    ip: '140.82.121.4',
    location: 'Seattle, Washington, US',
    icon: 'GitBranch',
    category: 'Developer Platform'
  },
  {
    domain: 'wikipedia.org',
    name: 'Wikimedia Foundation',
    ip: '208.80.154.224',
    location: 'Ashburn, Virginia, US',
    icon: 'BookOpen',
    category: 'Global Knowledge Network'
  },
  {
    domain: 'netflix.com',
    name: 'Netflix Open Connect',
    ip: '54.237.226.164',
    location: 'San Jose, California, US',
    icon: 'Tv',
    category: 'Media Streaming Backbone'
  },
  {
    domain: 'nasa.gov',
    name: 'NASA Goddard Space Center',
    ip: '198.118.243.33',
    location: 'Greenbelt, Maryland, US',
    icon: 'Rocket',
    category: 'Government & Aerospace'
  }
];

// Helper to calculate a deterministic string hash for custom domains
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function cleanDomainInput(rawInput: string): string {
  let cleaned = rawInput.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/^www\./, '');
  return cleaned || 'google.com';
}

export function generateResolvedIp(domain: string): string {
  const preset = DOMAIN_PRESETS.find(p => p.domain === domain);
  if (preset) return preset.ip;

  const hash = hashString(domain);
  const octet1 = 100 + (hash % 120);
  const octet2 = (hash >> 3) % 250;
  const octet3 = (hash >> 6) % 250;
  const octet4 = 1 + ((hash >> 9) % 250);
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

export function generateHopsForDomain(rawDomain: string): HopNode[] {
  const domain = cleanDomainInput(rawDomain);
  const destIp = generateResolvedIp(domain);
  const hash = hashString(domain);

  // Helper to get realistic latency between 5 and 60 ms
  const getRandomLatency = (min: number, max: number, seedOffset: number) => {
    const pseudoRand = ((hash + seedOffset * 17) % 100) / 100;
    const base = min + Math.floor(pseudoRand * (max - min + 1));
    // Bound strictly within 5 - 60 ms
    return Math.min(60, Math.max(5, base));
  };

  const lat1 = getRandomLatency(5, 12, 1);
  const lat2 = getRandomLatency(10, 22, 2);
  const lat3 = getRandomLatency(18, 35, 3);
  const lat4 = getRandomLatency(25, 45, 4);
  const lat5 = getRandomLatency(32, 52, 5);
  const lat6 = getRandomLatency(38, 60, 6);

  const cityList = [
    'New York, NY, US',
    'Frankfurt, Germany',
    'Amsterdam, Netherlands',
    'Tokyo, Japan',
    'London, UK',
    'Singapore'
  ];
  const destCity = cityList[hash % cityList.length];

  return [
    {
      id: 1,
      hopNumber: 1,
      name: 'Client Workstation',
      type: 'laptop',
      ip: '192.168.1.105',
      hostname: 'cybernaut-local.lan',
      location: 'Local Workstation (Host)',
      asn: 'AS-LOCAL (Client Node)',
      latency: lat1,
      rtt1: lat1 - 1,
      rtt2: lat1,
      rtt3: lat1 + 1,
      status: 'pending',
      packetLoss: 0,
      ttl: 64,
      iconName: 'Laptop',
      coords: { x: 15, y: 65 },
      description: 'Your local physical hardware interface. Generates ICMP Echo request frames.'
    },
    {
      id: 2,
      hopNumber: 2,
      name: 'Local Fiber Gateway',
      type: 'router',
      ip: '192.168.1.1',
      hostname: 'gateway.home.arpa',
      location: 'Home / LAN Router',
      asn: 'AS-PRIVATE (Intranet)',
      latency: lat2,
      rtt1: lat2 - 1,
      rtt2: lat2,
      rtt3: lat2 + 2,
      status: 'pending',
      packetLoss: 0,
      ttl: 63,
      iconName: 'Router',
      coords: { x: 28, y: 48 },
      description: 'Default gateway router performing NAT translation and ARP lookup for external WAN routing.'
    },
    {
      id: 3,
      hopNumber: 3,
      name: 'Regional ISP Edge POP',
      type: 'isp',
      ip: `10.${(hash % 200) + 10}.18.4`,
      hostname: `edge-pop-${(hash % 9) + 1}.isp-broadband.net`,
      location: 'Metro Aggregation Node',
      asn: `AS${7018 + (hash % 100)} Telecom Aggregation`,
      latency: lat3,
      rtt1: lat3 - 2,
      rtt2: lat3,
      rtt3: lat3 + 1,
      status: 'pending',
      packetLoss: 0,
      ttl: 62,
      iconName: 'Server',
      coords: { x: 42, y: 35 },
      description: 'Internet Service Provider regional Point of Presence handling fiber optical multiplexing.'
    },
    {
      id: 4,
      hopNumber: 4,
      name: 'Internet Exchange Point (IXP)',
      type: 'ixp',
      ip: `198.32.${(hash % 100) + 10}.12`,
      hostname: `core-ixp-equinix.${domain.split('.')[0] || 'net'}.org`,
      location: 'Tier-1 Core Exchange',
      asn: `AS${3356 + (hash % 500)} Lumen / Equinix Exchange`,
      latency: lat4,
      rtt1: lat4 - 1,
      rtt2: lat4 + 2,
      rtt3: lat4 - 1,
      status: 'pending',
      packetLoss: 0,
      ttl: 61,
      iconName: 'Globe',
      coords: { x: 58, y: 55 },
      description: 'High-speed global peering exchange connecting Tier-1 international backbones and BGP routes.'
    },
    {
      id: 5,
      hopNumber: 5,
      name: 'Destination Cloud Edge',
      type: 'destination_net',
      ip: `172.${(hash % 16) + 16}.${(hash % 200) + 1}.206`,
      hostname: `anycast-ingress.${domain}`,
      location: destCity,
      asn: `AS${15169 + (hash % 2000)} ${domain.toUpperCase()} Anycast Edge`,
      latency: lat5,
      rtt1: lat5 - 2,
      rtt2: lat5,
      rtt3: lat5 + 1,
      status: 'pending',
      packetLoss: 0,
      ttl: 60,
      iconName: 'Cloud',
      coords: { x: 74, y: 38 },
      description: 'Edge security reverse proxy, DDoS mitigation, and load balancer receiving destination packets.'
    },
    {
      id: 6,
      hopNumber: 6,
      name: 'Destination Web Cluster',
      type: 'destination_server',
      ip: destIp,
      hostname: `web-node-01.${domain}`,
      location: `${destCity} (Data Center)`,
      asn: `AS-TARGET (${domain.toUpperCase()} Cluster)`,
      latency: lat6,
      rtt1: lat6 - 1,
      rtt2: lat6 + 1,
      rtt3: lat6,
      status: 'pending',
      packetLoss: 0,
      ttl: 59,
      iconName: 'Database',
      coords: { x: 88, y: 62 },
      description: `Target HTTP/3 web application server node serving target responses for ${domain}.`
    }
  ];
}
