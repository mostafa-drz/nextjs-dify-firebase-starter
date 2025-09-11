import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Home Page - Server Component
 * Middleware handles authentication redirects, so this component
 * only renders a loading state as users are redirected appropriately
 */
export default function Home() {
  // This component should rarely be seen as middleware handles redirects
  // But we keep it as a fallback loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-4 text-sm">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
}
