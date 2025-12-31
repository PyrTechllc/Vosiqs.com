'use client';
import Image from 'next/image';
import type { Video } from '@/lib/types';
import { ThumbsUp, MinusCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
  onRemove: () => void;
  onLike: () => void;
}

export function VideoCard({ video, onPlay, onRemove, onLike }: VideoCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
      role="button"
      onClick={onPlay}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPlay()}
    >
      <div className="relative aspect-video h-12 w-auto sm:h-14 overflow-hidden rounded-md shrink-0">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 100px"
              data-ai-hint={video.dataAiHint}
            />
          )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">{video.channelTitle}</p>
      </div>
      <div className="flex items-center gap-0 sm:gap-1 ml-auto">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" onClick={handleRemove}>
            <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" onClick={handleLike}>
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
        </Button>
      </div>
    </div>
  );
}
