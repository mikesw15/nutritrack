import React, { useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

export default function MealPlanCard({ date, mealType, meal, previousMeal, onSave, onDelete, onCopyPrevious }) {
  const [mealName, setMealName] = useState(meal?.meal_name || '');
  const [calories, setCalories] = useState(meal?.calories || '');

  React.useEffect(() => {
    setMealName(meal?.meal_name || '');
    setCalories(meal?.calories || '');
  }, [meal?.id, meal?.meal_name, meal?.calories]);

  const handleSave = () => {
    if (!mealName.trim()) return;
    onSave({ date, meal_type: mealType, meal_name: mealName.trim(), calories: Number(calories) || 0 });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{mealLabels[mealType]}</p>
        {meal?.id && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onDelete(meal.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="e.g. Chicken salad" className="h-9 rounded-xl" />
      <div className="flex gap-2">
        <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="kcal" className="h-9 rounded-xl" />
        <Button size="sm" className="h-9 rounded-xl" onClick={handleSave}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" onClick={() => onCopyPrevious(date, mealType, previousMeal)} disabled={!previousMeal}>
        <Copy className="w-3.5 h-3.5" /> Copy previous
      </Button>
    </div>
  );
}