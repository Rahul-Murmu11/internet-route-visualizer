import React, { useEffect, useRef } from 'react';
import { HopNode } from '../types';

interface NetworkMapCanvasProps {
  hops: HopNode[];
  activeHopIndex: number;
  isTracing: boolean;
  isCompleted: boolean;
}

export const NetworkMapCanvas: React.FC<NetworkMapCanvasProps> = ({
  hops,
  activeHopIndex,
  isTracing,
  isCompleted
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle background state
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 400),
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    let packetProgress = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle Cyberpunk Grid Lines
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw floating particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = `rgba(0, 243, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Calculate node coordinates on canvas
      const nodeCoords = hops.map((hop, idx) => {
        const xPct = 12 + (idx / Math.max(1, hops.length - 1)) * 76;
        const yPct = 40 + Math.sin(idx * 1.2) * 18;
        return {
          x: (xPct / 100) * w,
          y: (yPct / 100) * h,
          hop,
          idx
        };
      });

      // Draw connecting glowing curved arcs between hops
      for (let i = 0; i < nodeCoords.length - 1; i++) {
        const curr = nodeCoords[i];
        const next = nodeCoords[i + 1];

        const isConnectionDone = i < activeHopIndex || isCompleted;
        const isConnectionActive = isTracing && i === activeHopIndex;

        ctx.beginPath();
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2 - 25; // Curve up
        ctx.moveTo(curr.x, curr.y);
        ctx.quadraticCurveTo(midX, midY, next.x, next.y);

        if (isConnectionDone) {
          ctx.strokeStyle = 'rgba(0, 255, 157, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00ff9d';
          ctx.shadowBlur = 10;
        } else if (isConnectionActive) {
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Draw animated glowing packet traveling along the active connection
      if (isTracing && activeHopIndex < nodeCoords.length - 1) {
        packetProgress = (packetProgress + 0.035) % 1;
        const start = nodeCoords[activeHopIndex];
        const end = nodeCoords[activeHopIndex + 1];

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - 25;

        // Quadratic bezier interpolation
        const t = packetProgress;
        const px = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midX + t * t * end.x;
        const py = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * midY + t * t * end.y;

        // Outer glow aura
        ctx.fillStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#00ff9d';
        ctx.shadowColor = '#00ff9d';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw node dots on canvas
      nodeCoords.forEach(({ x, y, hop, idx }) => {
        const isDone = idx < activeHopIndex || isCompleted;
        const isActive = isTracing && idx === activeHopIndex;

        // Pulse ring if active
        if (isActive) {
          const time = Date.now() / 300;
          const radius = 12 + Math.sin(time) * 4;
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, isDone ? 7 : isActive ? 8 : 5, 0, Math.PI * 2);

        if (isDone) {
          ctx.fillStyle = '#00ff9d';
          ctx.shadowColor = '#00ff9d';
          ctx.shadowBlur = 12;
        } else if (isActive) {
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw hop number text above node
        ctx.fillStyle = isDone ? '#00ff9d' : isActive ? '#00f3ff' : '#94a3b8';
        ctx.font = '10px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`HOP ${hop.hopNumber}`, x, y - 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hops, activeHopIndex, isTracing, isCompleted]);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-60">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
