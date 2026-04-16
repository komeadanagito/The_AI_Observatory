'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mbtiApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { FullscreenLoader } from '@/components/ui/FullscreenLoader';
import { MBTIProgress } from '@/components/mbti/MBTIProgress';
import { MBTIQuestionCard } from '@/components/mbti/MBTIQuestionCard';

export default function MBTISessionPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isLoading: authLoading } = useRequireAuth();
  const sessionId = params.sessionId as string;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['mbti-session', sessionId],
    queryFn: () => mbtiApi.resumeSession(sessionId),
    enabled: isReady && !!sessionId,
  });

  const answerMutation = useMutation({
    mutationFn: () => {
      const question = sessionQuery.data?.current_question;
      if (!question || !selectedOption) {
        throw new Error('请选择一个答案');
      }

      return mbtiApi.submitAnswer(sessionId, question.question_id, selectedOption);
    },
    onSuccess: (data) => {
      setSelectedOption(null);
      if (data.status === 'completed') {
        router.push(`/mbti/result/${sessionId}`);
        return;
      }
      sessionQuery.refetch();
    },
  });

  const currentQuestion = sessionQuery.data?.current_question ?? null;

  const errorMessage = useMemo(() => {
    if (sessionQuery.error instanceof Error) {
      return sessionQuery.error.message;
    }
    if (answerMutation.error instanceof Error) {
      return answerMutation.error.message;
    }
    return null;
  }, [answerMutation.error, sessionQuery.error]);

  if (authLoading || sessionQuery.isLoading) {
    return <FullscreenLoader label="正在恢复 MBTI 测试进度..." />;
  }

  if (!isReady) {
    return null;
  }

  if (sessionQuery.data?.status === 'completed') {
    router.replace(`/mbti/result/${sessionId}`);
    return null;
  }

  if (!currentQuestion || !sessionQuery.data) {
    return (
      <div className="min-h-screen pt-28 px-5 text-center text-copy-muted">
        <p className="mb-4">当前没有可继续的 MBTI 会话。</p>
        <Link href="/mbti"><Button>返回 MBTI 入口</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-5 sm:px-8 lg:px-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link href="/mbti" className="text-copy-muted hover:text-parchment-100 transition-colors">← 返回 MBTI</Link>
        <span className="luxury-metadata text-[10px]">Session {sessionId.slice(0, 8)}</span>
      </div>

      <div className="grid gap-6">
        <MBTIProgress progress={sessionQuery.data.progress} />
        <MBTIQuestionCard
          question={currentQuestion}
          selectedOption={selectedOption}
          isSubmitting={answerMutation.isPending}
          onSelect={setSelectedOption}
          onSubmit={() => answerMutation.mutate()}
        />
        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
