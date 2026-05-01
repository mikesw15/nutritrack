import React from 'react';
import { Trophy, Flame, Utensils, Target } from 'lucide-react';

export default function EngagementCard({ streak, mealsLogged, proteinHit, calorieHit }) {
  const achievements = [
    { label: '3 day streak', earned: streak >= 3, icon: Flame },
    { label: 'Protein goal', earned: proteinHit, icon: Trophy },
    { label: 'Calorie goal', earned: calorieHit, icon: Target },
    { label: '3 meals today', earned: mealsLogged >= 3, icon: Utensils },
  ];

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Logging streak</p>
          <h3 className="text-2xl font-bold font-heading">{streak} days</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Flame className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {achievements.map(({ label, earned, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-2 text-center ${earned ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/40 border-border text-muted-foreground'}`}>
            <Icon className="w-4 h-4 mx-auto mb-1" />
            <p className="text-[10px] font-semibold leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}