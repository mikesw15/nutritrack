import React from 'react';
import { Plus, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon, snacks: Cookie };
const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

export default function MealSection({ mealType, entries, date }) {
  const Icon = mealIcons[mealType];
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);

  return (
    <div className="p-4">
      {/* Meal header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{mealLabels[mealType]}</span>
          {totalCalories > 0 && (
            <span className="text-xs text-muted-foreground">{totalCalories} kcal</span>
          )}
        </div>
        <Link to={`/add-food?meal=${mealType}&date=${date}`}>
          <Button variant="outline" size="sm" className="h-7 px-2.5 rounded-lg text-xs gap-1">
            <Plus className="w-3 h-3" /> Add Food
          </Button>
        </Link>
      </div>

      {/* Entries */}
      <AnimatePresence>
        {entries.length > 0 && (
          <div className="space-y-1">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                {entry.image_url ? (
                  <img src={entry.image_url} alt={entry.food_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.food_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.quantity && entry.quantity !== 1 ? `${entry.quantity}× ` : ''}
                    {entry.serving_size || '1 serving'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">{entry.calories} kcal</span>
              </motion.div>
            ))}
          </div>
        )}
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground pl-1">No entries yet</p>
        )}
      </AnimatePresence>
    </div>
  );
}