import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WaterTracker({ glasses, goal, onAdd, onRemove }) {
  const percentage = goal > 0 ? Math.min((glasses / goal) * 100, 100) : 0;

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold">Water</span>
        </div>
        <span className="text-xs text-muted-foreground">{glasses}/{goal} glasses</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={onRemove}
          disabled={glasses <= 0}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: goal }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "flex-1 h-6 rounded-full transition-colors",
                i < glasses ? "bg-blue-500" : "bg-muted"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={onAdd}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}