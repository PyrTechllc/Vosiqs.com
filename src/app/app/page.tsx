'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/vosiqs/AppLayout';
import { PromptForm } from '@/components/vosiqs/PromptForm';
import { PlaylistView } from '@/components/vosiqs/PlaylistView';
import { PlayerModal } from '@/components/vosiqs/PlayerModal';
import type { Playlist, Video } from '@/lib/types';
import { generatePlaylistAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { checkAndIncrementUsage, savePlaylist } from '@/lib/firestore-utils';

const VosiqsLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center p-1.5">
      <div className="grid grid-cols-2 gap-1">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-primary-foreground/70 rounded-sm"></div>
        <div className="w-3 h-3 md:w-4 md:h-4 bg-primary-foreground/70 rounded-sm"></div>
        <div className="w-3 h-3 md:w-4 md:h-4 bg-primary-foreground/70 rounded-sm col-span-2 mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function AppPage() {
  const [prompt, setPrompt] = useState('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [rerollCount, setRerollCount] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const playlistToEditJson = sessionStorage.getItem('vosiqs-edit-playlist');
    if (playlistToEditJson) {
      try {
        const playlistToEdit = JSON.parse(playlistToEditJson);
        setPlaylist(playlistToEdit);
        setPrompt(playlistToEdit.prompt);
        sessionStorage.removeItem('vosiqs-edit-playlist');
      } catch (e) {
        console.error("Failed to parse playlist from sessionStorage", e);
        sessionStorage.removeItem('vosiqs-edit-playlist');
      }
    }
  }, []);

  const handleGeneratePlaylist = async (currentPrompt: string) => {
    if (!currentPrompt) return;

    if (user) {
      try {
        await checkAndIncrementUsage(user.uid, 'prompt');
      } catch (e: any) {
        toast({ variant: "destructive", title: "Limit Reached", description: e.message });
        return;
      }
    } else {
      // Guest usage tracking
      const GUEST_LIMIT = 10;
      const SEVEN_HOURS = 7 * 60 * 60 * 1000;
      const now = Date.now();

      const usageJson = localStorage.getItem('vosiqs_guest_usage');
      let usage = usageJson ? JSON.parse(usageJson) : { count: 0, lastReset: now };

      if (now - usage.lastReset > SEVEN_HOURS) {
        usage = { count: 1, lastReset: now };
      } else {
        if (usage.count >= GUEST_LIMIT) {
          const nextAvailable = usage.lastReset + SEVEN_HOURS;
          const waitMs = nextAvailable - now;
          const waitHours = Math.floor(waitMs / (1000 * 60 * 60));
          const waitMins = Math.ceil((waitMs % (1000 * 60 * 60)) / (1000 * 60));

          toast({
            variant: "destructive",
            title: "Guest Limit Reached",
            description: `You've used ${GUEST_LIMIT} free prompts as a guest. Please sign in to save prompts or wait ${waitHours}h ${waitMins}m.`
          });
          return;
        }
        usage.count += 1;
      }
      localStorage.setItem('vosiqs_guest_usage', JSON.stringify(usage));
    }

    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    setPrompt(currentPrompt);

    try {
      const token = sessionStorage.getItem('youtube_access_token') || undefined;
      const result = await generatePlaylistAction(currentPrompt, token);
      setPlaylist(result);
      setRerollCount(0);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || 'Failed to generate playlist.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReroll = async () => {
    if (rerollCount < 3) {
      try {
        // Increment reroll usage locally or remotely if we tracked it per user
        // The requirements say "3 re-rolls per prompt" which is local session.
        // But "limit 10 prompts" is global.
        setRerollCount(prev => prev + 1);

        // We re-call action but maybe bypass prompt usage increment?
        // generatePlaylistAction calls AI + search.
        // We should probably NOT charge a "prompt" credit for a reroll, or maybe we do?
        // Usually reroll is cheaper or free if limited per prompt.
        // I will just call the action again.

        setIsLoading(true);
        const token = sessionStorage.getItem('youtube_access_token') || undefined;
        const result = await generatePlaylistAction(prompt, token);
        setPlaylist(result);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Limit Reached',
        description: 'Upgrade to Vosiqs+ for unlimited re-rolls.',
      });
    }
  };

  const handleLikeVideo = (video: Video) => {
    toast({
      title: 'Noted!',
      description: `We'll remember you liked "${video.title}".`
    });
  };

  const handleSavePlaylist = async () => {
    if (!playlist) return;
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to save playlists to your library." });
      return;
    }
    try {
      await savePlaylist(user.uid, playlist);
      toast({
        title: "Playlist Saved!",
        description: `"${playlist.name}" has been added to your library.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message
      });
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    setPlaylist(prevPlaylist => {
      if (!prevPlaylist) return null;
      return {
        ...prevPlaylist,
        videos: prevPlaylist.videos.filter(video => video.id !== videoId),
      };
    });
  };

  const handleCancelPlaylist = () => {
    setPlaylist(null);
    setPrompt('');
  };

  const InitialState = () => (
    <div className="text-center animate-in fade-in-50 duration-500">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
            What do you want to watch?
          </h1>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
      <div className='flex justify-center'>
        <VosiqsLogo />
      </div>
      <div className="space-y-4">
        <div className="bg-primary/90 text-primary-foreground p-4 rounded-xl max-w-md ml-auto shadow-lg">
          <p>{prompt}</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <div className="bg-muted text-muted-foreground p-4 rounded-xl max-w-md shadow-md">
            <p className="animate-pulse">Here's a playlist that...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (error) {
      return <div className="text-center text-destructive p-4 bg-destructive/10 rounded-lg">{error}</div>;
    }
    if (playlist) {
      return (
        <PlaylistView
          playlist={playlist}
          onReroll={handleReroll}
          onSave={handleSavePlaylist}
          onPlayVideo={setPlayingVideo}
          onRemoveVideo={handleRemoveVideo}
          onCancel={handleCancelPlaylist}
          onLikeVideo={handleLikeVideo}
          rerollCount={rerollCount}
        />
      );
    }
    return <InitialState />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col w-full h-full">
        <div className="w-full flex-grow flex items-center justify-center p-4">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {renderContent()}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
          <Card className='h-24 flex items-center justify-center'>
            <span className='text-muted-foreground'>Ad Banner</span>
          </Card>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-yellow-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse-slow"></div>
            <div className="relative">
              <PromptForm
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleGeneratePlaylist}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {playingVideo && (
          <PlayerModal
            video={playingVideo}
            onOpenChange={(isOpen) => !isOpen && setPlayingVideo(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
