'use client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { FormEvent } from 'react';

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptForm({ prompt, setPrompt, onSubmit, isLoading }: PromptFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Start directing"
          className="min-h-[60px] md:min-h-[80px] text-base md:text-lg p-4 pr-16 rounded-xl shadow-inner bg-background/80 resize-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="absolute top-0 right-0 bottom-0 flex items-center pr-3">
          <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()} className="h-10 w-10 rounded-full">
            <Play className='fill-primary-foreground' />
            <span className="sr-only">Generate</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
