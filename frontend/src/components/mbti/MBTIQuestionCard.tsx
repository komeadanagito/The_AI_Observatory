'use client';

import { MBTIQuestion } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MBTIQuestionCardProps {
  question: MBTIQuestion;
  selectedOption: string | null;
  isSubmitting: boolean;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
}

export function MBTIQuestionCard({
  question,
  selectedOption,
  isSubmitting,
  onSelect,
  onSubmit,
}: MBTIQuestionCardProps) {
  return (
    <Card variant="glow" className="rounded-[30px] p-8 lg:p-10">
      <div className="luxury-metadata text-[10px] mb-4">Question · {question.dimension}</div>
      <h2 className="text-2xl md:text-3xl font-semibold text-parchment-100 leading-tight mb-8">
        {question.question_text}
      </h2>

      <div className="space-y-4 mb-8">
        {question.options.map((option) => {
          const isActive = selectedOption === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full text-left rounded-[22px] px-5 py-4 transition-all border ${
                isActive
                  ? 'border-[#b8956e]/45 bg-[rgba(184,149,110,0.08)] shadow-[0_0_0_1px_rgba(184,149,110,0.12)]'
                  : 'border-white/8 bg-[rgba(20,23,34,0.65)] hover:border-[#b8956e]/20'
              }`}
            >
              <div className="text-parchment-100 leading-7">{option.text}</div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSubmit} disabled={!selectedOption || isSubmitting} isLoading={isSubmitting}>
          提交这一题
        </Button>
      </div>
    </Card>
  );
}

export default MBTIQuestionCard;
