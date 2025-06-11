
'use server';

import { extractProductName, ExtractProductNameInput } from '@/ai/flows/extract-product-name';
import { identifyIngredients, IdentifyIngredientsInput } from '@/ai/flows/identify-ingredients';
import { getExtendedProductInfo, GetExtendedProductInfoInput, GetExtendedProductInfoOutput } from '@/ai/flows/get-extended-product-info';
import { suggestRecipes, SuggestRecipesInput, SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';

interface AnalysisResult {
  productName?: string;
  ingredients?: string[];
  estimatedNutritionalInfo?: string;
  potentialAllergens?: string[];
  dietaryNotes?: string[];
  recipes?: SuggestRecipesOutput['recipes'];
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

    const currentProductName = productNameResult.productName || '';
    const currentIngredients = ingredientsResult.ingredients || [];

    // Perform subsequent calls that depend on product name/ingredients
    const extendedInfoInput: GetExtendedProductInfoInput = {
      productName: currentProductName,
      ingredients: currentIngredients,
    };
    const recipeSuggestionsInput: SuggestRecipesInput = {
      productName: currentProductName,
      ingredients: currentIngredients,
    };
    
    const [extendedInfo, recipeSuggestions] = await Promise.all([
        getExtendedProductInfo(extendedInfoInput),
        suggestRecipes(recipeSuggestionsInput)
    ]);


    return {
      productName: currentProductName,
      ingredients: currentIngredients,
      estimatedNutritionalInfo: extendedInfo?.estimatedNutritionalInfo,
      potentialAllergens: extendedInfo?.potentialAllergens,
      dietaryNotes: extendedInfo?.dietaryNotes,
      recipes: recipeSuggestions?.recipes,
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
