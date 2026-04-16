'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

type AmbientParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
};

function createParticles(count: number): AmbientParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 18 + 18,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.18 + 0.06,
    driftX: (Math.random() - 0.5) * 40,
    driftY: (Math.random() - 0.5) * 36 - 12,
  }));
}

export function AmbientBackground() {
  const pathname = usePathname();
  const isFeaturePage = pathname === '/' || pathname.startsWith('/tarot');
  const particleCount = isFeaturePage ? 12 : 7;

  const particles = useMemo(() => createParticles(particleCount), [particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,_rgba(110,84,148,0.18),_transparent_28%),radial-gradient(circle_at_82%_18%,_rgba(184,149,110,0.08),_transparent_18%),radial-gradient(circle_at_60%_72%,_rgba(37,50,83,0.14),_transparent_24%),linear-gradient(180deg,_rgba(7,10,18,0.98),_rgba(10,13,22,0.98))]" />

      <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_18%_30%,_rgba(122,107,145,0.16),_transparent_16%),radial-gradient(circle_at_74%_18%,_rgba(184,149,110,0.10),_transparent_12%),radial-gradient(circle_at_55%_82%,_rgba(83,96,140,0.10),_transparent_16%)] animate-[ambientGlow_22s_ease-in-out_infinite]" />
      <div className="absolute inset-0 subtle-grid" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `rgba(229, 223, 214, ${particle.opacity})`,
            boxShadow: `0 0 ${particle.size * 7}px rgba(166, 140, 197, ${particle.opacity * 0.5})`,
            animation: `ambientFloat-${particle.id} ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes ambientGlow {
          0%, 100% {
            opacity: 0.32;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.03);
          }
        }

        ${particles
          .map(
            (particle) => `
          @keyframes ambientFloat-${particle.id} {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: ${particle.opacity};
            }
            50% {
              transform: translate3d(${particle.driftX}px, ${particle.driftY}px, 0) scale(1.15);
              opacity: ${Math.min(particle.opacity * 1.35, 0.32)};
            }
          }
        `,
          )
          .join('\n')}
      `}</style>
    </div>
  );
}

export default AmbientBackground;
