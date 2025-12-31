'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Video } from '@/lib/types';

interface PlayerModalProps {
  video: Video;
  onOpenChange: (isOpen: boolean) => void;
}

export function PlayerModal({ video, onOpenChange }: PlayerModalProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] p-0 border-0">
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.id.split('-')[0]}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-t-lg"
          ></iframe>
        </div>
        <DialogHeader className="p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-xl">{video.title}</DialogTitle>
          <DialogDescription>{video.channelTitle}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
