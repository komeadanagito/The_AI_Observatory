'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/auth';
import { tarotApi, ReadingHistoryItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isReady, isLoading: authLoading } = useRequireAuth();

  // 获取历史记录
  const { data, isLoading, error } = useQuery({
    queryKey: ['tarot-history'],
    queryFn: () => tarotApi.getHistory(1, 50),
    enabled: isReady,
  });

  // 删除记录
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tarotApi.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarot-history'] });
    },
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      deleteMutation.mutate(id);
    }
  };

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
            <Link href="/tarot" className="flex items-center space-x-2">
              <span className="text-xl">←</span>
              <span className="text-white">返回塔罗牌</span>
            </Link>
            
            <Link href="/tarot">
              <Button size="sm">新的占卜</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            占卜历史
          </h1>
          <p className="text-gray-400">
            查看你过去的塔罗牌解读记录
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-float">📜</div>
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">加载失败，请稍后重试</p>
          </div>
        ) : !data?.readings?.length ? (
          <Card className="text-center py-16">
            <div className="text-4xl mb-4">🔮</div>
            <p className="text-gray-400 mb-6">还没有占卜记录</p>
            <Link href="/tarot">
              <Button>开始第一次占卜</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.readings.map((reading: ReadingHistoryItem, index: number) => (
              <motion.div
                key={reading.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className="cursor-pointer"
                  onClick={() => router.push(`/tarot/history/${reading.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">🃏</span>
                        <h3 className="text-lg font-semibold text-white">
                          {reading.spread_name_zh}
                        </h3>
                        <span className="text-sm text-gray-500 bg-dark-700 px-2 py-0.5 rounded">
                          {reading.cards_count} 张牌
                        </span>
                      </div>
                      
                      {reading.question && (
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          问题：{reading.question}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formatDate(reading.created_at)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-400"
                      onClick={(e) => handleDelete(reading.id, e)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {data && data.total > 50 && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              显示最近 50 条记录，共 {data.total} 条
            </p>
          </div>
        )}
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
