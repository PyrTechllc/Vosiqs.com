'use server';

/**
 * @fileOverview A Genkit flow that generates playlist metadata (name and description) from a user prompt.
 *
 * - generatePlaylistMetadata - A function that generates playlist metadata.
 * - GeneratePlaylistMetadataInput - The input type for the generatePlaylistMetadata function.
 * - GeneratePlaylistMetadataOutput - The return type for the generatePlaylistMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlaylistMetadataInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt to generate a playlist for.'),
});
export type GeneratePlaylistMetadataInput = z.infer<typeof GeneratePlaylistMetadataInputSchema>;

const GeneratePlaylistMetadataOutputSchema = z.object({
  name: z.string().describe('A unique name for the playlist based on the prompt.'),
  description: z.string().describe('A short descriptive summary of the playlist content and vibe.'),
});
export type GeneratePlaylistMetadataOutput = z.infer<typeof GeneratePlaylistMetadataOutputSchema>;

export async function generatePlaylistMetadata(
  input: GeneratePlaylistMetadataInput
): Promise<GeneratePlaylistMetadataOutput> {
  return generatePlaylistMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlaylistMetadataPrompt',
  input: {schema: GeneratePlaylistMetadataInputSchema},
  output: {schema: GeneratePlaylistMetadataOutputSchema},
  prompt: `You are an AI playlist curator. Generate a unique name and a short descriptive summary for a playlist based on the following user prompt.\n\nPrompt: {{{prompt}}}\n\nName: \nDescription: `,
});

const generatePlaylistMetadataFlow = ai.defineFlow(
  {
    name: 'generatePlaylistMetadataFlow',
    inputSchema: GeneratePlaylistMetadataInputSchema,
    outputSchema: GeneratePlaylistMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
