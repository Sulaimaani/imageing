
'use server';
/**
 * @fileOverview Provides extended product information like estimated nutrition, potential allergens, and dietary notes.
 *
 * - getExtendedProductInfo - A function that fetches these details.
 * - GetExtendedProductInfoInput - The input type.
 * - GetExtendedProductInfoOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetExtendedProductInfoInputSchema = z.object({
  productName: z.string().describe('The name of the food product.'),
  ingredients: z.array(z.string()).describe('A list of ingredients found in the product.'),
});
export type GetExtendedProductInfoInput = z.infer<typeof GetExtendedProductInfoInputSchema>;

const GetExtendedProductInfoOutputSchema = z.object({
  estimatedNutritionalInfo: z.string().describe("An AI-estimated nutritional breakdown (e.g., calories, fat, protein, carbs) based on the ingredients. Preface with 'AI-estimated based on ingredients:'. Clearly state this is an approximation and may not be accurate."),
  potentialAllergens: z.array(z.string()).describe("A list of potential common allergens (e.g., 'Contains dairy', 'May contain traces of nuts') identified from the ingredients. If none are obvious, return an empty array or a statement like 'No common allergens immediately apparent from the ingredient list.'"),
  dietaryNotes: z.array(z.string()).describe("Notes on dietary compatibility (e.g., 'Appears to be vegan-friendly based on ingredients', 'Likely not suitable for keto diet due to X ingredient'). If no specific notes, return an empty array or a general statement."),
});
export type GetExtendedProductInfoOutput = z.infer<typeof GetExtendedProductInfoOutputSchema>;

export async function getExtendedProductInfo(input: GetExtendedProductInfoInput): Promise<GetExtendedProductInfoOutput> {
  return getExtendedProductInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getExtendedProductInfoPrompt',
  input: {schema: GetExtendedProductInfoInputSchema},
  output: {schema: GetExtendedProductInfoOutputSchema},
  prompt: `You are a helpful AI assistant providing information about food products.
Given the product name: {{{productName}}}
And its ingredients:
{{#each ingredients}}
- {{{this}}}
{{/each}}

Please provide the following information based *only* on the provided product name and ingredient list:

1.  estimatedNutritionalInfo: Provide an AI-estimated nutritional breakdown (e.g., calories, fat, protein, carbs). Start your response with "AI-estimated based on ingredients:". Emphasize that this is an approximation and official packaging should be consulted for accuracy.
2.  potentialAllergens: List any potential common allergens (like dairy, gluten, nuts, soy, eggs, fish, shellfish) you can identify from the ingredient list. Use phrases like "Contains [allergen]" or "May contain traces of [allergen]" if applicable. If none are apparent, state that.
3.  dietaryNotes: Provide notes on compatibility with common diets (e.g., vegan, vegetarian, gluten-free, keto). For example, "Appears to be vegan-friendly as no animal products are listed" or "Likely not keto-friendly due to high sugar/carb ingredients." If uncertain or not applicable, state that.

Respond in the format specified by the output schema.
Focus solely on the provided ingredients and product name for your analysis. Do not invent information or assume ingredients not listed.
`,
});

const getExtendedProductInfoFlow = ai.defineFlow(
  {
    name: 'getExtendedProductInfoFlow',
    inputSchema: GetExtendedProductInfoInputSchema,
    outputSchema: GetExtendedProductInfoOutputSchema,
  },
  async input => {
    // Ensure ingredients list is not empty for a more meaningful prompt
    if (input.ingredients.length === 0) {
        return {
            estimatedNutritionalInfo: "Not enough information to estimate nutritional values (no ingredients provided).",
            potentialAllergens: ["Cannot determine allergens without an ingredient list."],
            dietaryNotes: ["Cannot determine dietary compatibility without an ingredient list."]
        };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
