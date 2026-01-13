'use server';

/**
 * @fileOverview A Genkit flow that generates all necessary playlist information from a user prompt.
 *
 * - generatePlaylist - A function that generates playlist metadata and a search query.
 * - GeneratePlaylistInput - The input type for the generatePlaylist function.
 * - GeneratePlaylistOutput - The return type for the generatePlaylist function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePlaylistInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt to generate a playlist for.'),
  userContext: z.string().optional().describe('Optional context about the user\'s preferences or history.'),
});
export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistInputSchema>;

const GeneratePlaylistOutputSchema = z.object({
  name: z.string().describe('A unique name for the playlist based on the prompt.'),
  description: z.string().describe('A short descriptive summary of the playlist content and vibe.'),
  refinedQuery: z.string().describe('A refined search query for YouTube based on the prompt.'),
});
export type GeneratePlaylistOutput = z.infer<typeof GeneratePlaylistOutputSchema>;

export async function generatePlaylist(
  input: GeneratePlaylistInput
): Promise<GeneratePlaylistOutput> {
  return generatePlaylistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlaylistPrompt',
  input: { schema: GeneratePlaylistInputSchema },
  output: { schema: GeneratePlaylistOutputSchema },
  prompt: `You are an AI playlist curator. Based on the user's prompt and optional history context, you need to generate three things:
1.  A unique, catchy name for the playlist.
2.  A short, descriptive summary of the playlist's content and vibe.
3.  A refined, concise search query for finding relevant videos on YouTube.

User Prompt: {{{prompt}}}
User History Context: {{{userContext}}}

If user history context is provided (which may include liked videos and subscribed channels), strongly consider it to tailor the "vibe" and recommendations.
- For example, if the user subscribes to many Jazz channels, and asks for "relaxing music", lean towards Jazz.
- However, do not strictly limit to only these if the prompt explicitly asks for something different.
- Use the context to infer taste and preferences.

Generate the output in the requested JSON format.`,
});

const generatePlaylistFlow = ai.defineFlow(
  {
    name: 'generatePlaylistFlow',
    inputSchema: GeneratePlaylistInputSchema,
    outputSchema: GeneratePlaylistOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a valid playlist response. Please try again or rephrase your prompt.');
    }
    return output;
  }
);
