
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Info, Youtube, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getIngredientDetails, GetIngredientDetailsOutput } from '@/ai/flows/get-ingredient-details';
import { Skeleton } from '@/components/ui/skeleton';


interface IngredientPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: IngredientPageProps) {
  const ingredientName = decodeURIComponent(params.slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `About ${ingredientName} | FoodLens`,
    description: `Learn more about ${ingredientName}, including what it is, how to use or prepare it, and watch related videos.`,
  };
}

// Helper function to render paragraphs from text that might contain newlines
const RenderParagraphs = ({ text, className }: { text: string, className?: string }) => {
  if (!text) return null;
  return text.split('\n').map((paragraph, index, arr) => (
    <p key={index} className={`${className || 'text-base'} ${index < arr.length - 1 ? 'mb-3' : ''}`}>
      {paragraph}
    </p>
  ));
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-3/5 mb-3 rounded-md bg-primary/30" />
      <Skeleton className="h-4 w-full mb-2 rounded-md" />
      <Skeleton className="h-4 w-full mb-2 rounded-md" />
      <Skeleton className="h-4 w-4/5 rounded-md" />
    </div>
    <div>
      <Skeleton className="h-8 w-1/2 mb-3 rounded-md bg-primary/30" />
      <Skeleton className="h-4 w-full mb-2 rounded-md" />
      <Skeleton className="h-4 w-full mb-2 rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
    </div>
    <div>
      <Skeleton className="h-8 w-2/5 mb-3 rounded-md bg-primary/30" />
      <Skeleton className="aspect-video w-full rounded-lg" />
    </div>
  </div>
);


export default async function IngredientPage({ params }: IngredientPageProps) {
  const rawSlug = params.slug;
  const decodedSlug = decodeURIComponent(rawSlug);
  const ingredientName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  let ingredientDetails: GetIngredientDetailsOutput | null = null;
  let fetchError: string | null = null;
  
  try {
    ingredientDetails = await getIngredientDetails({ ingredientName });
  } catch (error) {
    console.error(`Failed to fetch ingredient details for "${ingredientName}":`, error);
    if (error instanceof Error) {
        if (error.message.includes('429')) {
            fetchError = "We're experiencing high demand for this ingredient! Please try again in a few moments.";
        } else {
            fetchError = `An error occurred while fetching details: ${error.message.substring(0, 150)}${error.message.length > 150 ? '...' : ''}. Please try again later.`;
        }
    } else {
        fetchError = "An unknown error occurred while fetching ingredient details. Please try again later.";
    }
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen py-8">
      <header className="mb-8 text-center w-full max-w-3xl">
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-4 print:hidden">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to FoodLens
        </Link>
        <h1 className="text-4xl font-headline font-bold flex items-center justify-center text-foreground">
            <Info className="mr-3 h-10 w-10 text-primary shrink-0" />
            <span>About: {ingredientName}</span>
        </h1>
      </header>

      <Card className="w-full max-w-3xl shadow-xl print:shadow-none print:border-none">
        <CardContent className="space-y-8 p-6 md:p-8">
          {fetchError && (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive border border-destructive/30">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-6 w-6 mr-3 shrink-0" />
                <h3 className="text-xl font-semibold">Failed to Load Details</h3>
              </div>
              <p className="text-sm ml-9">{fetchError}</p>
            </div>
          )}

          {!fetchError && !ingredientDetails && (
            <LoadingSkeleton />
          )}

          {ingredientDetails && (
            <>
              <section>
                <h2 className="text-2xl font-semibold font-headline mb-3 text-primary-foreground bg-primary/90 px-4 py-2.5 rounded-lg shadow-md flex items-center">
                  <span className="mr-3">📜</span>What is {ingredientName}?
                </h2>
                <div className="p-4 bg-card border rounded-lg mt-2 shadow-sm">
                   <RenderParagraphs text={ingredientDetails.description} className="text-foreground/90 leading-relaxed" />
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold font-headline mb-3 text-primary-foreground bg-primary/90 px-4 py-2.5 rounded-lg shadow-md flex items-center">
                 <span className="mr-3">🍳</span>Usage & Preparation
                </h2>
                 <div className="p-4 bg-card border rounded-lg mt-2 shadow-sm">
                  <RenderParagraphs text={ingredientDetails.usageOrPreparation} className="text-foreground/90 leading-relaxed" />
                </div>
              </section>

              {ingredientDetails.youtubeVideoUrl && (
                <section>
                  <h2 className="text-2xl font-semibold font-headline mb-3 flex items-center text-primary-foreground bg-primary/90 px-4 py-2.5 rounded-lg shadow-md">
                    <Youtube className="mr-3 h-7 w-7" /> Watch a Video
                  </h2>
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg border bg-muted mt-2">
                    <iframe
                      width="100%"
                      height="100%"
                      src={ingredientDetails.youtubeVideoUrl}
                      title={`YouTube video for ${ingredientName}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                </section>
              )}
              
              {!ingredientDetails.youtubeVideoUrl && !fetchError && (
                 <div className="p-4 bg-muted/70 border rounded-lg mt-2 text-center shadow-sm">
                    <p className="text-muted-foreground italic">No video is currently available for this ingredient.</p>
                 </div>
              )}
            </>
          )}
          
           <div className="mt-10 border-t pt-8 flex justify-center print:hidden">
             <Button asChild variant="outline" size="lg">
                <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Analyze Another Product
                </Link>
            </Button>
           </div>

        </CardContent>
      </Card>
      <footer className="mt-auto pt-16 text-center text-muted-foreground print:hidden">
        <p>&copy; {new Date().getFullYear()} FoodLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
