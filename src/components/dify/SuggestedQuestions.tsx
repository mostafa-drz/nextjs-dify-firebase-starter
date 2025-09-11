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

export function SuggestedQuestions({
  questions,
  onQuestionSelect,
  loading,
}: SuggestedQuestionsProps) {
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
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm font-medium">Suggested questions</span>
        </div>

        <div className="space-y-2">
          {questions.slice(0, 3).map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="hover:bg-muted/50 h-auto w-full justify-start p-3 text-left"
              onClick={() => handleQuestionClick(question, index)}
              disabled={loading || selectedIndex === index}
            >
              {loading && selectedIndex === index ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
