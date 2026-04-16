'use client';

import { MBTIResult } from '@/lib/api';
import { Card } from '@/components/ui/card';

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card variant="bordered" className="rounded-[24px] p-6">
      <div className="luxury-metadata text-[10px] mb-3">{title}</div>
      <ul className="space-y-3 text-copy-muted leading-7">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="text-[#b8956e]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function MBTIResultSections({ result }: { result: MBTIResult }) {
  return (
    <div className="grid gap-6">
      <Card variant="default" className="rounded-[24px] p-6">
        <div className="luxury-metadata text-[10px] mb-3">认知功能</div>
        <div className="flex flex-wrap gap-3">
          {result.cognitive_functions.map((item) => (
            <span key={item} className="luxury-panel-soft rounded-full px-4 py-2 text-sm text-parchment-100">{item}</span>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <ResultList title="优势" items={result.strengths} />
        <ResultList title="盲点" items={result.weaknesses} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ResultList title="职业匹配" items={result.career_matches} />
        <Card variant="bordered" className="rounded-[24px] p-6">
          <div className="luxury-metadata text-[10px] mb-3">关系建议</div>
          <p className="text-copy-muted leading-8">{result.relationship_advice}</p>
        </Card>
      </div>
    </div>
  );
}

export default MBTIResultSections;
