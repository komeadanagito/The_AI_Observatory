'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      router.push('/tarot');
    } catch {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card variant="bordered" className="p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="text-4xl">🔮</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">
              欢迎回来
            </h1>
            <p className="text-gray-400">
              登录以继续探索玄学奥秘
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="邮箱"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="密码"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                />
                记住我
              </label>
              <Link
                href="/forgot-password"
                className="text-primary-400 hover:text-primary-300"
              >
                忘记密码？
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              登录
            </Button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center text-gray-400">
            还没有账号？{' '}
            <Link
              href="/register"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              立即注册
            </Link>
          </div>
        </Card>

        {/* 免责声明 */}
        <p className="mt-6 text-center text-xs text-gray-500">
          登录即表示您同意本平台仅供娱乐，不构成任何预测或决策依据
        </p>
      </motion.div>
    </div>
  );
}
