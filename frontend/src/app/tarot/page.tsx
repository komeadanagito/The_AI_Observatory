'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useRequireAuth } from '@/lib/auth';
import { tarotApi, SpreadInfo, DrawCardResponse, TarotCardInfo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TarotCardDisplay } from '@/components/tarot/card-display';
import { MysticDivider } from '@/components/ui/MysticFrame';
import { ShuffleAnimation } from '@/components/tarot/ShuffleAnimation';
import { CardSelection } from '@/components/tarot/CardSelection';

/**
 * 交互阶段
 */
type InteractionPhase = 
  | 'selecting-spread'  // 选择牌阵
  | 'shuffling'         // 洗牌动画
  | 'drawing'           // 用户选牌
  | 'revealing'         // 逐张揭牌
  | 'complete';         // 完成，可解读

function TarotPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const { isReady, isLoading: authLoading } = useRequireAuth();
  
  // 交互模式：classic（传统随机）或 interactive（新交互）
  const isClassicMode = searchParams.get('classic') === 'true';
  
  // === 阶段和状态 ===
  const [phase, setPhase] = useState<InteractionPhase>('selecting-spread');
  const [selectedSpread, setSelectedSpread] = useState<SpreadInfo | null>(null);
  const [question, setQuestion] = useState('');
  
  // === 选牌状态 ===
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [allCards, setAllCards] = useState<TarotCardInfo[]>([]);
  
  // === 结果状态 ===
  const [drawResult, setDrawResult] = useState<DrawCardResponse | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  
  // === 加载状态 ===
  const [isDrawing, setIsDrawing] = useState(false);

  // 获取牌阵列表
  const { data: spreads, isLoading: spreadsLoading } = useQuery({
    queryKey: ['spreads'],
    queryFn: tarotApi.getSpreads,
    enabled: isReady,
  });

  // 获取所有塔罗牌（用于选牌模式）
  const { data: cardsData } = useQuery({
    queryKey: ['all-cards'],
    queryFn: tarotApi.getAllCards,
    enabled: isReady && !isClassicMode,
  });

  useEffect(() => {
    if (cardsData?.cards) {
      setAllCards(cardsData.cards);
    }
  }, [cardsData]);

  // === 选择牌阵 ===
  const handleSelectSpread = (spread: SpreadInfo) => {
    setSelectedSpread(spread);
  };

  // === 开始抽牌 ===
  const handleStartDraw = () => {
    if (!selectedSpread) return;
    
    if (isClassicMode) {
      // 经典模式：直接随机抽牌
      handleClassicDraw();
    } else {
      // 新交互模式：先洗牌
      setPhase('shuffling');
    }
  };

  // === 经典模式抽牌 ===
  const handleClassicDraw = async () => {
    if (!selectedSpread) return;
    
    setIsDrawing(true);
    
    try {
      const result = await tarotApi.drawCards(selectedSpread.type, question || undefined);
      setDrawResult(result);
      setPhase('complete');
      // 经典模式直接全部翻开
      setRevealedCount(result.cards.length);
    } catch (error) {
      console.error('抽牌失败:', error);
    } finally {
      setIsDrawing(false);
    }
  };

  // === 洗牌完成 ===
  const handleShuffleComplete = () => {
    setPhase('drawing');
    setSelectedCardIndices([]);
  };

  // === 选牌 ===
  const handleSelectCard = (index: number) => {
    if (!selectedSpread) return;
    if (selectedCardIndices.length >= selectedSpread.card_count) return;
    if (selectedCardIndices.includes(index)) return;
    
    setSelectedCardIndices(prev => [...prev, index]);
  };

  const handleDeselectCard = (index: number) => {
    setSelectedCardIndices(prev => prev.filter(i => i !== index));
  };

  // === 确认选牌，调用后端 ===
  const handleConfirmSelection = async () => {
    if (!selectedSpread || selectedCardIndices.length !== selectedSpread.card_count) return;
    
    setIsDrawing(true);
    
    try {
      // 将索引转换为牌 ID
      const selectedCardIds = selectedCardIndices.map(idx => allCards[idx]?.id).filter(Boolean);
      
      const result = await tarotApi.drawCards(
        selectedSpread.type, 
        question || undefined,
        selectedCardIds
      );
      
      setDrawResult(result);
      setRevealedCount(0); // 开始时所有牌都未翻开
      setPhase('revealing');
    } catch (error) {
      console.error('抽牌失败:', error);
    } finally {
      setIsDrawing(false);
    }
  };

  // === 翻开下一张牌 ===
  const handleRevealNext = () => {
    if (!drawResult) return;
    
    if (revealedCount < drawResult.cards.length) {
      setRevealedCount(prev => prev + 1);
    }
    
    // 全部翻开后进入完成阶段
    if (revealedCount + 1 >= drawResult.cards.length) {
      setPhase('complete');
    }
  };

  // === 翻开全部 ===
  const handleRevealAll = () => {
    if (!drawResult) return;
    setRevealedCount(drawResult.cards.length);
    setPhase('complete');
  };

  // === 重置 ===
  const handleReset = () => {
    setPhase('selecting-spread');
    setSelectedSpread(null);
    setDrawResult(null);
    setSelectedCardIndices([]);
    setRevealedCount(0);
    setQuestion('');
  };

  // === 去解读页面 ===
  const handleInterpret = () => {
    if (drawResult) {
      router.push(`/tarot/reading/${drawResult.session_id}?question=${encodeURIComponent(question)}`);
    }
  };

  // 等待认证状态确定
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="text-5xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔮
          </motion.div>
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
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-mystic font-bold text-white">AI 塔罗牌</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* 模式切换 */}
              <Link 
                href={isClassicMode ? '/tarot' : '/tarot?classic=true'}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                {isClassicMode ? '✨ 沉浸模式' : '🎲 经典模式'}
              </Link>
              <Link href="/tarot/history">
                <Button variant="ghost" size="sm">历史记录</Button>
              </Link>
              <span className="text-gray-400 text-sm hidden md:inline">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 洗牌动画（全屏覆盖） */}
      <ShuffleAnimation
        isPlaying={phase === 'shuffling'}
        onComplete={handleShuffleComplete}
        onSkip={handleShuffleComplete}
        duration={4000}
      />

      {/* 主内容 */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {/* 阶段 1: 选择牌阵 */}
          {phase === 'selecting-spread' && (
            <motion.div
              key="select-spread"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 标题 */}
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-mystic font-bold text-white mb-4 tracking-wide">
                  <span className="text-gradient-mystic">选择你的牌阵</span>
                </h1>
                <MysticDivider variant="stars" className="max-w-xs mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  静下心来，专注于你的问题，让塔罗牌指引你
                </p>
              </div>

              {/* 问题输入 */}
              <Card className="mb-8 max-w-2xl mx-auto">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  你的问题（可选）
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="在这里输入你想要问的问题..."
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {question.length}/500
                </p>
              </Card>

              {/* 牌阵选择 - 依次入场 */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } }
                }}
              >
                {spreadsLoading ? (
                  <div className="col-span-full text-center text-gray-400">
                    加载牌阵中...
                  </div>
                ) : (
                  spreads?.map((spread: SpreadInfo, index: number) => (
                    <motion.div
                      key={spread.type}
                      variants={{
                        hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
                        visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                      }}
                      whileHover={{ scale: 1.02, rotate: 0.5 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        // 轻微的有机偏移
                        transform: `rotate(${(index % 2 === 0 ? 0.3 : -0.3)}deg)`,
                      }}
                    >
                      <Card
                        variant={selectedSpread?.type === spread.type ? 'glow' : 'default'}
                        hover
                        organicIndex={index}
                        className={`cursor-pointer transition-all energy-field ${
                          selectedSpread?.type === spread.type
                            ? 'ring-1 ring-gold-500/40'
                            : ''
                        }`}
                        onClick={() => handleSelectSpread(spread)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-parchment-200">
                            {spread.name_zh}
                          </h3>
                          <span className="text-sm text-gold-400 bg-gold-500/10 px-2 py-1 rounded-organic-sm">
                            {spread.card_count} 张
                          </span>
                        </div>
                        <p className="text-parchment-400 text-sm">
                          {spread.description_zh}
                        </p>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* 抽牌按钮 */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartDraw}
                  disabled={!selectedSpread || isDrawing}
                  isLoading={isDrawing}
                  className="px-12"
                >
                  {isClassicMode ? '🎲 随机抽牌' : '✨ 开始洗牌'}
                </Button>
                {!isClassicMode && selectedSpread && (
                  <p className="text-gray-500 text-sm mt-3">
                    将进入沉浸式选牌体验
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* 阶段 2: 用户选牌 */}
          {phase === 'drawing' && selectedSpread && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardSelection
                totalCards={allCards.length || 78}
                requiredCount={selectedSpread.card_count}
                selectedIndices={selectedCardIndices}
                onSelect={handleSelectCard}
                onDeselect={handleDeselectCard}
                onConfirm={handleConfirmSelection}
                positionNames={drawResult?.positions.map(p => p.name_zh)}
              />
              
              {/* 返回按钮 */}
              <div className="text-center mt-6">
                <Button variant="ghost" onClick={handleReset}>
                  ← 重新选择牌阵
                </Button>
              </div>
            </motion.div>
          )}

          {/* 阶段 3: 逐张揭牌 */}
          {phase === 'revealing' && drawResult && (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 牌阵信息 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-mystic font-bold text-white mb-2 tracking-wide">
                  <span className="text-gradient-mystic">{drawResult.spread_name_zh}</span>
                </h2>
                <MysticDivider variant="moons" className="max-w-xs mx-auto mb-4" />
                {drawResult.question && (
                  <p className="text-gray-400 italic">「{drawResult.question}」</p>
                )}
                <p className="text-primary-400 mt-4">
                  点击卡牌翻开 ({revealedCount}/{drawResult.cards.length})
                </p>
              </div>

              {/* 塔罗牌展示 */}
              <div className="tarot-table tarot-table-border">
                <InteractiveCardDisplay
                  cards={drawResult.cards}
                  positions={drawResult.positions}
                  revealedCount={revealedCount}
                  onReveal={handleRevealNext}
                  spreadType={drawResult.spread_type}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4 mt-10">
                <Button variant="outline" onClick={handleReset}>
                  重新抽牌
                </Button>
                {revealedCount < drawResult.cards.length && (
                  <Button variant="ghost" onClick={handleRevealAll}>
                    全部翻开
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* 阶段 4: 完成 */}
          {phase === 'complete' && drawResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 牌阵信息 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-mystic font-bold text-white mb-2 tracking-wide">
                  <span className="text-gradient-mystic">{drawResult.spread_name_zh}</span>
                </h2>
                <MysticDivider variant="moons" className="max-w-xs mx-auto mb-4" />
                {drawResult.question && (
                  <p className="text-gray-400 italic">「{drawResult.question}」</p>
                )}
              </div>

              {/* 塔罗牌展示 - 桌布背景 */}
              <div className="tarot-table tarot-table-border">
                <TarotCardDisplay
                  cards={drawResult.cards}
                  positions={drawResult.positions}
                  showCards={true}
                  spreadType={drawResult.spread_type}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4 mt-10">
                <Button variant="outline" onClick={handleReset}>
                  重新抽牌
                </Button>
                <Button onClick={handleInterpret}>
                  🔮 获取 AI 解读
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function TarotPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="text-5xl mb-4"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔮
            </motion.div>
            <p className="text-gray-400">加载塔罗牌中...</p>
          </div>
        </div>
      }
    >
      <TarotPageContent />
    </Suspense>
  );
}

/**
 * 可交互的卡牌展示组件（支持逐张点击翻牌）
 */
function InteractiveCardDisplay({
  cards,
  positions,
  revealedCount,
  onReveal,
  spreadType,
}: {
  cards: DrawCardResponse['cards'];
  positions: DrawCardResponse['positions'];
  revealedCount: number;
  onReveal: () => void;
  spreadType: string;
}) {
  // 使用 revealedCount 控制逐张翻牌
  // 点击任意地方翻开下一张
  return (
    <div onClick={onReveal} className="cursor-pointer">
      <TarotCardDisplay
        cards={cards}
        positions={positions}
        showCards={false}
        revealedCount={revealedCount}
        spreadType={spreadType}
      />
      {revealedCount < cards.length && (
        <motion.p
          className="text-center text-primary-400/60 mt-4 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ 点击翻开下一张牌
        </motion.p>
      )}
    </div>
  );
}
