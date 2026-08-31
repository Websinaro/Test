import React, { useEffect, useRef, useState } from 'react';

interface AmbientBackgroundProps {
  mode?: 'grid-particles' | 'ambient-mesh' | 'minimal';
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  mode = 'grid-particles',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes configuration
    const particleCount = Math.min(Math.floor(width / 35), 45);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      color: string;
    }> = [];

    const colors = ['rgba(59, 130, 246, ', 'rgba(99, 102, 241, ', 'rgba(14, 165, 233, '];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.4 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle ambient glowing orbs
      const orb1X = width * 0.2 + Math.sin(time * 0.5) * 80;
      const orb1Y = height * 0.25 + Math.cos(time * 0.6) * 60;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 320);
      grad1.addColorStop(0, 'rgba(59, 130, 246, 0.06)');
      grad1.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.8 + Math.cos(time * 0.4) * 90;
      const orb2Y = height * 0.7 + Math.sin(time * 0.7) * 70;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 380);
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
      grad2.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Interactive Particles & Linking Lines
      if (mode !== 'minimal') {
        // Draw connection lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              const lineAlpha = (1 - dist / 120) * 0.12;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Gentle mouse repulsion / attraction
          const mdx = mousePos.x - p.x;
          const mdy = mousePos.y - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < 140 && mDist > 0) {
            const force = (1 - mDist / 140) * 0.8;
            p.x -= (mdx / mDist) * force;
            p.y -= (mdy / mDist) * force;
          }

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.baseAlpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Precision Technical Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Interactive Spotlight Follower */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/[0.04] blur-[120px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
        }}
      />

      {/* 3. High-Performance Canvas for Dynamic Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 4. Top and Bottom Soft Vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40" />
    </div>
  );
};
