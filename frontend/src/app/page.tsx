'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { usePageTransition } from '@/lib/transition-store';
import { StaggeredReveal } from '@/components/effects/RevealOnScroll';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { navigateWithTransition } = usePageTransition();
  
  // 带转场效果的导航
  const handleNavigateToTarot = () => {
    navigateWithTransition(router, '/tarot', 'portal');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-white">AI 玄学洞见</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/tarot">
                    <Button variant="ghost" size="sm">塔罗牌</Button>
                  </Link>
                  <span className="text-gray-400 text-sm">{user?.email}</span>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">登录</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">注册</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-mystic-400 to-gold-400 bg-clip-text text-transparent">
                AI 玄学洞见平台
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-4">
              探索未知，洞察命运，发现内在智慧
            </p>
            <p className="text-sm text-gold-500/80 mb-12">
              ✨ 纯属娱乐，不构成任何预测或决策依据
            </p>
          </motion.div>

          {/* 功能卡片 */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* 塔罗牌 */}
            <Link href={isAuthenticated ? "/tarot" : "/login"}>
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 card-hover border border-primary-500/20">
                <div className="text-4xl mb-4">🃏</div>
                <h3 className="text-xl font-semibold text-white mb-2">AI 塔罗牌</h3>
                <p className="text-gray-400 text-sm">
                  直觉与意象的解读，探索内心的指引
                </p>
              </div>
            </Link>

            {/* 中式算命 */}
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-6 border border-dark-600 opacity-60 cursor-not-allowed">
              <div className="text-4xl mb-4">📿</div>
              <h3 className="text-xl font-semibold text-white mb-2">中式算命</h3>
              <p className="text-gray-400 text-sm">
                八字命理，紫微斗数
              </p>
              <span className="inline-block mt-2 text-xs bg-dark-700 text-gray-500 px-2 py-1 rounded">
                即将推出
              </span>
            </div>

            {/* 星座 */}
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-6 border border-dark-600 opacity-60 cursor-not-allowed">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-white mb-2">星座运势</h3>
              <p className="text-gray-400 text-sm">
                西式占星，星盘解读
              </p>
              <span className="inline-block mt-2 text-xs bg-dark-700 text-gray-500 px-2 py-1 rounded">
                即将推出
              </span>
            </div>

            {/* MBTI */}
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-6 border border-dark-600 opacity-60 cursor-not-allowed">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-2">MBTI 测试</h3>
              <p className="text-gray-400 text-sm">
                AI 动态问卷，人格分析
              </p>
              <span className="inline-block mt-2 text-xs bg-dark-700 text-gray-500 px-2 py-1 rounded">
                即将推出
              </span>
            </div>
          </motion.div>

          {/* CTA 按钮 - 带转场效果 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Button 
                size="lg" 
                className="px-8"
                onClick={handleNavigateToTarot}
              >
                🔮 开始塔罗占卜
              </Button>
            ) : (
              <Link href="/register">
                <Button size="lg" className="px-8">
                  ✨ 立即体验
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© 2026 AI 玄学洞见平台 | 纯属娱乐，请理性看待</p>
      </footer>
    </div>
  );
}
