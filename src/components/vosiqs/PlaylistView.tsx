'use client';
import type { Playlist, Video } from '@/lib/types';
import { VideoCard } from './VideoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface PlaylistViewProps {
  playlist: Playlist;
  onReroll: () => void;
  onSave: () => void;
  onPlayVideo: (video: Video) => void;
  onRemoveVideo: (videoId: string) => void;
  onLikeVideo: (video: Video) => void;
  onCancel: () => void;
  rerollCount: number;
}

const MAX_REROLLS = 3;

export function PlaylistView({ playlist, onReroll, onSave, onPlayVideo, onRemoveVideo, onLikeVideo, onCancel, rerollCount }: PlaylistViewProps) {
  const rerollsLeft = MAX_REROLLS - rerollCount;
  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 w-full max-w-3xl mx-auto">
      <div className="space-y-2 text-center relative">
        <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl font-headline">{playlist.name}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{playlist.videos.length} videos</p>
        <div className="absolute top-0 right-0">
            <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-lg">
                <X className="h-5 w-5" />
                <span className="sr-only">Cancel</span>
            </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
            <div className="space-y-2">
                {playlist.videos.map((video) => (
                    <VideoCard 
                        key={video.id} 
                        video={video} 
                        onPlay={() => onPlayVideo(video)} 
                        onRemove={() => onRemoveVideo(video.id)}
                        onLike={() => onLikeVideo(video)}
                    />
                ))}
            </div>
        </CardContent>
      </Card>
      
      <div className='space-y-4'>
        <div className="bg-primary/90 text-primary-foreground p-4 rounded-xl text-center shadow-lg text-sm sm:text-base">
            <p>{playlist.description}</p>
        </div>
        <div className="flex justify-center flex-wrap gap-2 pt-2">
            <Button
                variant="secondary"
                onClick={onReroll}
                disabled={rerollsLeft <= 0}
                className="bg-primary/20 text-primary-foreground hover:bg-primary/30 rounded-lg px-4 py-2 sm:px-6 sm:py-4"
            >
                Re-roll
            </Button>
            <Button onClick={onSave} className='rounded-lg px-4 py-2 sm:px-6 sm:py-4'>Create</Button>
        </div>
        {rerollsLeft <= 1 && (
            <p className='text-xs text-center text-muted-foreground'>
                {rerollsLeft > 0 ? `You have ${rerollsLeft} re-roll left.` : "You've used all your re-rolls."}
            </p>
        )}
      </div>
    </div>
  );
}
