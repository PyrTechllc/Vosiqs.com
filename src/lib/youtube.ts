
export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    description: string;
    publishedAt: string;
}

export async function searchYouTube(query: string, maxResults = 12): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.warn('YOUTUBE_API_KEY is not set.');
        // Return empty array or throw?
        // For now, return empty array to avoid crashing, but log error.
        return [];
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('type', 'video');
    url.searchParams.append('videoEmbeddable', 'true');
    url.searchParams.append('key', apiKey);

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('YouTube API Error:', response.status, errorData);
            throw new Error(`YouTube API returned ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: any) => ({
            id: item.id?.videoId || '',
            title: item.snippet?.title || '',
            channelTitle: item.snippet?.channelTitle || '',
            thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
            description: item.snippet?.description || '',
            publishedAt: item.snippet?.publishedAt || '',
        })).filter((v: YouTubeVideo) => v.id);
    } catch (error) {
        console.error('Error searching YouTube:', error);
        throw error;
    }
}
