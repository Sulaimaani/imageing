import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

interface IngredientPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: IngredientPageProps) {
  const ingredientName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `About ${ingredientName} | FoodLens`,
    description: `Learn more about ${ingredientName}.`,
  };
}

export default function IngredientPage({ params }: IngredientPageProps) {
  const ingredientName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen py-8">
       <header className="mb-12 text-center">
        <Link href="/" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to FoodLens
        </Link>
      </header>

      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center">
            <Info className="mr-3 h-8 w-8 text-primary" />
            About: {ingredientName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-muted-foreground">
            This is a placeholder page for information about <strong className="text-foreground">{ingredientName}</strong>.
          </p>
          <p className="text-base">
            In a complete application, this page would provide detailed explanations, nutritional information,
            potential allergens, or sources related to this ingredient.
          </p>
          <div className="bg-accent/20 p-4 rounded-md">
            <h3 className="font-semibold text-accent-foreground mb-2">Developer Note:</h3>
            <p className="text-sm text-accent-foreground/80">
              Content for specific ingredients would be populated here, possibly from a database or external API.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Analyze Another Product
            </Link>
          </Button>
        </CardContent>
      </Card>
      <footer className="mt-auto pt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FoodLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
