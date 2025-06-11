'use server';

/**
 * @fileOverview Extracts the product name from an image of food packaging.
 *
 * - extractProductName - A function that extracts the product name from an image.
 * - ExtractProductNameInput - The input type for the extractProductName function.
 * - ExtractProductNameOutput - The return type for the extractProductName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductNameInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of food packaging, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractProductNameInput = z.infer<typeof ExtractProductNameInputSchema>;

const ExtractProductNameOutputSchema = z.object({
  productName: z.string().describe('The name of the product extracted from the image.'),
});
export type ExtractProductNameOutput = z.infer<typeof ExtractProductNameOutputSchema>;

export async function extractProductName(input: ExtractProductNameInput): Promise<ExtractProductNameOutput> {
  return extractProductNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductNamePrompt',
  input: {schema: ExtractProductNameInputSchema},
  output: {schema: ExtractProductNameOutputSchema},
  prompt: `You are an expert in food product recognition.

You will be provided with an image of food packaging. Your task is to identify the product name from the image.

Analyze the image and extract the product name as accurately as possible.

Image: {{media url=photoDataUri}}`,
});

const extractProductNameFlow = ai.defineFlow(
  {
    name: 'extractProductNameFlow',
    inputSchema: ExtractProductNameInputSchema,
    outputSchema: ExtractProductNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
