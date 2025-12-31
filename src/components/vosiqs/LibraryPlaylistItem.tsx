'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Playlist } from '@/lib/types';
import { Play, Share2, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface LibraryPlaylistItemProps {
    playlist: Playlist & { id: string };
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
}

export function LibraryPlaylistItem({ playlist, onEdit, onShare, onDelete }: LibraryPlaylistItemProps) {
    const thumbnail = playlist.videos[0]?.thumbnailUrl || '/placeholder.jpg';

    return (
        <Card className="overflow-hidden flex flex-col group h-full">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={thumbnail}
                    alt={playlist.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={onEdit} variant="secondary" size="icon" className="rounded-full w-12 h-12">
                        <Play className="w-6 h-6 ml-1" />
                        <span className="sr-only">Play</span>
                    </Button>
                </div>
            </div>
            <CardHeader className="p-4">
                <CardTitle className="line-clamp-1">{playlist.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5em]">{playlist.description}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">{playlist.videos.length} videos</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2 justify-end border-t bg-muted/20 mt-auto">
                <Button variant="ghost" size="icon" onClick={onShare} title="Share Link">
                    <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Delete">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
