'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DrawnCard, SpreadPosition } from '@/lib/api';
import { CardRevealGlow } from '@/components/effects/CardRevealParticles';
import { organicBorderRadius, randomRotation } from '@/lib/organic-utils';

interface TarotCardDisplayProps {
  cards: DrawnCard[];
  positions: SpreadPosition[];
  showCards: boolean;
  spreadType?: string;
  /** 已揭开的牌数量（用于逐张揭牌模式） */
  revealedCount?: number;
}

// 塔罗牌图片基础路径
const CARD_IMAGE_BASE = '/tarot-images';

export function TarotCardDisplay({ cards, positions, showCards, spreadType, revealedCount }: TarotCardDisplayProps) {
  // 根据牌阵类型选择布局
  const renderLayout = () => {
    const layoutProps = { cards, positions, showCards, revealedCount };
    switch (spreadType) {
      case 'single':
        return <SingleLayout {...layoutProps} />;
      case 'three_cards':
        return <ThreeCardsLayout {...layoutProps} />;
      case 'celtic_cross':
        return <CelticCrossLayout {...layoutProps} />;
      case 'two_options':
        return <TwoOptionsLayout {...layoutProps} />;
      case 'love_relationship':
        return <LoveRelationshipLayout {...layoutProps} />;
      case 'hexagram':
        return <HexagramLayout {...layoutProps} />;
      case 'horseshoe':
        return <HorseshoeLayout {...layoutProps} />;
      default:
        return <DefaultLayout {...layoutProps} />;
    }
  };

  return (
    <div className="w-full flex justify-center py-8">
      {renderLayout()}
    </div>
  );
}

// ==========================================
// 单张布局
// ==========================================
function SingleLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const card = cards[0];
  const position = positions.find(p => p.index === card?.position);
  
  if (!card) return null;
  
  return (
    <div className="flex justify-center">
      <TarotCardItem 
        drawnCard={card} 
        position={position} 
        index={0} 
        showCards={shouldShowCard(0, showCards, revealedCount)}
        size="lg"
      />
    </div>
  );
}

// ==========================================
// 三张牌布局（过去-现在-未来）
// ==========================================
function ThreeCardsLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  return (
    <div className="flex justify-center items-center gap-8 md:gap-14">
      {cards.map((card, index) => {
        const position = positions.find(p => p.index === card.position);
        return (
          <TarotCardItem 
            key={card.card_id}
            drawnCard={card} 
            position={position} 
            index={index} 
            showCards={shouldShowCard(index, showCards, revealedCount)}
            size="lg"
          />
        );
      })}
    </div>
  );
}

// ==========================================
// 凯尔特十字布局
// ==========================================
function CelticCrossLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const getCard = (posIndex: number) => cards.find(c => c.position === posIndex);
  const getPos = (posIndex: number) => positions.find(p => p.index === posIndex);
  const show = (index: number) => shouldShowCard(index, showCards, revealedCount);
  
  return (
    <div className="flex gap-10 md:gap-16">
      {/* 左侧十字部分 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 items-center" style={{ gridTemplateRows: 'auto auto auto' }}>
        {/* 第一行: 空 | 5(可能) | 空 */}
        <div />
        <TarotCardItem drawnCard={getCard(5)} position={getPos(5)} index={4} showCards={show(4)} size="sm" />
        <div />
        
        {/* 第二行: 4(过去) | 1+2(中心) | 6(近未来) */}
        <TarotCardItem drawnCard={getCard(4)} position={getPos(4)} index={3} showCards={show(3)} size="sm" />
        <div className="relative">
          <TarotCardItem drawnCard={getCard(1)} position={getPos(1)} index={0} showCards={show(0)} size="sm" />
          {getCard(2) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 opacity-90">
              <TarotCardItem drawnCard={getCard(2)} position={getPos(2)} index={1} showCards={show(1)} size="sm" hideLabel />
            </div>
          )}
        </div>
        <TarotCardItem drawnCard={getCard(6)} position={getPos(6)} index={5} showCards={show(5)} size="sm" />
        
        {/* 第三行: 空 | 3(根源) | 空 */}
        <div />
        <TarotCardItem drawnCard={getCard(3)} position={getPos(3)} index={2} showCards={show(2)} size="sm" />
        <div />
      </div>
      
      {/* 右侧竖排：7, 8, 9, 10 从下到上 */}
      <div className="flex flex-col-reverse gap-3 md:gap-4">
        <TarotCardItem drawnCard={getCard(7)} position={getPos(7)} index={6} showCards={show(6)} size="sm" />
        <TarotCardItem drawnCard={getCard(8)} position={getPos(8)} index={7} showCards={show(7)} size="sm" />
        <TarotCardItem drawnCard={getCard(9)} position={getPos(9)} index={8} showCards={show(8)} size="sm" />
        <TarotCardItem drawnCard={getCard(10)} position={getPos(10)} index={9} showCards={show(9)} size="sm" />
      </div>
    </div>
  );
}

// ==========================================
// 二择一布局
// ==========================================
function TwoOptionsLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const getCard = (posIndex: number) => cards.find(c => c.position === posIndex);
  const getPos = (posIndex: number) => positions.find(p => p.index === posIndex);
  const show = (index: number) => shouldShowCard(index, showCards, revealedCount);
  
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      {/* 顶部：现状 */}
      <TarotCardItem drawnCard={getCard(1)} position={getPos(1)} index={0} showCards={show(0)} size="md" />
      
      {/* 中间：两个选项 */}
      <div className="flex gap-16 md:gap-28">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <TarotCardItem drawnCard={getCard(2)} position={getPos(2)} index={1} showCards={show(1)} size="md" />
          <TarotCardItem drawnCard={getCard(3)} position={getPos(3)} index={2} showCards={show(2)} size="md" />
        </div>
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <TarotCardItem drawnCard={getCard(4)} position={getPos(4)} index={3} showCards={show(3)} size="md" />
          <TarotCardItem drawnCard={getCard(5)} position={getPos(5)} index={4} showCards={show(4)} size="md" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 爱情关系布局
// ==========================================
function LoveRelationshipLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const getCard = (posIndex: number) => cards.find(c => c.position === posIndex);
  const getPos = (posIndex: number) => positions.find(p => p.index === posIndex);
  const show = (index: number) => shouldShowCard(index, showCards, revealedCount);
  
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      {/* 第一行：你 | 对方 */}
      <div className="flex gap-12 md:gap-20">
        <TarotCardItem drawnCard={getCard(1)} position={getPos(1)} index={0} showCards={show(0)} size="md" />
        <TarotCardItem drawnCard={getCard(2)} position={getPos(2)} index={1} showCards={show(1)} size="md" />
      </div>
      
      {/* 第二行：关系现状 */}
      <TarotCardItem drawnCard={getCard(3)} position={getPos(3)} index={2} showCards={show(2)} size="md" />
      
      {/* 第三行：阻碍 | 外部影响 */}
      <div className="flex gap-12 md:gap-20">
        <TarotCardItem drawnCard={getCard(4)} position={getPos(4)} index={3} showCards={show(3)} size="md" />
        <TarotCardItem drawnCard={getCard(5)} position={getPos(5)} index={4} showCards={show(4)} size="md" />
      </div>
      
      {/* 第四行：建议 */}
      <TarotCardItem drawnCard={getCard(6)} position={getPos(6)} index={5} showCards={show(5)} size="md" />
      
      {/* 第五行：发展方向 */}
      <TarotCardItem drawnCard={getCard(7)} position={getPos(7)} index={6} showCards={show(6)} size="md" />
    </div>
  );
}

// ==========================================
// 六芒星布局
// ==========================================
function HexagramLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const getCard = (posIndex: number) => cards.find(c => c.position === posIndex);
  const getPos = (posIndex: number) => positions.find(p => p.index === posIndex);
  const show = (index: number) => shouldShowCard(index, showCards, revealedCount);
  
  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      {/* 顶点 */}
      <TarotCardItem drawnCard={getCard(1)} position={getPos(1)} index={0} showCards={show(0)} size="md" />
      
      {/* 上排两侧 */}
      <div className="flex gap-20 md:gap-32">
        <TarotCardItem drawnCard={getCard(6)} position={getPos(6)} index={5} showCards={show(5)} size="md" />
        <TarotCardItem drawnCard={getCard(2)} position={getPos(2)} index={1} showCards={show(1)} size="md" />
      </div>
      
      {/* 中心 */}
      <TarotCardItem drawnCard={getCard(7)} position={getPos(7)} index={6} showCards={show(6)} size="md" />
      
      {/* 下排两侧 */}
      <div className="flex gap-20 md:gap-32">
        <TarotCardItem drawnCard={getCard(5)} position={getPos(5)} index={4} showCards={show(4)} size="md" />
        <TarotCardItem drawnCard={getCard(3)} position={getPos(3)} index={2} showCards={show(2)} size="md" />
      </div>
      
      {/* 底点 */}
      <TarotCardItem drawnCard={getCard(4)} position={getPos(4)} index={3} showCards={show(3)} size="md" />
    </div>
  );
}

// ==========================================
// 马蹄铁布局
// ==========================================
function HorseshoeLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  const getCard = (posIndex: number) => cards.find(c => c.position === posIndex);
  const getPos = (posIndex: number) => positions.find(p => p.index === posIndex);
  const show = (index: number) => shouldShowCard(index, showCards, revealedCount);
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* 弧形排列 */}
      <div className="flex items-end gap-3 md:gap-6">
        <div className="translate-y-8 md:translate-y-12">
          <TarotCardItem drawnCard={getCard(1)} position={getPos(1)} index={0} showCards={show(0)} size="md" />
        </div>
        <div className="translate-y-3 md:translate-y-4">
          <TarotCardItem drawnCard={getCard(2)} position={getPos(2)} index={1} showCards={show(1)} size="md" />
        </div>
        <div className="translate-y-1">
          <TarotCardItem drawnCard={getCard(3)} position={getPos(3)} index={2} showCards={show(2)} size="md" />
        </div>
        <TarotCardItem drawnCard={getCard(4)} position={getPos(4)} index={3} showCards={show(3)} size="md" />
        <div className="translate-y-1">
          <TarotCardItem drawnCard={getCard(5)} position={getPos(5)} index={4} showCards={show(4)} size="md" />
        </div>
        <div className="translate-y-3 md:translate-y-4">
          <TarotCardItem drawnCard={getCard(6)} position={getPos(6)} index={5} showCards={show(5)} size="md" />
        </div>
        <div className="translate-y-8 md:translate-y-12">
          <TarotCardItem drawnCard={getCard(7)} position={getPos(7)} index={6} showCards={show(6)} size="md" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 默认布局（横向排列）
// ==========================================
function DefaultLayout({ cards, positions, showCards, revealedCount }: LayoutProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
      {cards.map((card, index) => {
        const position = positions.find(p => p.index === card.position);
        return (
          <TarotCardItem 
            key={card.card_id}
            drawnCard={card} 
            position={position} 
            index={index} 
            showCards={shouldShowCard(index, showCards, revealedCount)}
            size="md"
          />
        );
      })}
    </div>
  );
}

// ==========================================
// 单张牌组件
// ==========================================
interface LayoutProps {
  cards: DrawnCard[];
  positions: SpreadPosition[];
  showCards: boolean;
  /** 已揭开的牌数量（逐张揭牌模式） */
  revealedCount?: number;
}

/**
 * 判断某张牌是否应该翻开
 * @param index 牌的索引（0-based）
 * @param showCards 是否全部显示
 * @param revealedCount 已揭开数量
 */
function shouldShowCard(index: number, showCards: boolean, revealedCount?: number): boolean {
  // 如果指定了 revealedCount，则按逐张揭牌逻辑
  if (revealedCount !== undefined) {
    return index < revealedCount;
  }
  // 否则按全部显示/隐藏逻辑
  return showCards;
}

interface TarotCardItemProps {
  drawnCard?: DrawnCard;
  position?: SpreadPosition;
  index: number;
  showCards: boolean;
  size?: 'sm' | 'md' | 'lg';
  hideLabel?: boolean;
}

function TarotCardItem({ drawnCard, position, index, showCards, size = 'md', hideLabel = false }: TarotCardItemProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isHovered, setIsHovered] = useState(false);
  const [wasJustRevealed, setWasJustRevealed] = useState(false);
  const sizeConfig = getSizeClasses(size);
  
  // 有机样式 - 基于卡牌 ID 生成一致的随机偏移
  const organicStyle = useMemo(() => {
    const seed = drawnCard?.card_id ?? index;
    return {
      transform: randomRotation(seed, 0.8),
      borderRadius: organicBorderRadius(seed, 12, 3),
    };
  }, [drawnCard?.card_id, index]);

  const imageFilename = drawnCard?.card.image_filename ?? '';
  const imageUrl = imageFilename ? `${CARD_IMAGE_BASE}/${imageFilename}` : '';

  // 预加载图片
  useEffect(() => {
    if (!imageUrl) {
      setImageStatus('error');
      return;
    }

    setImageStatus('loading');
    const img = new Image();
    img.onload = () => setImageStatus('loaded');
    img.onerror = () => setImageStatus('error');
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  // 翻牌时触发揭示效果
  useEffect(() => {
    if (showCards) {
      setWasJustRevealed(true);
      const timer = setTimeout(() => setWasJustRevealed(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showCards]);

  if (!drawnCard) return <div className={sizeConfig.container} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.4,
        type: 'spring',
        stiffness: 100
      }}
      className="flex flex-col items-center group"
      style={{ transform: organicStyle.transform }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 位置标签 */}
      {!hideLabel && position && (
        <motion.div 
          className="mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <span className={`
            inline-block px-4 py-1.5 rounded-organic-sm
            bg-gradient-to-r from-primary-600/30 to-mystic-600/30
            border-ethereal
            text-parchment-200 font-mystic font-medium tracking-wide
            ${sizeConfig.label}
            shadow-mystic
            backdrop-blur-sm
          `}>
            {position.name_zh}
          </span>
        </motion.div>
      )}

      {/* 塔罗牌容器 */}
      <motion.div 
        className={`${sizeConfig.container} relative cursor-pointer card-mystic-aura`} 
        style={{ perspective: '1200px' }}
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* 翻牌时的光效 */}
        <CardRevealGlow 
          active={wasJustRevealed} 
          variant={drawnCard.is_reversed ? 'reversed' : 'normal'} 
        />
        
        {/* 悬浮发光效果 */}
        <motion.div 
          className={`
            absolute -inset-2 rounded-2xl transition-opacity duration-500
            bg-gradient-to-r from-primary-500/20 via-mystic-500/25 to-gold-500/20
          `}
          style={{ filter: 'blur(12px)' }}
          animate={{ 
            opacity: isHovered ? 0.8 : 0,
            scale: isHovered ? 1.02 : 1
          }}
        />
        
        <div 
          className={`tarot-card-inner absolute inset-0 ${showCards ? 'flipped' : ''}`}
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* 牌背 */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)'
            }}
          >
            {/* 牌背渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-mystic-900 to-primary-800" />
            
            {/* 神秘符文图案 */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 160" preserveAspectRatio="none">
                <defs>
                  <pattern id="runePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z" fill="rgba(251, 191, 36, 0.3)" />
                  </pattern>
                </defs>
                <rect width="100" height="160" fill="url(#runePattern)" />
              </svg>
            </div>
            
            {/* 装饰边框 - 做旧黄铜效果 */}
            <div className="absolute inset-0 p-3">
              <div className="absolute inset-3 border-2 border-gold-600/25 rounded-lg gold-antique patina" 
                style={{ background: 'linear-gradient(135deg, rgba(122, 96, 64, 0.15), rgba(154, 122, 84, 0.1), rgba(106, 80, 53, 0.15))' }} 
              />
              <div className="absolute inset-5 border border-gold-700/20 rounded-md" />
              {/* 角落装饰 - 不均匀边框模拟做旧 */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold-600/40 rounded-tl" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold-500/35 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold-700/40 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold-600/45 rounded-br" />
            </div>
            
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`${sizeConfig.backIcon} drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]`}
              >
                🔮
              </motion.div>
            </div>
            
            {/* 卡牌厚度效果（底部阴影） */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          
          {/* 牌面 */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: `rotateY(180deg) ${drawnCard.is_reversed ? 'rotate(180deg)' : ''}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.2)'
            }}
          >
            {/* 图片或占位 */}
            {imageStatus === 'loaded' && imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={drawnCard.card.name_zh}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
                {/* 做旧黄铜边框效果 */}
                <div className="absolute inset-0 rounded-xl border-2 border-gold-600/35 pointer-events-none gold-shimmer patina" 
                  style={{ 
                    borderImage: 'linear-gradient(145deg, rgba(106, 80, 53, 0.5), rgba(154, 122, 84, 0.4), rgba(196, 160, 106, 0.45), rgba(138, 106, 69, 0.5)) 1'
                  }}
                />
              </>
            ) : imageStatus === 'loading' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-700 to-dark-900">
                <motion.div 
                  className={sizeConfig.loadingIcon}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  🔮
                </motion.div>
                <span className="text-[10px] text-gray-500 mt-2">加载中...</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-700 to-dark-900 p-2">
                <span className={`${sizeConfig.fallbackIcon} mb-2`}>
                  {drawnCard.card.arcana === 'major' ? '✨' : getSuitEmoji(drawnCard.card.suit)}
                </span>
                <span className={`${sizeConfig.fallbackText} text-center text-white font-medium`}>
                  {drawnCard.card.name_zh}
                </span>
              </div>
            )}
            
            {/* 逆位标记 - 增强版 */}
            {drawnCard.is_reversed && imageStatus === 'loaded' && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent py-2 px-2 text-center" 
                style={{ transform: 'rotate(180deg)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xs text-gold-400 font-bold tracking-wider flex items-center justify-center gap-1">
                  <span className="animate-pulse">⚠</span> 逆位
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 牌名 - 只有翻开后才显示 */}
      {showCards && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`text-white font-semibold ${sizeConfig.cardName} mb-1`}>
            {drawnCard.card.name_zh}
          </p>
          <p className={`${sizeConfig.cardStatus} font-medium ${
            drawnCard.is_reversed 
              ? 'text-gold-400' 
              : 'text-primary-400'
          }`}>
            {drawnCard.is_reversed ? '↻ 逆位' : '↑ 正位'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

interface SizeConfig {
  container: string;
  label: string;
  backIcon: string;
  loadingIcon: string;
  fallbackIcon: string;
  fallbackText: string;
  cardName: string;
  cardStatus: string;
}

function getSizeClasses(size: 'sm' | 'md' | 'lg'): SizeConfig {
  switch (size) {
    case 'sm': 
      return {
        container: 'w-24 h-40 md:w-32 md:h-52',
        label: 'text-[10px] md:text-xs',
        backIcon: 'text-2xl md:text-3xl',
        loadingIcon: 'text-xl',
        fallbackIcon: 'text-2xl',
        fallbackText: 'text-[10px]',
        cardName: 'text-xs md:text-sm',
        cardStatus: 'text-[10px]',
      };
    case 'md': 
      return {
        container: 'w-32 h-52 md:w-40 md:h-64',
        label: 'text-xs md:text-sm',
        backIcon: 'text-3xl md:text-4xl',
        loadingIcon: 'text-2xl',
        fallbackIcon: 'text-3xl',
        fallbackText: 'text-xs',
        cardName: 'text-sm md:text-base',
        cardStatus: 'text-xs',
      };
    case 'lg': 
      return {
        container: 'w-40 h-64 md:w-48 md:h-80',
        label: 'text-sm md:text-base',
        backIcon: 'text-4xl md:text-5xl',
        loadingIcon: 'text-3xl',
        fallbackIcon: 'text-4xl',
        fallbackText: 'text-sm',
        cardName: 'text-base md:text-lg',
        cardStatus: 'text-xs md:text-sm',
      };
    default: 
      return getSizeClasses('md');
  }
}

function getSuitEmoji(suit?: string | null): string {
  switch (suit) {
    case 'wands': return '🪄';
    case 'cups': return '🏆';
    case 'swords': return '⚔️';
    case 'pentacles': return '💰';
    default: return '🃏';
  }
}

export { TarotCardItem };
