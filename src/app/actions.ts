'use server';

import { generatePlaylist } from '@/ai/flows/generate-playlist';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Playlist, Video } from '@/lib/types';
import { searchYouTube } from '@/lib/youtube';

// Mock YouTube Search
const mockYouTubeSearch = async (query: string): Promise<Video[]> => {
  console.log(`Searching YouTube with query: "${query}"`);

  // In a real app, you would use the YouTube Data API here.
  // For this MVP, we'll use placeholder images to simulate video results.
  // The results are shuffled to provide variety on re-rolls.
  const shuffledPlaceholders = [...PlaceHolderImages].sort(() => 0.5 - Math.random());

  return shuffledPlaceholders.slice(0, 12).map((p) => ({
    id: p.id + '-' + new Date().getTime(), // Add timestamp for unique key
    title: p.description,
    channelTitle: 'Vibe Master',
    thumbnailUrl: p.imageUrl,
    dataAiHint: p.imageHint,
  }));
};

export async function generatePlaylistAction(prompt: string): Promise<Playlist> {
  try {
    if (!prompt || prompt.trim().length < 5) {
      throw new Error('Please enter a more descriptive prompt.');
    }

    // Run the consolidated AI flow
    const result = await generatePlaylist({ prompt });

    // Use the refined query from AI to search for videos
    const videos = await searchYouTube(result.refinedQuery);
    // const videos = await mockYouTubeSearch(result.refinedQuery); // fallback for dev? No, we want real one.

    if (videos.length === 0) {
      throw new Error("Couldn't find any videos for that vibe. Try something else!");
    }

    return {
      name: result.name,
      description: result.description,
      prompt,
      videos,
    };

  } catch (error) {
    console.error('Error generating playlist:', error);
    // Provide a more user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error('You have exceeded the request limit. Please try again later.');
      }
      throw new Error(`Failed to generate playlist: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating your playlist.');
  }
}
