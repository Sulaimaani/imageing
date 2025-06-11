
'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { analyzeImageAction } from './actions/analyzeImageAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Package, ListChecks, AlertCircle, Loader2, ScanSearch, ExternalLink, HeartPulse, ShieldAlert, Leaf } from 'lucide-react';

export default function FoodLensPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [estimatedNutritionalInfo, setEstimatedNutritionalInfo] = useState<string | null>(null);
  const [potentialAllergens, setPotentialAllergens] = useState<string[] | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetAnalysisResults = () => {
    setProductName(null);
    setIngredients(null);
    setEstimatedNutritionalInfo(null);
    setPotentialAllergens(null);
    setDietaryNotes(null);
    setError(null);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      resetAnalysisResults();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile || !imagePreview) {
      setError('Please select an image first.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image first.",
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
      setProductName(result.productName || 'Not found');
      setIngredients(result.ingredients || []);
      setEstimatedNutritionalInfo(result.estimatedNutritionalInfo || null);
      setPotentialAllergens(result.potentialAllergens || []);
      setDietaryNotes(result.dietaryNotes || []);
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

      {(productName || ingredients || estimatedNutritionalInfo || potentialAllergens?.length || dietaryNotes?.length) && !error && (
        <Card className="mt-8 w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {productName && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <Package className="mr-2 h-5 w-5 text-primary" /> Product Name
                </h3>
                <p className="text-lg p-3 bg-accent/20 rounded-md text-accent-foreground">{productName}</p>
              </div>
            )}

            {ingredients && ingredients.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> Ingredients
                </h3>
                <ul className="space-y-2 list-inside bg-secondary/30 p-4 rounded-md">
                  {ingredients.map((ingredient, index) => (
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
             {ingredients && ingredients.length === 0 && productName && (
                <p className="text-muted-foreground">No ingredients identified for this product.</p>
            )}

            {estimatedNutritionalInfo && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <HeartPulse className="mr-2 h-5 w-5 text-primary" /> AI-Estimated Nutritional Info
                </h3>
                <p className="text-sm p-3 bg-muted/50 rounded-md text-foreground/80 whitespace-pre-wrap">{estimatedNutritionalInfo}</p>
                <p className="text-xs text-muted-foreground mt-1">Note: This is an AI-generated estimate. Always refer to the product packaging for accurate nutritional information.</p>
              </div>
            )}

            {potentialAllergens && potentialAllergens.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> AI-Identified Potential Allergens
                </h3>
                <ul className="space-y-1 list-disc list-inside bg-destructive/10 p-3 rounded-md text-destructive-foreground border border-destructive/30">
                  {potentialAllergens.map((allergen, index) => (
                    <li key={index} className="text-sm">{allergen}</li>
                  ))}
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">Note: This is an AI-generated list. If you have allergies, carefully check the product packaging.</p>
              </div>
            )}
             {potentialAllergens && potentialAllergens.length === 0 && productName && (
                <p className="text-muted-foreground">No common allergens immediately apparent from the AI analysis of the ingredient list.</p>
            )}


            {dietaryNotes && dietaryNotes.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-semibold flex items-center mb-2">
                  <Leaf className="mr-2 h-5 w-5 text-primary" /> AI-Suggested Dietary Notes
                </h3>
                <ul className="space-y-1 list-disc list-inside bg-green-100 dark:bg-green-900/30 p-3 rounded-md text-green-700 dark:text-green-300 border border-green-500/30">
                  {dietaryNotes.map((note, index) => (
                    <li key={index} className="text-sm">{note}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-1">Note: These are AI-generated suggestions based on ingredients. Consult official dietary guidelines or a professional for specific advice.</p>
              </div>
            )}
             {dietaryNotes && dietaryNotes.length === 0 && productName && (
                <p className="text-muted-foreground">No specific dietary notes generated by AI for this product.</p>
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
