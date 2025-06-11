'use server';
/**
 * @fileOverview Retrieves detailed information about a food ingredient.
 *
 * - getIngredientDetails - A function that fetches details for a given ingredient.
 * - GetIngredientDetailsInput - The input type for the getIngredientDetails function.
 * - GetIngredientDetailsOutput - The return type for the getIngredientDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetIngredientDetailsInputSchema = z.object({
  ingredientName: z.string().describe('The name of the food ingredient.'),
});
export type GetIngredientDetailsInput = z.infer<typeof GetIngredientDetailsInputSchema>;

const GetIngredientDetailsOutputSchema = z.object({
  description: z.string().describe('A concise description of what the ingredient is.'),
  usageOrPreparation: z.string().describe("Information on how the ingredient is commonly used or prepared. If it's a processed ingredient that can be made at home (e.g., a sauce), provide a simple method. If it's a raw ingredient (e.g., flour, sugar), describe its common uses."),
  youtubeVideoUrl: z.string().optional().describe('An optional, full embeddable YouTube video URL (e.g., https://www.youtube.com/embed/VIDEO_ID) showing how to make or use the ingredient. If no suitable video is found, this field should be omitted from the JSON output.'),
});
export type GetIngredientDetailsOutput = z.infer<typeof GetIngredientDetailsOutputSchema>;

export async function getIngredientDetails(input: GetIngredientDetailsInput): Promise<GetIngredientDetailsOutput> {
  return getIngredientDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getIngredientDetailsPrompt',
  input: {schema: GetIngredientDetailsInputSchema},
  output: {schema: GetIngredientDetailsOutputSchema},
  prompt: `You are a culinary expert and food content creator.
Given the ingredient name: {{{ingredientName}}}

Provide the following information:
1.  description: A concise description of what the ingredient is.
2.  usageOrPreparation: Information on how the ingredient is commonly used or prepared. If it's a processed ingredient that can be made at home (e.g., a sauce), provide a simple method. If it's a raw ingredient (e.g., flour, sugar), describe its common uses. This section should be informative and practical.
3.  youtubeVideoUrl: Optionally, suggest a relevant YouTube video URL that shows how to make or use this ingredient. Provide a full embeddable YouTube URL (e.g., https://www.youtube.com/embed/VIDEO_ID). If no specific video comes to mind or is suitable, ensure this field is omitted from the JSON output.

Respond in the format specified by the output schema. Ensure the output is well-formatted and ready for display.
`,
});

const getIngredientDetailsFlow = ai.defineFlow(
  {
    name: 'getIngredientDetailsFlow',
    inputSchema: GetIngredientDetailsInputSchema,
    outputSchema: GetIngredientDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
