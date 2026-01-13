
export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    description: string;
    publishedAt: string;
}

export async function searchYouTube(query: string, maxResults = 12, accessToken?: string): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey && !accessToken) {
        console.warn('YOUTUBE_API_KEY and accessToken are both missing.');
        return [];
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('type', 'video');
    url.searchParams.append('videoEmbeddable', 'true');

    if (apiKey) url.searchParams.append('key', apiKey);

    try {
        const headers: HeadersInit = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(url.toString(), { headers });

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


async function getLikedVideos(accessToken: string): Promise<string> {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.append('myRating', 'like');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('maxResults', '5');

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) return '';

        const data = await response.json();
        if (!data.items || data.items.length === 0) return '';

        const videos = data.items.map((item: any) => item.snippet.title).join(', ');
        return `User recently liked: ${videos}`;
    } catch (e) {
        console.error('Failed to fetch liked videos:', e);
        return '';
    }
}

async function getSubscriptions(accessToken: string): Promise<string> {
    const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('mine', 'true');
    url.searchParams.append('maxResults', '10');

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) return '';

        const data = await response.json();
        if (!data.items || data.items.length === 0) return '';

        const channels = data.items.map((item: any) => item.snippet.title).join(', ');
        return `User is subscribed to: ${channels}`;
    } catch (e) {
        console.error('Failed to fetch subscriptions:', e);
        return '';
    }
}

export async function getUserContext(accessToken: string): Promise<string> {
    try {
        const [likes, subs] = await Promise.all([
            getLikedVideos(accessToken),
            getSubscriptions(accessToken)
        ]);

        const parts = [];
        if (likes) parts.push(likes);
        if (subs) parts.push(subs);

        return parts.join('\n');
    } catch (error) {
        console.error('Error fetching user context:', error);
        return '';
    }
}
