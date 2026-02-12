/**
 * API 代理路由
 * 
 * 将所有 /api/* 请求代理到后端，支持流式响应 (SSE)
 * 这样 ngrok 免费版只需要暴露前端一个端口
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function proxyRequest(request: NextRequest, method: string) {
  const url = new URL(request.url);
  // 获取 /api 后面的路径
  const path = url.pathname;
  const targetUrl = `${BACKEND_URL}${path}${url.search}`;

  // 准备请求头
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // 跳过一些不需要转发的头
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // 构建请求选项
  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // 对于有请求体的方法，转发请求体
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      fetchOptions.body = await request.text();
    } else {
      fetchOptions.body = await request.arrayBuffer();
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // 检查是否是流式响应 (SSE)
    const contentType = response.headers.get('content-type');
    const isSSE = contentType?.includes('text/event-stream');

    if (isSSE && response.body) {
      // 流式响应：直接转发流
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // 跳过一些不需要转发的头
        if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });
      
      // 确保 SSE 相关头正确设置
      responseHeaders.set('Content-Type', 'text/event-stream');
      responseHeaders.set('Cache-Control', 'no-cache');
      responseHeaders.set('Connection', 'keep-alive');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // 非流式响应：正常转发
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Backend service unavailable', detail: String(error) },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

// 配置：禁用 body 解析，以支持流式请求
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
