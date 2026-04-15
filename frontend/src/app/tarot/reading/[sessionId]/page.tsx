'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/lib/auth';
import { tarotApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ParchmentTexture } from '@/components/effects/ParchmentTexture';
import { RevealOnScroll } from '@/components/effects/RevealOnScroll';
import { MysticDivider } from '@/components/ui/MysticFrame';
import { CrystalBallIcon, BackArrowIcon, LoadingIcon } from '@/components/icons/MysticIcons';

export default function ReadingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isReady, isLoading: authLoading } = useRequireAuth();
  
  const sessionId = params.sessionId as string;
  const question = searchParams.get('question') || undefined;
  
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 防止重复请求的标记
  const fetchingRef = useRef(false);
  const hasStartedRef = useRef(false);

  // 获取 AI 解读（流式）
  useEffect(() => {
    // 防止 React 严格模式下的重复请求
    if (!sessionId || !isReady) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const fetchInterpretation = async () => {
      // 如果已经在请求中，跳过
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      setIsLoading(true);
      setError(null);
      setInterpretation('');

      try {
        const response = await tarotApi.interpret(sessionId, question);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || '获取解读失败');
        }

        // 检查是否是缓存结果（非流式）
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          setInterpretation(data.interpretation);
          setIsComplete(true);
          setIsLoading(false);
          return;
        }

        // 流式处理
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('无法读取响应流');
        }

        let streamDone = false;
        
        while (!streamDone) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsComplete(true);
            setIsLoading(false);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            // 跳过事件类型行
            if (line.startsWith('event:')) continue;
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              
              try {
                const data = JSON.parse(dataStr);
                
                // 检查是否完成
                if (data.done) {
                  streamDone = true;
                  setIsComplete(true);
                  setIsLoading(false);
                  break;
                }
                
                // 追加内容
                if (data.content) {
                  setInterpretation((prev) => prev + data.content);
                }
              } catch {
                // 忽略无法解析的数据（如空行）
              }
            }
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '获取解读失败，请稍后重试');
        setIsLoading(false);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchInterpretation();
    
    // 清理函数：组件卸载时允许下次重新请求
    return () => {
      // 不重置 hasStartedRef，避免严格模式下重复执行
    };
  }, [sessionId, isReady]); // 移除 question 依赖，避免 URL 参数变化触发重新请求

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current && !isComplete) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [interpretation, isComplete]);

  // 等待认证状态确定
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingIcon size={48} className="text-gold-500/70 mx-auto mb-4" />
          <p className="text-parchment-400">加载中...</p>
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
            <Link href="/tarot" className="flex items-center space-x-2 text-parchment-300 hover:text-parchment-100 transition-colors">
              <BackArrowIcon size={20} className="text-gold-500/70" />
              <span>返回塔罗牌</span>
            </Link>
            
            <Link href="/tarot/history">
              <Button variant="ghost" size="sm">历史记录</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        {/* 问题 - 使用羊皮纸风格 */}
        {question && (
          <RevealOnScroll effect="fadeUp" duration={0.6}>
            <Card className="mb-6 border-brass-antique bg-dark-800/40">
              <div className="flex items-start gap-3">
                <span className="text-xl text-gold-500/70">✧</span>
                <div>
                  <p className="text-sm text-gold-500/60 mb-1 font-mystic">你的问题</p>
                  <p className="text-parchment-200 font-serif">{question}</p>
                </div>
              </div>
            </Card>
          </RevealOnScroll>
        )}
        
        <MysticDivider variant="stars" className="mb-6" />

        {/* 解读内容 - 羊皮纸纹理 */}
        <ParchmentTexture 
          variant="worn" 
          opacity={0.035}
          showEdgeWear={true}
          className="rounded-organic"
        >
          <Card variant="bordered" className="min-h-[400px] bg-transparent border-brass-antique">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gold-700/20">
              <CrystalBallIcon size={24} className="text-gold-500/70" />
              <h2 className="text-xl font-semibold text-parchment-200 font-mystic">AI 塔罗解读</h2>
              {isLoading && (
                <span className="ml-auto text-sm text-gold-400/70 loading-dots">
                  解读中
                </span>
              )}
            </div>

            {error ? (
              <div className="text-center py-10">
                <p className="text-rust-400 mb-4">{error}</p>
                <Button onClick={() => router.push('/tarot')}>
                  返回重新抽牌
                </Button>
              </div>
            ) : (
              <div
                ref={contentRef}
                className="prose prose-invert max-w-none overflow-y-auto max-h-[60vh]"
              >
                {interpretation ? (
                  <RevealOnScroll effect="fadeIn" duration={0.8}>
                    <div className="whitespace-pre-wrap text-parchment-300 leading-relaxed streaming-text font-serif">
                      {/* 首字下沉效果 */}
                      <span className="drop-cap">{interpretation.charAt(0)}</span>
                      {interpretation.slice(1)}
                    </div>
                  </RevealOnScroll>
                ) : isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <CrystalBallIcon size={48} className="text-gold-500/70 mx-auto mb-4" animated />
                      <p className="text-parchment-400">正在为你解读塔罗牌...</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        </ParchmentTexture>

        {/* 操作按钮 */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Button
              variant="outline"
              onClick={() => router.push('/tarot')}
            >
              再抽一次
            </Button>
            <Button
              onClick={() => router.push('/tarot/history')}
            >
              查看历史记录
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
