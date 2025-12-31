'use client';

import { AppLayout } from '@/components/vosiqs/AppLayout';
import { LibraryPlaylistItem } from '@/components/vosiqs/LibraryPlaylistItem';
import type { Playlist } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { getPlaylists, deletePlaylist } from '@/lib/firestore-utils';

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useUser();
  const [playlists, setPlaylists] = useState<(Playlist & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      if (!user) return;
      try {
        const data = await getPlaylists(user.uid);
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load library.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      if (user) {
        fetchPlaylists();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading]);

  const handleEdit = (playlist: Playlist) => {
    sessionStorage.setItem('vosiqs-edit-playlist', JSON.stringify(playlist));
    router.push('/app');
  };

  const handleShare = (playlist: Playlist & { id: string }) => {
    const shareLink = `${window.location.origin}/app/playlist/${playlist.id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'Playlist link copied to your clipboard.',
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not copy link to clipboard.',
      });
    });
  };

  const handleDelete = async (playlist: Playlist & { id: string }) => {
    if (!user) return;
    try {
      await deletePlaylist(user.uid, playlist.id);
      setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
      toast({
        title: 'Deleted',
        description: `"${playlist.name}" has been removed.`,
      });
    } catch (error) {
      console.error("Failed to delete playlist", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete playlist.',
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">My Library</h1>

        {!user && !isAuthLoading && (
          <div className="text-center p-8 bg-muted rounded-xl">
            <p>Please sign in to view your saved playlists.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-12">
            <p className="animate-pulse">Loading library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.length === 0 && user && (
              <div className="col-span-full text-center p-12 text-muted-foreground">
                No saved playlists yet. Create one!
              </div>
            )}
            {playlists.map((playlist) => (
              <LibraryPlaylistItem
                key={playlist.id}
                playlist={playlist}
                onEdit={() => handleEdit(playlist)}
                onShare={() => handleShare(playlist)}
                onDelete={() => handleDelete(playlist)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
