import React from 'react';
import { Apple } from 'lucide-react';
import LandingHero from '@/components/landing/LandingHero';
import LandingTrustBadges from '@/components/landing/LandingTrustBadges';
import LandingProgressPreview from '@/components/landing/LandingProgressPreview';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingFAQ from '@/components/landing/LandingFAQ';

export default function GoogleOnboarding({ onSignIn }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
              <Apple className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold font-heading text-lg">NutriTrack <span className="text-primary">AI</span></span>
          </div>
          <button className="text-sm font-bold text-primary hover:underline" onClick={onSignIn}>Start Free</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <LandingHero onStart={onSignIn} />
        <LandingTrustBadges />
        <LandingProgressPreview />
        <LandingPricing onStart={onSignIn} />
        <LandingTestimonials />
        <LandingFAQ />
      </main>

      <footer className="border-t border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-xs text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span>© 2026 NutriTrack AI. Built for UK food tracking.</span>
          <span>AI nutrition estimates are guidance only, not medical advice.</span>
        </div>
      </footer>
    </div>
  );
}