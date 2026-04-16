'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MysticDivider } from '@/components/ui/MysticFrame';
import { usePageTransition } from '@/lib/transition-store';
import { CrystalBallIcon, HexagramIcon, MysticEyeIcon, PalmIcon, StarIcon } from '@/components/icons/MysticIcons';

type FeatureCard = {
  title: string;
  description: string;
  status: string;
  icon: typeof MysticEyeIcon;
  href?: string;
};

const futureFeatures: FeatureCard[] = [
  {
    title: '中式算命',
    description: '八字命理与紫微斗数，面向更完整的人生叙事。',
    status: '即将推出',
    icon: MysticEyeIcon,
  },
  {
    title: '星座运势',
    description: '以星盘、宫位与流年节奏交织出更细腻的解释。',
    status: '筹备中',
    icon: StarIcon,
  },
  {
    title: '人格画像',
    description: '让动态问答与人格洞察结合成更安静的自我映照。',
    status: '已开放',
    icon: PalmIcon,
    href: '/mbti',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { navigateWithTransition } = usePageTransition();

  const handleNavigateToTarot = () => {
    navigateWithTransition(router, '/tarot', 'portal');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#b8956e]/12 bg-[rgba(10,12,18,0.72)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-[78px]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#b8956e]/20 bg-[radial-gradient(circle_at_35%_35%,rgba(184,149,110,0.28),rgba(38,31,24,0.92))] flex items-center justify-center shadow-[0_0_30px_rgba(184,149,110,0.12)]">
                <CrystalBallIcon size={18} className="text-[#e8d7be]" />
              </div>
              <div>
                <div className="luxury-metadata text-[10px] mb-1">AI Tarot Observatory</div>
                <span className="text-xl font-semibold text-white">AI 玄学洞见</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/tarot">
                    <Button variant="ghost" size="sm">塔罗牌</Button>
                  </Link>
                  <span className="text-copy-muted text-sm">{user?.email}</span>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">登录</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="secondary" size="sm">注册</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-[110px]">
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 lg:py-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <motion.div className="luxury-hero-glow" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="luxury-metadata text-xs mb-4">塔罗 · 神谕 · 个人洞见</div>
              <h1 className="text-5xl md:text-6xl xl:text-[72px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#f5ede0] mb-6 max-w-4xl">
                在静谧与象征之间，
                <span className="block bg-[linear-gradient(90deg,#f1e2c2,#b8956e,#8d75a8)] bg-clip-text text-transparent">
                  进入更深层的神谕界面。
                </span>
              </h1>

              <p className="text-lg md:text-[19px] text-copy-muted max-w-2xl leading-8 mb-8">
                用更安静的界面、更克制的语言和更沉浸的节奏，
                为你的问题留出一段值得进入的占卜体验。
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                {isAuthenticated ? (
                  <Button size="lg" onClick={handleNavigateToTarot} className="min-w-[180px]">
                    进入塔罗占卜
                  </Button>
                ) : (
                  <Link href="/register">
                    <Button size="lg" className="min-w-[180px]">立即进入</Button>
                  </Link>
                )}

                <Link href={isAuthenticated ? '/tarot' : '/login'}>
                  <Button variant="outline" size="lg" className="min-w-[180px]">
                    先看塔罗入口
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-copy-muted">
                <span>沉浸式抽牌</span>
                <span className="w-1 h-1 rounded-full bg-[#b8956e]/55" />
                <span>AI 辅助解读</span>
                <span className="w-1 h-1 rounded-full bg-[#b8956e]/55" />
                <span>历史记录留存</span>
              </div>
            </motion.div>

            <motion.div className="relative flex justify-center lg:justify-end" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1 }}>
              <div className="relative w-full max-w-[520px] aspect-[0.95] rounded-[36px] luxury-panel overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,149,110,0.12),transparent_28%),radial-gradient(circle_at_50%_58%,rgba(124,104,164,0.18),transparent_38%)]" />
                <div className="absolute inset-[12%] rounded-full border border-[#b8956e]/10" />
                <div className="absolute inset-[18%] rounded-full border border-[#b8956e]/14" />
                <div className="absolute inset-[24%] rounded-full border border-white/6" />
                <div className="absolute inset-[18%] ornamental-orbit animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[48%] aspect-square rounded-full border border-[#b8956e]/18 bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.08),rgba(24,18,13,0.18)_38%,rgba(14,12,18,0.92)_72%)] shadow-[0_0_80px_rgba(121,97,159,0.18)] flex items-center justify-center">
                    <HexagramIcon size={120} className="text-[#d9c2a0]/85" animated />
                  </div>
                </div>
                <div className="absolute top-[14%] left-[14%] luxury-panel-soft rounded-full px-4 py-2 flex items-center gap-2">
                  <MysticEyeIcon size={16} className="text-[#cdb08a]" />
                  <span className="text-xs text-copy-muted">Tarot Reading</span>
                </div>
                <div className="absolute bottom-[12%] right-[10%] luxury-panel-soft rounded-[20px] p-4 max-w-[210px]">
                  <div className="luxury-metadata text-[10px] mb-2">Session</div>
                  <p className="text-sm text-copy-muted leading-6">
                    让牌阵、问题与 AI 解读在同一段体验中自然展开。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <MysticDivider variant="stars" className="my-14 lg:my-16 max-w-5xl mx-auto" />

          <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-start">
            <Link href={isAuthenticated ? '/tarot' : '/login'} className="block">
              <Card hover variant="glow" className="rounded-[30px] p-8 lg:p-10 min-h-[320px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(184,149,110,0.10),transparent_22%),radial-gradient(circle_at_0%_100%,rgba(121,97,159,0.14),transparent_30%)]" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="luxury-metadata text-[11px] mb-3">Featured ritual</div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full border border-[#b8956e]/18 bg-[rgba(184,149,110,0.08)] flex items-center justify-center">
                        <CrystalBallIcon size={28} className="text-[#ddc7a4]" />
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-semibold text-[#f4ebdd]">AI 塔罗牌</h2>
                        <p className="text-copy-muted mt-1">当前唯一完整开放的核心体验</p>
                      </div>
                    </div>
                    <p className="text-base lg:text-lg leading-8 text-copy-muted max-w-2xl">
                      结合抽牌、牌阵结构与 AI 文本生成，为你提供更安静、更有节奏的个人提问体验。不是快速答案，而是一次有氛围的进入过程。
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-8">
                    <Button size="md">进入体验</Button>
                    <span className="luxury-panel-soft rounded-full px-4 py-2 text-sm text-copy-muted">支持三张牌与更多扩展牌阵</span>
                  </div>
                </div>
              </Card>
            </Link>

            <div className="grid gap-4">
              {futureFeatures.map((feature) => {
                const Icon = feature.icon;

                const content = (
                  <Card key={feature.title} variant="bordered" className="rounded-[24px] p-5 opacity-90">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full border border-[#b8956e]/16 bg-[rgba(184,149,110,0.06)] flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-[#cdb08a]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="text-lg font-medium text-parchment-100">{feature.title}</h3>
                          <span className="luxury-metadata text-[10px] whitespace-nowrap">{feature.status}</span>
                        </div>
                        <p className="text-sm text-copy-muted leading-6">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                );

                return feature.href ? <Link key={feature.title} href={feature.href}>{content}</Link> : content;
              })}
            </div>
          </section>
        </section>
      </main>

      <footer className="py-10 text-center text-sm text-copy-muted">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <p className="luxury-metadata text-[10px] mb-3">AI Observatory</p>
          <p>© 2026 AI 玄学洞见平台 ｜ 纯属娱乐，请理性看待</p>
        </div>
      </footer>
    </div>
  );
}
