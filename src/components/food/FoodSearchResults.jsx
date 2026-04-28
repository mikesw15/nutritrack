import React from 'react';
import { Loader2 } from 'lucide-react';

export default function FoodSearchResults({ results, searching, onSelect }) {
  if (searching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Search for foods to add to your diary
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((food) => (
        <button
          key={food.id}
          className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
          onClick={() => onSelect(food)}
        >
          {food.image_url ? (
            <img src={food.image_url} alt={food.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {food.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{food.name}</p>
            <p className="text-xs text-muted-foreground">
              {food.brand && `${food.brand} · `}{food.serving_size || '100g'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold">{food.calories} kcal</p>
            <p className="text-[10px] text-muted-foreground">
              P:{food.protein || 0} C:{food.carbs || 0} F:{food.fat || 0}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}