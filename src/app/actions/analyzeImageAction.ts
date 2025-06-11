'use server';

import { extractProductName, ExtractProductNameInput } from '@/ai/flows/extract-product-name';
import { identifyIngredients, IdentifyIngredientsInput } from '@/ai/flows/identify-ingredients';

interface AnalysisResult {
  productName?: string;
  ingredients?: string[];
  error?: string;
}

export async function analyzeImageAction(photoDataUri: string): Promise<AnalysisResult> {
  if (!photoDataUri) {
    return { error: 'No image data provided.' };
  }

  try {
    const productNameInput: ExtractProductNameInput = { photoDataUri };
    const ingredientsInput: IdentifyIngredientsInput = { photoDataUri };

    // Perform AI calls in parallel
    const [productNameResult, ingredientsResult] = await Promise.all([
      extractProductName(productNameInput),
      identifyIngredients(ingredientsInput),
    ]);

    return {
      productName: productNameResult.productName,
      ingredients: ingredientsResult.ingredients,
    };
  } catch (e) {
    console.error('Error during image analysis:', e);
    // It's better to provide a generic error message to the client
    // and log the specific error on the server.
    let errorMessage = 'An unexpected error occurred during analysis.';
    if (e instanceof Error) {
      // You might want to tailor this based on expected error types from Genkit or your flows
      errorMessage = `Analysis failed: ${e.message.substring(0,100)}${e.message.length > 100 ? '...' : '' }`;
    }
    return { error: errorMessage };
  }
}
