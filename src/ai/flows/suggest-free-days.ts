'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting potential free days based on historical data and common military leave schedules.
 *
 * - suggestFreeDays - The main function to trigger the free day suggestion process.
 * - SuggestFreeDaysInput - The input type for the suggestFreeDays function.
 * - SuggestFreeDaysOutput - The output type for the suggestFreeDays function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFreeDaysInputSchema = z.object({
  pastAvailabilityData: z
    .string()
    .describe(
      'Historical data of past availability, including dates and availability status (available/unavailable).' // Should this be more structured?
    ),
  commonMilitaryLeaveSchedules: z
    .string()
    .describe(
      'Information on common military leave schedules, including dates and durations.'
    ),
  numberOfSuggestions: z
    .number()
    .default(5)
    .describe('The number of free day suggestions to provide.'),
});
export type SuggestFreeDaysInput = z.infer<typeof SuggestFreeDaysInputSchema>;

const SuggestFreeDaysOutputSchema = z.object({
  suggestedFreeDays: z
    .array(z.string())
    .describe(
      'A list of suggested free days in ISO 8601 format (YYYY-MM-DD), considering past availability and common military leave schedules.'
    ),
  reasoning: z
    .string()
    .optional()
    .describe('Explanation for why these days were suggested.'),
});
export type SuggestFreeDaysOutput = z.infer<typeof SuggestFreeDaysOutputSchema>;

export async function suggestFreeDays(input: SuggestFreeDaysInput): Promise<SuggestFreeDaysOutput> {
  return suggestFreeDaysFlow(input);
}

const suggestFreeDaysPrompt = ai.definePrompt({
  name: 'suggestFreeDaysPrompt',
  input: {schema: SuggestFreeDaysInputSchema},
  output: {schema: SuggestFreeDaysOutputSchema},
  prompt: `You are an AI assistant helping an admin plan their availability by suggesting potential free days.

  Consider the following historical availability data:
  {{pastAvailabilityData}}

  Also, take into account these common military leave schedules:
  {{commonMilitaryLeaveSchedules}}

  Based on this information, suggest {{numberOfSuggestions}} potential free days.  Return the dates in ISO 8601 format (YYYY-MM-DD).
  Also include a brief "reasoning" for your suggestion.
`,
});

const suggestFreeDaysFlow = ai.defineFlow(
  {
    name: 'suggestFreeDaysFlow',
    inputSchema: SuggestFreeDaysInputSchema,
    outputSchema: SuggestFreeDaysOutputSchema,
  },
  async input => {
    const {output} = await suggestFreeDaysPrompt(input);
    return output!;
  }
);
