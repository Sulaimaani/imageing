
'use server';

import { extractProductName, ExtractProductNameInput } from '@/ai/flows/extract-product-name';
import { identifyIngredients, IdentifyIngredientsInput } from '@/ai/flows/identify-ingredients';
import { getExtendedProductInfo, GetExtendedProductInfoInput, GetExtendedProductInfoOutput } from '@/ai/flows/get-extended-product-info';

interface AnalysisResult {
  productName?: string;
  ingredients?: string[];
  estimatedNutritionalInfo?: string;
  potentialAllergens?: string[];
  dietaryNotes?: string[];
  error?: string;
}

export async function analyzeImageAction(photoDataUri: string): Promise<AnalysisResult> {
  if (!photoDataUri) {
    return { error: 'No image data provided.' };
  }

  try {
    const productNameInput: ExtractProductNameInput = { photoDataUri };
    const ingredientsInput: IdentifyIngredientsInput = { photoDataUri };

    // Perform initial AI calls in parallel
    const [productNameResult, ingredientsResult] = await Promise.all([
      extractProductName(productNameInput),
      identifyIngredients(ingredientsInput),
    ]);

    // Always attempt to get extended product information if the initial calls succeed.
    // The getExtendedProductInfo flow is designed to handle empty productName or ingredients.
    const extendedInfoInput: GetExtendedProductInfoInput = {
      productName: productNameResult.productName, // Can be an empty string
      ingredients: ingredientsResult.ingredients,   // Can be an empty array
    };
    const extendedInfo = await getExtendedProductInfo(extendedInfoInput);

    return {
      productName: productNameResult.productName,
      ingredients: ingredientsResult.ingredients,
      estimatedNutritionalInfo: extendedInfo?.estimatedNutritionalInfo,
      potentialAllergens: extendedInfo?.potentialAllergens,
      dietaryNotes: extendedInfo?.dietaryNotes,
    };
  } catch (e) {
    console.error('Error during image analysis:', e);
    let errorMessage = 'An unexpected error occurred during analysis.';
    if (e instanceof Error) {
      errorMessage = `Analysis failed: ${e.message.substring(0,100)}${e.message.length > 100 ? '...' : '' }`;
    }
    return { error: errorMessage };
  }
}

