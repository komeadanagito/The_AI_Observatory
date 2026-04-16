'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/auth';
import { mbtiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FullscreenLoader } from '@/components/ui/FullscreenLoader';

export default function MBTILandingPage() {
  const router = useRouter();
  const { isReady, isLoading: authLoading } = useRequireAuth();

  const startMutation = useMutation({
    mutationFn: () => mbtiApi.startSession(),
    onSuccess: (data) => {
      router.push(`/mbti/session/${data.session_id}`);
    },
  });

  if (authLoading) {
    return <FullscreenLoader label="正在进入 MBTI 会话空间..." />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-5 sm:px-8 lg:px-10 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
        <div>
          <div className="luxury-metadata text-xs mb-4">MBTI Personality Portrait</div>
          <h1 className="text-5xl md:text-6xl font-semibold leading-[1.04] tracking-[-0.04em] text-parchment-100 mb-6">
            一场 8-12 题的动态问答，
            <span className="block bg-[linear-gradient(90deg,#f1e2c2,#b8956e,#8d75a8)] bg-clip-text text-transparent">让人格结构慢慢浮现。</span>
          </h1>
          <p className="text-lg text-copy-muted leading-8 max-w-2xl mb-8">
            这不是一次机械量表，而是一段边问边调整的会话。系统会依据你的回答继续提问，并在信息足够时停止。
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Button size="lg" onClick={() => startMutation.mutate()} isLoading={startMutation.isPending}>开始 MBTI 测试</Button>
            <div className="luxury-panel-soft rounded-full px-4 py-3 text-sm text-copy-muted">动态题量：8-12 题</div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-copy-muted">
            <span>逐题问答</span>
            <span className="w-1 h-1 rounded-full bg-[#b8956e]/55" />
            <span>支持中断恢复</span>
            <span className="w-1 h-1 rounded-full bg-[#b8956e]/55" />
            <span>生成完整人格画像</span>
          </div>
        </div>

        <Card variant="glow" className="rounded-[30px] p-8 lg:p-10">
          <div className="luxury-metadata text-[10px] mb-4">结果将包含</div>
          <div className="grid gap-4 text-copy-muted">
            {['16 型人格类型判断', '认知功能栈', '优势与盲点', '职业匹配建议', '关系互动建议'].map((item) => (
              <div key={item} className="luxury-panel-soft rounded-[20px] px-4 py-4">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
