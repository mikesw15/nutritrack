import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MacroBar({ label, current, goal, color, unit = 'g' }) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(0, goal - current);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(current)}/{goal}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5 block">
        {Math.round(remaining)}{unit} left
      </span>
    </div>
  );
}