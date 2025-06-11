'use server';
/**
 * @fileOverview Suggests recipes based on a product name and its ingredients.
 *
 * - suggestRecipes - A function that suggests recipes.
 * - SuggestRecipesInput - The input type.
 * - SuggestRecipesOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  description: z.string().describe('A brief description of the recipe.'),
  ingredientsList: z.array(z.string()).describe('A list of main ingredients for the recipe. This can include the input product/ingredients and other common items.'),
  instructions: z.string().describe('Step-by-step instructions to prepare the recipe. Should be formatted clearly, perhaps with newlines between steps.'),
  estimatedPrepTime: z.string().optional().describe('Estimated preparation time (e.g., "20 minutes").'),
  difficulty: z.string().optional().describe('Recipe difficulty (e.g., "Easy", "Medium", "Hard").'),
});

const SuggestRecipesInputSchema = z.object({
  productName: z.string().describe('The name of the food product.'),
  ingredients: z.array(z.string()).describe('A list of ingredients found in the product.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('A list of 1 to 3 simple recipe suggestions. If no suitable recipes can be generated, return an empty array.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a creative culinary AI that suggests simple and practical recipes.
Given the product name: {{{productName}}}
And its ingredients:
{{#each ingredients}}
- {{{this}}}
{{/each}}

Please suggest 1 to 3 simple recipes that could prominently feature or complement this product or its key ingredients.
For each recipe, provide:
1.  recipeName: The name of the recipe.
2.  description: A brief, appealing description of the dish.
3.  ingredientsList: A list of main ingredients needed, which can include the input product/ingredients and a few other common pantry staples.
4.  instructions: Clear, step-by-step instructions. Use newlines for each step.
5.  estimatedPrepTime: (Optional) A rough estimate of the preparation time.
6.  difficulty: (Optional) The difficulty level (e.g., Easy, Medium).

If the product is something not typically used in recipes (e.g., a breath mint) or if the ingredients are too generic or insufficient to base a recipe on, it's okay to return an empty array for recipes. Focus on quality and relevance.
Make the recipes easy to follow for a home cook.
`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    // If product name is empty or ingredients list is very short,
    // it might be hard to generate good recipes.
    if (!input.productName && input.ingredients.length < 2) {
      return { recipes: [] };
    }
    const {output} = await prompt(input);
    return output || { recipes: [] };
  }
);
