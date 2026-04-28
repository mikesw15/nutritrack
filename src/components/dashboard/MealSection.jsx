import React from 'react';
import { Plus, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie,
};

const mealLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export default function MealSection({ mealType, entries, date }) {
  const Icon = mealIcons[mealType];
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{mealLabels[mealType]}</h3>
            <p className="text-xs text-muted-foreground">
              {totalCalories > 0 ? `${totalCalories} kcal` : 'No entries yet'}
            </p>
          </div>
        </div>
        <Link to={`/add-food?meal=${mealType}&date=${date}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Plus className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {entries.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="border-t border-border"
          >
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.food_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.quantity && entry.quantity !== 1 ? `${entry.quantity}× ` : ''}
                    {entry.serving_size || '1 serving'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground ml-3">
                  {entry.calories} kcal
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}