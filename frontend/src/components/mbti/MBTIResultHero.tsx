'use client';

import { MBTIResult } from '@/lib/api';
import { Card } from '@/components/ui/card';

export function MBTIResultHero({ result }: { result: MBTIResult }) {
  return (
    <Card variant="glow" className="rounded-[30px] p-8 lg:p-10 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(184,149,110,0.12),transparent_25%),radial-gradient(circle_at_0%_100%,rgba(121,97,159,0.14),transparent_30%)]" />
      <div className="relative z-10">
        <div className="luxury-metadata text-[10px] mb-4">MBTI Result</div>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-semibold text-parchment-100 tracking-[-0.04em]">{result.personality_type}</h1>
          <div className="pb-2">
            <div className="text-xl text-parchment-100 font-medium">{result.type_name_zh}</div>
            <div className="text-copy-muted">{result.type_name_en}</div>
          </div>
        </div>
        <p className="text-lg text-copy-muted leading-8 max-w-3xl">{result.summary}</p>
      </div>
    </Card>
  );
}

export default MBTIResultHero;
