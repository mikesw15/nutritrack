import React from 'react';
import { Flame, Dumbbell } from 'lucide-react';

export default function DaySummary({ consumed, burned, goal }) {
  return (
    <div className="flex items-center justify-around py-2">
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center mb-0.5">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Goal</span>
        </div>
        <span className="text-lg font-bold font-heading">{goal}</span>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center mb-0.5">
          <span className="text-xs text-muted-foreground">Food</span>
        </div>
        <span className="text-lg font-bold font-heading">{consumed}</span>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center mb-0.5">
          <Dumbbell className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-muted-foreground">Exercise</span>
        </div>
        <span className="text-lg font-bold font-heading">{burned}</span>
      </div>
    </div>
  );
}