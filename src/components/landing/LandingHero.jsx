import React from 'react';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingHero({ onStart }) {
  const scrollToDemo = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-12 md:py-20">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
          <Sparkles className="w-4 h-4" /> Built for UK foods, supermarkets and eating habits
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight leading-[1.02]">
            Lose Weight With AI Food Tracking Made for the UK
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Scan barcodes, snap meals, track calories, protein, carbs, sugar and fat — with AI guidance built around your goals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="rounded-2xl h-12 px-7 font-bold" onClick={onStart}>
            Start Free <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-2xl h-12 px-7 font-bold" onClick={scrollToDemo}>
            <PlayCircle className="w-4 h-4" /> Try Demo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Free to start. Upgrade when you want unlimited AI and barcode features.</p>
      </div>

      <div id="demo" className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative mx-auto max-w-sm rounded-[2rem] border border-border bg-card p-4 shadow-2xl">
          <div className="rounded-[1.5rem] bg-background p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-bold font-heading">1,426 kcal logged</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center text-xs font-bold text-primary">71%</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Protein 112g', 'Carbs 151g', 'Fat 42g'].map(item => (
                <div key={item} className="rounded-2xl bg-card border border-border p-3 text-center text-xs font-semibold">{item}</div>
              ))}
            </div>
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img className="w-14 h-14 rounded-2xl object-cover" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" alt="Healthy meal" />
                <div>
                  <p className="text-sm font-bold">AI scanned meal</p>
                  <p className="text-xs text-muted-foreground">Chicken salad · 430 kcal · 38g protein</p>
                </div>
              </div>
              <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-semibold">You’re 25g protein short today — try a high-protein snack.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}