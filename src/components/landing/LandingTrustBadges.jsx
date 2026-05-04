import React from 'react';
import { Bot, ScanBarcode, ShieldCheck, Database } from 'lucide-react';

const badges = [
  { icon: Database, title: 'UK food database', text: 'Built around UK supermarkets and common meals.' },
  { icon: ScanBarcode, title: 'Barcode scanning', text: 'Fast product lookup for everyday packaged foods.' },
  { icon: Bot, title: 'AI meal coach', text: 'Personal guidance based on goals and habits.' },
  { icon: ShieldCheck, title: 'Secure account', text: 'Private sign-in and protected health tracking.' },
];

export default function LandingTrustBadges() {
  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {badges.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
        </div>
      ))}
    </section>
  );
}