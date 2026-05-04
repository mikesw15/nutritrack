import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  { name: 'Free', price: '£0', text: 'Start tracking today', features: ['Manual meal tracking', '5 barcode scans per day', 'Calories and macros', 'Water and weight tracking'] },
  { name: 'Pro', price: '£4.99', text: 'For faster logging', featured: true, features: ['Unlimited barcode scans', 'AI meal photo scan', 'Voice food logging', 'Smart food suggestions'] },
  { name: 'Coach', price: '£9.99', text: 'For deeper guidance', features: ['Personal AI diet coach', 'Weekly meal plans', 'Shopping lists', 'Progress insights'] },
];

export default function LandingPricing({ onStart }) {
  return (
    <section className="py-12 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-heading">Simple pricing that can grow with you</h2>
        <p className="text-muted-foreground mt-2">Start free, then upgrade for premium AI logging and coaching tools.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.name} className={`rounded-3xl border p-6 shadow-sm ${plan.featured ? 'bg-primary text-primary-foreground border-primary scale-[1.02]' : 'bg-card border-border'}`}>
            <p className="text-sm font-bold">{plan.name}</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-extrabold font-heading">{plan.price}</span>
              <span className={`text-sm mb-1 ${plan.featured ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>/month</span>
            </div>
            <p className={`text-sm mt-2 ${plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{plan.text}</p>
            <div className="space-y-3 mt-6">
              {plan.features.map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4" /> {feature}
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 rounded-2xl" variant={plan.featured ? 'secondary' : 'default'} onClick={onStart}>Start Free</Button>
          </div>
        ))}
      </div>
    </section>
  );
}