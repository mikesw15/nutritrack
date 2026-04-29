import React from 'react';
import { Activity, Target, Utensils, Dumbbell } from 'lucide-react';

export default function DailySummaryCard({ consumed, burned, goal, mealsLogged }) {
  const remaining = Math.max(0, goal + burned - consumed);
  const pct = Math.min((consumed / Math.max(goal + burned, 1)) * 100, 100);

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Calories remaining</p>
          <h2 className="text-4xl font-bold font-heading tracking-tight">{remaining}</h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-muted/50 p-3">
          <Utensils className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-sm font-bold">{consumed}</p>
          <p className="text-[10px] text-muted-foreground">Food</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-3">
          <Dumbbell className="w-4 h-4 mx-auto text-amber-500 mb-1" />
          <p className="text-sm font-bold">{burned}</p>
          <p className="text-[10px] text-muted-foreground">Exercise</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-3">
          <Activity className="w-4 h-4 mx-auto text-blue-500 mb-1" />
          <p className="text-sm font-bold">{mealsLogged}/4</p>
          <p className="text-[10px] text-muted-foreground">Meals</p>
        </div>
      </div>
    </div>
  );
}