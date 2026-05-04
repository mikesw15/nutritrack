import React from 'react';
import { TrendingDown, Dumbbell, Droplets } from 'lucide-react';

const cards = [
  { icon: TrendingDown, label: 'Before', value: '82.4kg', text: 'Starting weight with inconsistent logging.' },
  { icon: Dumbbell, label: 'After 8 weeks', value: '76.9kg', text: 'Clear trend, better protein and smarter choices.' },
  { icon: Droplets, label: 'Habit score', value: '86%', text: 'Water, meals and weekly consistency tracked.' },
];

export default function LandingProgressPreview() {
  return (
    <section className="py-12 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-heading">See progress people actually understand</h2>
        <p className="text-muted-foreground mt-2">Turn calories, macros, water and weight into simple before-and-after progress cards.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value, text }) => (
          <div key={label} className="rounded-3xl bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-4xl font-extrabold font-heading">{value}</p>
            <p className="text-sm text-muted-foreground mt-2">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}