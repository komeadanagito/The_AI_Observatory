'use client';

import { useEffect, useRef, useCallback } from 'react';

interface WebGLStarfieldProps {
  starCount?: number;
  className?: string;
}

// 顶点着色器 - 处理星星位置和大小
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute float a_brightness;
  attribute float a_twinkleSpeed;
  attribute float a_twinklePhase;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  
  varying float v_brightness;
  
  void main() {
    // 计算闪烁
    float twinkle = sin(u_time * a_twinkleSpeed + a_twinklePhase);
    v_brightness = a_brightness + twinkle * 0.3;
    v_brightness = clamp(v_brightness, 0.1, 1.0);
    
    // 转换到裁剪空间
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_PointSize = a_size * (0.8 + twinkle * 0.2);
  }
`;

// 片段着色器 - 处理星星外观
const fragmentShaderSource = `
  precision mediump float;
  
  varying float v_brightness;
  
  void main() {
    // 计算到点中心的距离，实现圆形和柔和边缘
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // 柔和边缘
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    alpha *= v_brightness;
    
    // 星星颜色（白色带淡紫色光晕）
    vec3 color = mix(
      vec3(1.0, 1.0, 1.0),
      vec3(0.8, 0.7, 1.0),
      dist * 2.0
    );
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

/**
 * WebGL 星空背景
 * 真正的 GPU 渲染，性能最佳
 */
export function WebGLStarfield({
  starCount = 150,
  className = '',
}: WebGLStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS');
      return false;
    }

    glRef.current = gl;

    // 创建着色器程序
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return false;
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;
    
    programRef.current = program;
    gl.useProgram(program);

    // 生成星星数据
    const positions: number[] = [];
    const sizes: number[] = [];
    const brightnesses: number[] = [];
    const twinkleSpeeds: number[] = [];
    const twinklePhases: number[] = [];

    for (let i = 0; i < starCount; i++) {
      positions.push(Math.random() * canvas.width, Math.random() * canvas.height);
      sizes.push(Math.random() * 3 + 1);
      brightnesses.push(Math.random() * 0.5 + 0.4);
      twinkleSpeeds.push(Math.random() * 2 + 0.5);
      twinklePhases.push(Math.random() * Math.PI * 2);
    }

    // 创建并绑定缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 大小缓冲区
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
    
    const sizeLocation = gl.getAttribLocation(program, 'a_size');
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    // 亮度缓冲区
    const brightnessBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, brightnessBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(brightnesses), gl.STATIC_DRAW);
    
    const brightnessLocation = gl.getAttribLocation(program, 'a_brightness');
    gl.enableVertexAttribArray(brightnessLocation);
    gl.vertexAttribPointer(brightnessLocation, 1, gl.FLOAT, false, 0, 0);

    // 闪烁速度缓冲区
    const twinkleSpeedBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, twinkleSpeedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(twinkleSpeeds), gl.STATIC_DRAW);
    
    const twinkleSpeedLocation = gl.getAttribLocation(program, 'a_twinkleSpeed');
    gl.enableVertexAttribArray(twinkleSpeedLocation);
    gl.vertexAttribPointer(twinkleSpeedLocation, 1, gl.FLOAT, false, 0, 0);

    // 闪烁相位缓冲区
    const twinklePhaseBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, twinklePhaseBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(twinklePhases), gl.STATIC_DRAW);
    
    const twinklePhaseLocation = gl.getAttribLocation(program, 'a_twinklePhase');
    gl.enableVertexAttribArray(twinklePhaseLocation);
    gl.vertexAttribPointer(twinklePhaseLocation, 1, gl.FLOAT, false, 0, 0);

    // 启用混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }, [starCount]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    
    if (!gl || !program || !canvas) return;

    // 更新 uniform
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    
    const time = (Date.now() - startTimeRef.current) / 1000;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // 清空并绘制
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, starCount);

    animationRef.current = requestAnimationFrame(render);
  }, [starCount]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // 重新初始化（星星位置需要更新）
    if (glRef.current) {
      initWebGL();
    }
  }, [initWebGL]);

  useEffect(() => {
    const success = initWebGL();
    if (!success) return;

    handleResize();
    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initWebGL, handleResize, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

export default WebGLStarfield;
