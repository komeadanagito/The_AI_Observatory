'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    // 验证密码
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    if (password.length < 8) {
      setLocalError('密码至少需要 8 个字符');
      return;
    }

    try {
      await register(email, password);
      router.push('/tarot');
    } catch {
      // 错误已在 store 中处理
    }
  };

  const displayError = localError || error;

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
              <span className="text-4xl">✨</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">
              创建账号
            </h1>
            <p className="text-gray-400">
              开启你的玄学探索之旅
            </p>
          </div>

          {/* 错误提示 */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {displayError}
            </motion.div>
          )}

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="至少 8 个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              label="确认密码"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agree"
                required
                className="mt-1 mr-2 rounded border-gray-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="agree" className="text-sm text-gray-400">
                我已阅读并同意，本平台所有内容
                <span className="text-gold-400">纯属娱乐</span>
                ，不构成任何预测、建议或决策依据
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              创建账号
            </Button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center text-gray-400">
            已有账号？{' '}
            <Link
              href="/login"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              立即登录
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
