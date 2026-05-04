import React from 'react';

const quotes = [
  { quote: 'Finally feels like a food tracker made for what I actually eat in the UK.', name: 'Beta user, Manchester' },
  { quote: 'The AI protein reminder makes it much easier to stay on track without guessing.', name: 'Early tester, Bristol' },
  { quote: 'Barcode scanning and repeat meals make logging much less annoying.', name: 'Beta user, Glasgow' },
];

export default function LandingTestimonials() {
  return (
    <section className="py-12 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-heading">Early beta feedback</h2>
        <p className="text-muted-foreground mt-2">Built around speed, trust and practical weight-loss support.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {quotes.map(item => (
          <div key={item.name} className="rounded-3xl bg-card border border-border p-6 shadow-sm">
            <p className="text-sm leading-relaxed">“{item.quote}”</p>
            <p className="text-xs font-bold text-primary mt-5">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}