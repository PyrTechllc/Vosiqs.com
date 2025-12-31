'use server';
/**
 * @fileOverview This file defines a Genkit flow that interprets a user's prompt to identify key genres, moods, and topics for generating a YouTube search query.
 *
 * - interpretPromptForYouTubeSearch - A function that takes a user prompt and returns an object containing the interpreted information (genres, moods, topics, and a refined search query).
 * - InterpretPromptInput - The input type for the interpretPromptForYouTubeSearch function, which is the user's prompt as a string.
 * - InterpretPromptOutput - The return type for the interpretPromptForYouTubeSearch function, which includes the interpreted genres, moods, topics, and a refined search query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterpretPromptInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt to interpret.'),
});
export type InterpretPromptInput = z.infer<typeof InterpretPromptInputSchema>;

const InterpretPromptOutputSchema = z.object({
  genres: z.array(z.string()).describe('The identified genres from the prompt.'),
  moods: z.array(z.string()).describe('The identified moods from the prompt.'),
  topics: z.array(z.string()).describe('The identified topics from the prompt.'),
  refinedQuery: z.string().describe('A refined search query for YouTube based on the interpreted information.'),
});
export type InterpretPromptOutput = z.infer<typeof InterpretPromptOutputSchema>;

export async function interpretPromptForYouTubeSearch(input: InterpretPromptInput): Promise<InterpretPromptOutput> {
  return interpretPromptFlow(input);
}

const interpretPrompt = ai.definePrompt({
  name: 'interpretPrompt',
  input: { schema: InterpretPromptInputSchema },
  output: { schema: InterpretPromptOutputSchema },
  prompt: `You are an AI assistant that interprets user prompts to identify key genres, moods, and topics for generating a YouTube search query.

Given the following prompt:

{{prompt}}

Identify the key genres, moods, and topics present in the prompt. Also, create a refined search query that can be used to search YouTube effectively.

Output the information as a JSON object with the following keys:

- genres: An array of strings representing the identified genres.
- moods: An array of strings representing the identified moods.
- topics: An array of strings representing the identified topics.
- refinedQuery: A string representing the refined search query.

Ensure the refined query is concise and relevant to the prompt.

Here is the JSON object:
`,
});

const interpretPromptFlow = ai.defineFlow(
  {
    name: 'interpretPromptFlow',
    inputSchema: InterpretPromptInputSchema,
    outputSchema: InterpretPromptOutputSchema,
  },
  async input => {
    const { output } = await interpretPrompt(input);
    return output!;
  }
);
