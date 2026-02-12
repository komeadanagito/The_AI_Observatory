/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 允许本地图片优化
    unoptimized: false,
    // 配置图片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // API 代理现在通过 app/api/[...path]/route.ts 实现
  // 支持 SSE 流式响应，ngrok 免费版只需暴露前端端口
};

export default nextConfig;
