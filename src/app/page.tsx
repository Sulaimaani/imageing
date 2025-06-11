
'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { analyzeImageAction } from './actions/analyzeImageAction';
import { translateContentAction, OriginalContentData, TranslatedContentData } from './actions/translateContentAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Package, ListChecks, AlertCircle, Loader2, ScanSearch, ExternalLink, HeartPulse, ShieldAlert, Leaf, ChefHat, Clock, TrendingUp, Languages } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';

const RenderParagraphs = ({ text, className }: { text: string, className?: string }) => {
  if (!text) return null;
  return text.split('\n').map((paragraph, index, arr) => (
    <p key={index} className={`${className || ''} ${index < arr.length - 1 ? 'mb-2' : ''}`}>
      {paragraph}
    </p>
  ));
};

interface LanguageOption {
  value: string;
  label: string;
  aiLanguageName: string; // Language name as understood by the AI model
}

const languageOptions: LanguageOption[] = [
  { value: 'en', label: 'English (Original)', aiLanguageName: 'English' },
  { value: 'es', label: 'Español', aiLanguageName: 'Spanish' },
  { value: 'fr', label: 'Français', aiLanguageName: 'French' },
  { value: 'de', label: 'Deutsch', aiLanguageName: 'German' },
];

export default function FoodLensPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [originalAnalysisData, setOriginalAnalysisData] = useState<OriginalContentData | null>(null);
  const [translatedAnalysisData, setTranslatedAnalysisData] = useState<TranslatedContentData | null>(null);
  
  const [recipes, setRecipes] = useState<SuggestRecipesOutput['recipes'] | null>(null); // Recipes might need separate translation logic later
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const { toast } = useToast();

  const resetAnalysisResults = () => {
    setOriginalAnalysisData(null);
    setTranslatedAnalysisData(null);
    setRecipes(null);
    setError(null);
    setSelectedLanguage('en'); // Reset language on new analysis
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(null); 
      resetAnalysisResults();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setImageFile(null); 
        setImagePreview(null);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not read the selected image file.",
        });
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
      resetAnalysisResults(); 
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile || !imagePreview) {
      setError('Please select a readable image first.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a readable image first. If you selected one, it might not have loaded correctly.",
      });
      return;
    }

    setIsLoading(true);
    resetAnalysisResults();

    const result = await analyzeImageAction(imagePreview);

    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
    } else {
      setOriginalAnalysisData({
        productName: result.productName || 'Not found',
        ingredients: result.ingredients || [],
        estimatedNutritionalInfo: result.estimatedNutritionalInfo || null,
        potentialAllergens: result.potentialAllergens || [],
        dietaryNotes: result.dietaryNotes || [],
      });
      setRecipes(result.recipes || []);
      toast({
        title: "Analysis Complete",
        description: "Product information extracted.",
      });
    }
  };
  
  useEffect(() => {
    if (imageFile) {
      resetAnalysisResults();
    }
  }, [imageFile]);

  const handleLanguageChange = async (langValue: string) => {
    setSelectedLanguage(langValue);
    if (langValue === 'en' || !originalAnalysisData) {
      setTranslatedAnalysisData(null); // Clear translations or if no original data
      return;
    }

    const targetLanguageName = languageOptions.find(opt => opt.value === langValue)?.aiLanguageName;
    if (!targetLanguageName) {
        console.error("Invalid language selected for AI translation");
        return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateContentAction(originalAnalysisData, targetLanguageName);
      setTranslatedAnalysisData(translated);
      toast({
        title: "Translation Complete",
        description: `Content translated to ${languageOptions.find(opt => opt.value === langValue)?.label}.`,
      });
    } catch (e) {
      console.error("Translation error:", e);
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: "Could not translate content.",
      });
      setTranslatedAnalysisData(null); // Fallback to no translation on error
    } finally {
      setIsTranslating(false);
    }
  };
  
  const displayData = selectedLanguage === 'en' || !translatedAnalysisData ? originalAnalysisData : translatedAnalysisData;
  const currentProductName = displayData?.productName;
  const currentIngredients = displayData?.ingredients;
  const currentEstimatedNutritionalInfo = displayData?.estimatedNutritionalInfo;
  const currentPotentialAllergens = displayData?.potentialAllergens;
  const currentDietaryNotes = displayData?.dietaryNotes;

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen py-8">
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center space-x-3 text-primary mb-2">
          <ScanSearch className="h-12 w-12" />
          <h1 className="text-5xl font-headline font-bold">FoodLens</h1>
        </div>
        <p className="text-muted-foreground text-lg">Upload an image of food packaging to analyze its contents.</p>
      </header>

      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" />Upload Food Packaging</CardTitle>
          <CardDescription>Select an image of the food packaging to extract product name and ingredients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="imageUpload" className="text-base">Food Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                aria-label="Upload food packaging image"
              />
            </div>

            {imagePreview && (
              <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center bg-muted/30">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  width={300}
                  height={300}
                  className="rounded-md object-contain max-h-[300px]"
                  data-ai-hint="food package"
                />
              </div>
            )}

            <Button type="submit" disabled={isLoading || !imageFile} className="w-full text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                </>
              ) : (
                'Analyze Image'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-8 w-full max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {originalAnalysisData && !error && (
        <Card className="mt-8 w-full max-w-2xl shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
                <div className="flex items-center space-x-2">
                    {isTranslating && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating || !originalAnalysisData}>
                        <SelectTrigger className="w-[180px]">
                            <Languages className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languageOptions.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentProductName && currentProductName !== 'Not found' && currentProductName !== '' && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <Package className="mr-2 h-5 w-5 text-primary" /> Product Name
                </h3>
                <p className="text-lg p-3 bg-accent/20 rounded-md text-accent-foreground">{currentProductName}</p>
              </div>
            )}
             {currentProductName === 'Not found' && (
                <div>
                  <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                    <Package className="mr-2 h-5 w-5 text-primary" /> Product Name
                  </h3>
                  <p className="text-lg p-3 bg-muted/50 rounded-md text-muted-foreground">Product name not found.</p>
                </div>
            )}


            {currentIngredients && currentIngredients.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> Ingredients
                </h3>
                <ul className="space-y-2 list-inside bg-secondary/30 p-4 rounded-md">
                  {currentIngredients.map((ingredient, index) => (
                    <li key={index} className="text-base flex justify-between items-center group hover:bg-accent/10 p-1 rounded">
                      <span>{ingredient}</span>
                      <Link
                        href={`/ingredient/${encodeURIComponent(ingredient.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="text-sm text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        title={`Learn more about ${ingredient}`}
                        aria-label={`Learn more about ${ingredient}`}
                      >
                        <ExternalLink className="inline h-4 w-4 ml-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
             {currentIngredients && currentIngredients.length === 0 && originalAnalysisData !== null && (
                <div>
                  <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Ingredients
                  </h3>
                  <p className="text-muted-foreground p-3 bg-secondary/30 rounded-md">No ingredients identified for this product.</p>
                </div>
            )}

            {currentEstimatedNutritionalInfo && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <HeartPulse className="mr-2 h-5 w-5 text-primary" /> AI-Estimated Nutritional Info
                </h3>
                <p className="text-sm p-3 bg-muted/50 rounded-md text-foreground/80 whitespace-pre-wrap">{currentEstimatedNutritionalInfo}</p>
                <p className="text-xs text-muted-foreground mt-1">Note: This is an AI-generated estimate. Always refer to the product packaging for accurate nutritional information.</p>
              </div>
            )}

            {currentPotentialAllergens && currentPotentialAllergens.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> AI-Identified Potential Allergens
                </h3>
                <ul className="space-y-1 list-disc list-inside bg-destructive/10 p-3 rounded-md border border-destructive/30">
                  {currentPotentialAllergens.map((allergen, index) => (
                    <li key={index} className="text-sm text-destructive">{allergen}</li>
                  ))}
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">Note: This is an AI-generated list. If you have allergies, carefully check the product packaging.</p>
              </div>
            )}
             {currentPotentialAllergens && currentPotentialAllergens.length === 0 && originalAnalysisData !== null && ( 
                <div>
                  <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                    <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> AI-Identified Potential Allergens
                  </h3>
                  <p className="text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/30">No common allergens were immediately apparent from the AI analysis of the ingredient list.</p>
                </div>
            )}


            {currentDietaryNotes && currentDietaryNotes.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <Leaf className="mr-2 h-5 w-5 text-primary" /> AI-Suggested Dietary Notes
                </h3>
                <ul className="space-y-1 list-disc list-inside bg-green-100 dark:bg-green-900/30 p-3 rounded-md text-green-700 dark:text-green-300 border border-green-500/30">
                  {currentDietaryNotes.map((note, index) => (
                    <li key={index} className="text-sm">{note}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-1">Note: These are AI-generated suggestions based on ingredients. Consult official dietary guidelines or a professional for specific advice.</p>
              </div>
            )}
             {currentDietaryNotes && currentDietaryNotes.length === 0 && originalAnalysisData !== null && (  
                <div>
                  <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                    <Leaf className="mr-2 h-5 w-5 text-primary" /> AI-Suggested Dietary Notes
                  </h3>
                  <p className="text-muted-foreground p-3 bg-green-100 dark:bg-green-900/30 rounded-md border border-green-500/30">No specific dietary notes were generated by AI for this product.</p>
                </div>
            )}

            {recipes && recipes.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <ChefHat className="mr-2 h-5 w-5 text-primary" /> AI-Suggested Recipes
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {recipes.map((recipe, index) => (
                    <AccordionItem value={`recipe-${index}`} key={index} className="bg-card border border-border/70 rounded-lg mb-3 shadow-sm">
                      <AccordionTrigger className="p-4 hover:no-underline text-left">
                        <div className="flex-1">
                            <p className="font-semibold text-primary-foreground bg-primary/90 px-3 py-1.5 rounded-md inline-block mb-1 shadow">
                                {recipe.recipeName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{recipe.description}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0 space-y-3">
                        {recipe.estimatedPrepTime && (
                           <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="mr-1.5 h-4 w-4" /> Prep time: {recipe.estimatedPrepTime}
                           </div>
                        )}
                        {recipe.difficulty && (
                            <div className="text-sm text-muted-foreground flex items-center">
                                <TrendingUp className="mr-1.5 h-4 w-4" /> Difficulty: {recipe.difficulty}
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold mb-1 text-foreground/90">Ingredients:</h4>
                            <ul className="list-disc list-inside space-y-0.5 text-sm text-foreground/80 pl-2">
                                {recipe.ingredientsList.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1 text-foreground/90">Instructions:</h4>
                            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pl-2">
                                <RenderParagraphs text={recipe.instructions} />
                            </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                 <p className="text-xs text-muted-foreground mt-2">Note: Recipes are AI-generated. Adjust to your preferences and check for ingredient availability. AI translation for recipes is not yet available.</p>
              </div>
            )}
            {recipes && recipes.length === 0 && originalAnalysisData !== null && (
                <div>
                  <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                    <ChefHat className="mr-2 h-5 w-5 text-primary" /> AI-Suggested Recipes
                  </h3>
                  <p className="text-muted-foreground p-3 bg-muted/50 rounded-md">No specific recipes were suggested by AI for this product at this time.</p>
                </div>
            )}


          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">AI-generated information is for general guidance and may not always be accurate. Always verify critical information from the product packaging or official sources.</p>
          </CardFooter>
        </Card>
      )}
       <footer className="mt-auto pt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FoodLens. All rights reserved.</p>
      </footer>
    </div>
  );
}

