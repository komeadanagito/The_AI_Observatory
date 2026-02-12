'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardSelectionProps {
  /** 总牌数 */
  totalCards?: number;
  /** 需要选择的牌数 */
  requiredCount: number;
  /** 已选择的牌索引列表 */
  selectedIndices: number[];
  /** 选择牌回调 */
  onSelect: (index: number) => void;
  /** 取消选择回调 */
  onDeselect: (index: number) => void;
  /** 确认选择回调 */
  onConfirm: () => void;
  /** 牌阵位置名称 */
  positionNames?: string[];
}

/**
 * 用户选牌界面组件
 * 展示牌堆，让用户选择指定数量的牌
 */
export function CardSelection({
  totalCards = 78,
  requiredCount,
  selectedIndices,
  onSelect,
  onDeselect,
  onConfirm,
  positionNames = [],
}: CardSelectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'fan' | 'grid'>('fan');

  // 扇形模式下显示的牌数量
  const fanDisplayCount = 40;

  // 计算扇形布局的位置
  const calculateFanPosition = useCallback((index: number, total: number) => {
    // 扇形参数 - 调整为更紧凑的弧形
    const arcAngle = 120; // 总弧度（度）
    const startAngle = -arcAngle / 2;
    const angleStep = total > 1 ? arcAngle / (total - 1) : 0;
    const angle = startAngle + index * angleStep;
    const radius = 280; // 扇形半径
    
    // 转换为弧度
    const radians = (angle * Math.PI) / 180;
    
    return {
      x: Math.sin(radians) * radius,
      y: -Math.cos(radians) * radius + radius * 0.3, // 调整 Y 使扇形向上展开
      rotation: angle * 0.5, // 跟随角度旋转
    };
  }, []);

  // 生成可见的牌
  const visibleCards = useMemo(() => {
    if (viewMode === 'grid') {
      return Array.from({ length: totalCards }, (_, i) => i);
    }
    // 扇形模式下显示较少的牌，均匀分布
    const displayCount = Math.min(fanDisplayCount, totalCards);
    const step = totalCards / displayCount;
    return Array.from({ length: displayCount }, (_, i) => Math.floor(i * step));
  }, [totalCards, viewMode]);

  const isSelectionComplete = selectedIndices.length >= requiredCount;

  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center">
      {/* 进度提示 */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-mystic text-white mb-2">
          选择你的塔罗牌
        </h3>
        <p className="text-primary-400">
          已选择 <span className="text-gold-400 font-bold">{selectedIndices.length}</span> / {requiredCount} 张
        </p>
      </div>

      {/* 视图切换 */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            viewMode === 'fan' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
          onClick={() => setViewMode('fan')}
        >
          扇形展开
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            viewMode === 'grid' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
          onClick={() => setViewMode('grid')}
        >
          网格视图
        </button>
      </div>

      {/* 选牌区域 */}
      <div className={`relative ${viewMode === 'fan' ? 'h-96 w-full' : 'w-full'}`}>
        {viewMode === 'fan' ? (
          // 扇形布局 - 居中显示
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative" style={{ width: '600px', height: '350px' }}>
              {visibleCards.map((cardIndex, displayIndex) => {
                const isSelected = selectedIndices.includes(cardIndex);
                const selectionOrder = selectedIndices.indexOf(cardIndex) + 1;
                const pos = calculateFanPosition(displayIndex, visibleCards.length);
                
                return (
                  <motion.div
                    key={cardIndex}
                    className="absolute cursor-pointer"
                    style={{
                      width: '50px',
                      height: '75px',
                      left: '50%',
                      top: '70%',
                      marginLeft: '-25px',
                      marginTop: '-37.5px',
                      transformOrigin: 'center bottom',
                      zIndex: hoveredIndex === cardIndex ? 100 : displayIndex,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      x: pos.x,
                      y: isSelected ? pos.y - 30 : (hoveredIndex === cardIndex ? pos.y - 15 : pos.y),
                      rotate: pos.rotation,
                      scale: hoveredIndex === cardIndex ? 1.2 : 1,
                      opacity: isSelected ? 0.3 : 1,
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      damping: 20,
                      delay: displayIndex * 0.01 
                    }}
                    onMouseEnter={() => setHoveredIndex(cardIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      if (isSelected) {
                        onDeselect(cardIndex);
                      } else if (!isSelectionComplete) {
                        onSelect(cardIndex);
                      }
                    }}
                  >
                    <SelectableCard 
                      isSelected={isSelected} 
                      selectionOrder={selectionOrder}
                      isDisabled={!isSelected && isSelectionComplete}
                      positionName={positionNames[selectionOrder - 1]}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          // 网格布局 - 修复为正确的网格
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2 p-4 max-w-5xl mx-auto">
            {visibleCards.map((cardIndex) => {
              const isSelected = selectedIndices.includes(cardIndex);
              const selectionOrder = selectedIndices.indexOf(cardIndex) + 1;
              
              return (
                <motion.div
                  key={cardIndex}
                  className="cursor-pointer aspect-[2/3]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isSelected ? 0.4 : 1, 
                    scale: 1,
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    if (isSelected) {
                      onDeselect(cardIndex);
                    } else if (!isSelectionComplete) {
                      onSelect(cardIndex);
                    }
                  }}
                >
                  <SelectableCard 
                    isSelected={isSelected} 
                    selectionOrder={selectionOrder}
                    isDisabled={!isSelected && isSelectionComplete}
                    positionName={positionNames[selectionOrder - 1]}
                    size="sm"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 已选牌预览 */}
      {selectedIndices.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <p className="text-sm text-gray-400 mb-3 text-center">已选择的牌：</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {selectedIndices.map((cardIndex, idx) => (
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-primary-800 to-mystic-900 border border-gold-500/40 flex items-center justify-center">
                  <span className="text-gold-400 font-bold">{idx + 1}</span>
                </div>
                {positionNames[idx] && (
                  <p className="text-[10px] text-gray-500 text-center mt-1 truncate max-w-[56px]">
                    {positionNames[idx]}
                  </p>
                )}
                <button
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] hover:bg-red-400"
                  onClick={() => onDeselect(cardIndex)}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 确认按钮 */}
      <motion.button
        className={`mt-8 px-8 py-3 rounded-lg font-medium transition-all ${
          isSelectionComplete
            ? 'bg-gradient-to-r from-primary-600 to-mystic-600 text-white hover:from-primary-500 hover:to-mystic-500 shadow-lg shadow-primary-500/25'
            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!isSelectionComplete}
        onClick={onConfirm}
        whileHover={isSelectionComplete ? { scale: 1.05 } : {}}
        whileTap={isSelectionComplete ? { scale: 0.95 } : {}}
      >
        {isSelectionComplete ? '🔮 确认选择，开始揭牌' : `还需选择 ${requiredCount - selectedIndices.length} 张`}
      </motion.button>
    </div>
  );
}

/**
 * 可选择的单张牌组件
 */
function SelectableCard({
  isSelected,
  selectionOrder,
  isDisabled,
  positionName,
  size = 'md',
}: {
  isSelected: boolean;
  selectionOrder: number;
  isDisabled: boolean;
  positionName?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div 
      className={`w-full h-full rounded-lg overflow-hidden relative transition-all duration-200 ${
        isDisabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      style={{
        background: isSelected 
          ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
          : 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #312e81 100%)',
        boxShadow: isSelected 
          ? '0 0 15px rgba(251, 191, 36, 0.5)'
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* 边框装饰 */}
      <div className={`absolute inset-0.5 border rounded-md ${
        isSelected ? 'border-white/40' : 'border-gold-500/20'
      }`} />
      
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} bg-white rounded-full flex items-center justify-center`}>
            <span className="text-gold-600 font-bold">{selectionOrder}</span>
          </div>
        </div>
      )}
      
      {/* 未选中时的图案 */}
      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <span className={size === 'sm' ? 'text-sm' : 'text-lg'}>✧</span>
        </div>
      )}
    </div>
  );
}

export default CardSelection;
