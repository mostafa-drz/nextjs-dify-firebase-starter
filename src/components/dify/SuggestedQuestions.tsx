'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionSelect: (question: string) => void;
  loading?: boolean;
}

export function SuggestedQuestions({ questions, onQuestionSelect, loading }: SuggestedQuestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleQuestionClick = (question: string, index: number) => {
    setSelectedIndex(index);
    onQuestionSelect(question);
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Suggested questions
          </span>
        </div>
        
        <div className="space-y-2">
          {questions.slice(0, 3).map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
              onClick={() => handleQuestionClick(question, index)}
              disabled={loading || selectedIndex === index}
            >
              {loading && selectedIndex === index ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <span className="text-sm">{question}</span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
