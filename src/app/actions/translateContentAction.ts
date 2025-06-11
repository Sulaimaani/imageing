
'use server';

import { translateText, TranslateTextInput } from '@/ai/flows/translate-text';

export interface OriginalContentData {
  productName?: string;
  ingredients?: string[];
  estimatedNutritionalInfo?: string;
  potentialAllergens?: string[];
  dietaryNotes?: string[];
  // recipes will be handled in a future update
}

export interface TranslatedContentData {
  productName?: string;
  ingredients?: string[];
  estimatedNutritionalInfo?: string;
  potentialAllergens?: string[];
  dietaryNotes?: string[];
}

export async function translateContentAction(
  originalContent: OriginalContentData,
  targetLanguage: string
): Promise<TranslatedContentData> {
  if (targetLanguage === 'en') { // Assuming 'en' is the original language
    return { ...originalContent };
  }

  const translateField = async (text: string | undefined): Promise<string | undefined> => {
    if (!text || text.trim() === "") return text;
    const result = await translateText({ text, targetLanguage });
    return result.translatedText;
  };

  const translateArrayField = async (arr: string[] | undefined): Promise<string[] | undefined> => {
    if (!arr || arr.length === 0) return arr;
    return Promise.all(
      arr.map(item => translateField(item).then(translated => translated || item)) // Fallback to original if translation is empty
    );
  };

  try {
    const [
      translatedProductName,
      translatedIngredients,
      translatedEstimatedNutritionalInfo,
      translatedPotentialAllergens,
      translatedDietaryNotes,
    ] = await Promise.all([
      translateField(originalContent.productName),
      translateArrayField(originalContent.ingredients),
      translateField(originalContent.estimatedNutritionalInfo),
      translateArrayField(originalContent.potentialAllergens),
      translateArrayField(originalContent.dietaryNotes),
    ]);

    return {
      productName: translatedProductName,
      ingredients: translatedIngredients,
      estimatedNutritionalInfo: translatedEstimatedNutritionalInfo,
      potentialAllergens: translatedPotentialAllergens,
      dietaryNotes: translatedDietaryNotes,
    };
  } catch (error) {
    console.error('Error during content translation:', error);
    // Fallback to original content in case of translation error
    return { 
        ...originalContent,
        // Optionally, you could add an error indicator to the translated fields
        // For simplicity, we return original content here.
    }; 
  }
}
