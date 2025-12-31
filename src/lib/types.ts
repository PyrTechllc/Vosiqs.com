export type Video = {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  dataAiHint?: string;
  publishedAt?: string; // Add this too since youtube returns it and useful
};

export type Playlist = {
  name: string;
  description: string;
  prompt: string;
  videos: Video[];
};
