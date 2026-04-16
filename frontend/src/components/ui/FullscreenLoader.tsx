'use client';

import { CrystalBallIcon } from '@/components/icons/MysticIcons';

interface FullscreenLoaderProps {
  label?: string;
}

export function FullscreenLoader({ label = '正在校准神谕空间...' }: FullscreenLoaderProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[linear-gradient(180deg,#090b12_0%,#0b0e16_45%,#0d1018_100%)] text-parchment-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(92,74,130,0.16)_0%,transparent_36%),radial-gradient(circle_at_82%_12%,rgba(184,149,110,0.08)_0%,transparent_20%),radial-gradient(circle_at_72%_74%,rgba(33,42,68,0.24)_0%,transparent_30%)]" />
      <div className="absolute inset-0 subtle-grid opacity-25" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="luxury-panel rounded-[28px] px-10 py-12 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[#b8956e]/20 bg-[radial-gradient(circle_at_35%_35%,rgba(184,149,110,0.22),rgba(38,31,24,0.92))] flex items-center justify-center shadow-[0_0_30px_rgba(184,149,110,0.10)]">
            <CrystalBallIcon size={28} className="text-[#e8d7be]" animated />
          </div>
          <div className="luxury-metadata text-[10px] mb-3">Preparing private ritual</div>
          <p className="text-lg text-parchment-100 mb-2">{label}</p>
          <p className="text-sm text-copy-muted">请稍候，正在确认你的会话与占卜状态。</p>
        </div>
      </div>
    </div>
  );
}

export default FullscreenLoader;
