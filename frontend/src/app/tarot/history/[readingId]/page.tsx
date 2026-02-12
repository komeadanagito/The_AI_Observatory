'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/auth';
import { tarotApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TarotCardDisplay } from '@/components/tarot/card-display';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isLoading: authLoading } = useRequireAuth();
  
  const readingId = params.readingId as string;

  // 获取记录详情
  const { data, isLoading, error } = useQuery({
    queryKey: ['tarot-history', readingId],
    queryFn: () => tarotApi.getHistoryDetail(readingId),
    enabled: isReady && !!readingId,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔮</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/tarot/history" className="flex items-center space-x-2">
              <span className="text-xl">←</span>
              <span className="text-white">返回历史</span>
            </Link>
            
            <Link href="/tarot">
              <Button size="sm">新的占卜</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        {/* 免责声明 */}
        <div className="disclaimer rounded-lg mb-8">
          ⚠️ {data?.disclaimer || '本内容纯属娱乐参考，不构成任何预测、建议或决策依据。'}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-float">📜</div>
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">加载失败，记录可能已被删除</p>
            <Button onClick={() => router.push('/tarot/history')}>
              返回历史列表
            </Button>
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 标题 */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {data.spread_name_zh}
              </h1>
              <p className="text-gray-500 text-sm">
                {formatDate(data.created_at)}
              </p>
            </div>

            {/* 问题 */}
            {data.question && (
              <Card className="mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">❓</span>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">问题</p>
                    <p className="text-white">{data.question}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 塔罗牌 */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🃏</span> 抽到的牌
              </h3>
              <TarotCardDisplay
                cards={data.cards}
                positions={data.positions}
                showCards={true}
              />
            </Card>

            {/* 解读内容 */}
            <Card variant="bordered">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-600">
                <span className="text-xl">🔮</span>
                <h2 className="text-xl font-semibold text-white">AI 解读</h2>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {data.interpretation}
                </div>
              </div>
            </Card>

            {/* 操作按钮 */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => router.push('/tarot/history')}
              >
                返回列表
              </Button>
              <Button onClick={() => router.push('/tarot')}>
                新的占卜
              </Button>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
