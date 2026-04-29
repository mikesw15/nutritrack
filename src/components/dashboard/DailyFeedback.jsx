import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function DailyFeedback({ protein, fibre, sugar, proteinGoal }) {
  const messages = [];

  if (protein >= proteinGoal * 0.8) {
    messages.push({ icon: CheckCircle2, text: 'Great protein intake today', tone: 'text-primary bg-primary/10' });
  }
  if (fibre < 15) {
    messages.push({ icon: AlertTriangle, text: 'Low fibre intake — try adding fruit, veg or whole grains', tone: 'text-amber-600 bg-amber-100' });
  }
  if (sugar > 90) {
    messages.push({ icon: AlertTriangle, text: 'High sugar intake today', tone: 'text-red-600 bg-red-100' });
  }

  if (messages.length === 0) {
    messages.push({ icon: Sparkles, text: 'Nice balanced day so far — keep logging', tone: 'text-blue-600 bg-blue-100' });
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold font-heading">Daily Feedback</h3>
      <div className="space-y-2">
        {messages.map(({ icon: Icon, text, tone }) => (
          <div key={text} className="flex items-center gap-2 text-sm">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tone}`}>
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}