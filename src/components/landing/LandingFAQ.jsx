import React from 'react';

const faqs = [
  { q: 'Is this made for UK foods?', a: 'Yes. The product positioning, examples and food logging experience are focused on UK supermarkets, meals and habits.' },
  { q: 'Can I start for free?', a: 'Yes. The free plan is designed for basic meal, water, weight and macro tracking.' },
  { q: 'Is AI meal scanning exact?', a: 'No. AI food scanning should be treated as an estimate and can be edited before adding to your diary.' },
  { q: 'What makes Pro useful?', a: 'Pro is designed around faster logging with unlimited barcode scans, AI photo scanning, voice logging and smarter suggestions.' },
];

export default function LandingFAQ() {
  return (
    <section className="py-12 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-heading">Questions before you start?</h2>
        <p className="text-muted-foreground mt-2">Clear answers for new users deciding whether to try NutriTrack AI.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {faqs.map(item => (
          <div key={item.q} className="rounded-3xl bg-card border border-border p-6 shadow-sm">
            <h3 className="font-bold">{item.q}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}