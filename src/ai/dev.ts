
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-product-name.ts';
import '@/ai/flows/identify-ingredients.ts';
import '@/ai/flows/get-ingredient-details.ts';
import '@/ai/flows/get-extended-product-info.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/translate-text.ts';
