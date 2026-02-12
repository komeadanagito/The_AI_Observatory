import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WebGLStarfield } from "@/components/effects/WebGLStarfield";
import { CSSParticles } from "@/components/effects/CSSStarfield";
import { TransitionOverlay } from "@/components/effects/TransitionOverlay";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI 玄学洞见平台",
  description: "AI 驱动的玄学解读平台，提供塔罗牌、中式算命、星座、MBTI 等个性化解读服务。纯属娱乐，不构成任何预测或决策依据。",
  keywords: ["AI", "塔罗牌", "占卜", "星座", "MBTI", "娱乐"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          {/* WebGL 星空背景 - 真正 GPU 渲染，最佳性能 */}
          <WebGLStarfield starCount={120} />
          
          {/* CSS 漂浮尘埃 - 营造古老空间氛围 */}
          <CSSParticles particleCount={12} />
          
          {/* 全局转场遮罩 */}
          <TransitionOverlay />
          
          {/* 主内容 */}
          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
