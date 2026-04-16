'use client';

import { MBTIProgress as ProgressState } from '@/lib/api';

export function MBTIProgress({ progress }: { progress: ProgressState }) {
  const ratio = Math.min(progress.answered / progress.max_questions, 1);

  return (
    <div className="luxury-panel-soft rounded-[22px] p-4">
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="luxury-metadata text-[10px]">MBTI Session</span>
        <span className="text-copy-muted">已完成 {progress.answered} / {progress.max_questions}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#8d75a8,#b8956e)] transition-all duration-500"
          style={{ width: `${Math.max(ratio * 100, 8)}%` }}
        />
      </div>
      <p className="text-sm text-copy-muted">动态题量范围 {progress.min_questions}-{progress.max_questions} 题，系统会根据当前信息决定是否继续。</p>
    </div>
  );
}

export default MBTIProgress;
