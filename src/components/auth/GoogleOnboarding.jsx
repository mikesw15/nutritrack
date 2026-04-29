import React from 'react';
import { Sparkles, ShieldCheck, Apple, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleOnboarding({ onSignIn }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-sm p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-sm">
            <Apple className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Welcome to NutriTrack AI</h1>
            <p className="text-sm text-muted-foreground mt-2">Track meals, water, weight and progress with a faster, cleaner experience.</p>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { icon: Sparkles, title: 'Fast food logging', text: 'Search, scan, use AI photos, recent foods and favourites.' },
            { icon: Droplets, title: 'Daily habits', text: 'Track water, streaks and simple achievements.' },
            { icon: ShieldCheck, title: 'Secure sign in', text: 'Continue safely using your Google account.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-muted/50 p-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full h-11 rounded-2xl font-semibold" onClick={onSignIn}>
          Continue with Google
        </Button>
        <p className="text-[11px] text-center text-muted-foreground">Email and password signup is not available for this app.</p>
      </div>
    </div>
  );
}