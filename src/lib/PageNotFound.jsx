import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-3xl">🥗</span>
      </div>
      <h1 className="text-2xl font-bold font-heading mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        The page you're looking for doesn't exist. Let's get you back to tracking!
      </p>
      <Link to="/">
        <Button className="rounded-full gap-2">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}