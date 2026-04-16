'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { mbtiApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { FullscreenLoader } from '@/components/ui/FullscreenLoader';
import { MBTIResultHero } from '@/components/mbti/MBTIResultHero';
import { MBTIResultSections } from '@/components/mbti/MBTIResultSections';

export default function MBTIResultPage() {
  const params = useParams();
  const { isReady, isLoading: authLoading } = useRequireAuth();
  const sessionId = params.sessionId as string;

  const resultQuery = useQuery({
    queryKey: ['mbti-result', sessionId],
    queryFn: () => mbtiApi.getResult(sessionId),
    enabled: isReady && !!sessionId,
  });

  if (authLoading || resultQuery.isLoading) {
    return <FullscreenLoader label="正在展开 MBTI 人格画像..." />;
  }

  if (!isReady) {
    return null;
  }

  if (!resultQuery.data) {
    return (
      <div className="min-h-screen pt-28 px-5 text-center text-copy-muted">
        <p className="mb-4">MBTI 结果暂不可用。</p>
        <Link href="/mbti"><Button>返回 MBTI 入口</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-5 sm:px-8 lg:px-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link href="/mbti" className="text-copy-muted hover:text-parchment-100 transition-colors">← 返回 MBTI</Link>
        <Link href="/mbti"><Button variant="outline">再测一次</Button></Link>
      </div>

      <div className="grid gap-6">
        <MBTIResultHero result={resultQuery.data} />
        <MBTIResultSections result={resultQuery.data} />
      </div>
    </div>
  );
}
