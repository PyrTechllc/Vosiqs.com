'use server';

import { generatePlaylist, curatePlaylistFromVideos } from '@/ai/flows/generate-playlist';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Playlist, Video } from '@/lib/types';
import { searchYouTube, getUserContext } from '@/lib/youtube';

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

export async function generatePlaylistAction(prompt: string, youtubeToken?: string): Promise<Playlist | { error: string }> {
  try {
    if (!prompt || prompt.trim().length < 5) {
      return { error: 'Please enter a more descriptive prompt.' };
    }

    console.log('=== Starting Playlist Generation ===');
    console.log('Prompt:', prompt);

    // Optionally fetch user history context if token is provided
    let userContext = '';
    if (youtubeToken) {
      try {
        userContext = await getUserContext(youtubeToken);
        console.log('--- User Context for AI ---', userContext);
      } catch (contextError) {
        console.warn('Failed to fetch user context:', contextError);
        // Continue without context
      }
    }

    // Step 1: Generate initial search query using AI
    let initialResult;
    try {
      console.log('Step 1: Generating refined search query...');
      initialResult = await generatePlaylist({ prompt, userContext });
      console.log('Refined query:', initialResult.refinedQuery);
    } catch (aiError: any) {
      console.error('AI Generation Error:', aiError);
      return { error: `AI Error: ${aiError.message || 'Failed to generate playlist concept.'}` };
    }

    // Step 2: Fetch MORE videos from YouTube (we'll get ~30-50 so AI can curate the best ones)
    let ytVideos = [];
    try {
      console.log('Step 2: Fetching YouTube videos with query:', initialResult.refinedQuery);
      ytVideos = await searchYouTube(initialResult.refinedQuery, 50, youtubeToken);
      console.log(`Found ${ytVideos.length} videos from YouTube`);
    } catch (ytError: any) {
      console.error('YouTube Search Error:', ytError);
      return { error: `YouTube Error: ${ytError.message || 'Failed to find videos.'}` };
    }

    if (!ytVideos || ytVideos.length === 0) {
      return { error: "Couldn't find any videos for that vibe. Try something else!" };
    }

    // Step 3: Let AI analyze and curate the best videos
    let curatedResult;
    try {
      console.log('Step 3: AI curating videos based on titles and descriptions...');
      const videoInfo = ytVideos.map(v => ({
        id: v.id,
        title: v.title,
        channelTitle: v.channelTitle,
        description: v.description,
      }));

      curatedResult = await curatePlaylistFromVideos({
        prompt,
        userContext,
        videos: videoInfo,
      });

      console.log('AI selected', curatedResult.selectedVideoIds.length, 'videos');
      console.log('Playlist name:', curatedResult.name);
    } catch (curateError: any) {
      console.error('AI Curation Error:', curateError);
      // Fallback: use the first 12 videos if AI curation fails
      console.log('Falling back to first 12 videos');
      const fallbackVideos = ytVideos.slice(0, 12).map(v => ({
        id: v.id,
        title: v.title,
        channelTitle: v.channelTitle,
        thumbnailUrl: v.thumbnailUrl,
        publishedAt: v.publishedAt,
      }));

      return {
        name: initialResult.name,
        description: initialResult.description,
        prompt,
        videos: fallbackVideos,
      };
    }

    // Step 4: Build final playlist with selected videos in order
    const selectedVideos = curatedResult.selectedVideoIds
      .map(id => ytVideos.find(v => v.id === id))
      .filter((v): v is NonNullable<typeof v> => v !== undefined)
      .map(v => ({
        id: v.id,
        title: v.title,
        channelTitle: v.channelTitle,
        thumbnailUrl: v.thumbnailUrl,
        publishedAt: v.publishedAt,
      }));

    if (selectedVideos.length === 0) {
      return { error: "AI couldn't select appropriate videos. Try a different prompt!" };
    }

    console.log('=== Playlist Generation Complete ===');
    console.log('Final video count:', selectedVideos.length);

    return {
      name: curatedResult.name,
      description: curatedResult.description,
      prompt,
      videos: selectedVideos,
    };

  } catch (error: any) {
    console.error('SERVER ACTION CRITICAL ERROR:', {
      message: error?.message,
      stack: error?.stack,
    });
    return { error: `System Error: ${error?.message || 'Something went wrong.'}` };
  }
}
