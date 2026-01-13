'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratePlaylistInput {
  prompt: string;
  userContext?: string;
}

export interface GeneratePlaylistOutput {
  name: string;
  description: string;
  refinedQuery: string;
}

export async function generatePlaylist(
  input: GeneratePlaylistInput
): Promise<GeneratePlaylistOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const promptText = `You are an AI playlist curator. Based on the user's prompt and optional history context, you need to generate three things:
1. A unique, catchy name for the playlist.
2. A short, descriptive summary of the playlist's content and vibe.
3. A refined, concise search query for finding relevant videos on YouTube.

User Prompt: ${input.prompt}
User History Context: ${input.userContext || 'None provided'}

If user history context is provided (which may include liked videos and subscribed channels), strongly consider it to tailor the "vibe" and recommendations.
- For example, if the user subscribes to many Jazz channels, and asks for "relaxing music", lean towards Jazz.
- However, do not strictly limit to only these if the prompt explicitly asks for something different.
- Use the context to infer taste and preferences.

Generate the output in the following JSON format:
{
  "name": "Playlist Name Here",
  "description": "Short description of the playlist vibe and content",
  "refinedQuery": "search query for YouTube"
}

IMPORTANT: Return ONLY the JSON object, no additional text.`;

  const result = await model.generateContent(promptText);
  const response = result.response;
  const text = response.text();

  // Parse the JSON response
  try {
    // Remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      name: parsed.name || 'Untitled Playlist',
      description: parsed.description || 'A curated playlist',
      refinedQuery: parsed.refinedQuery || input.prompt,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', text);
    throw new Error('The AI returned an invalid response. Please try again.');
  }
}
