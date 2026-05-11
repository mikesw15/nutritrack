import React from 'react';
import { format } from 'date-fns';
import MealPlanCard from '@/components/meal-planner/MealPlanCard';

const mealTypes = ['breakfast', 'lunch', 'dinner'];

export default function MealPlanDay({ date, meals, getPreviousMeal, onSave, onDelete, onCopyPrevious }) {
  const dailyCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="rounded-3xl bg-muted/40 border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold font-heading">{format(new Date(date), 'EEEE')}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(date), 'd MMM')}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{Math.round(dailyCalories)}</p>
          <p className="text-[10px] text-muted-foreground">planned kcal</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {mealTypes.map((mealType) => (
          <MealPlanCard
            key={mealType}
            date={date}
            mealType={mealType}
            meal={meals.find((meal) => meal.meal_type === mealType)}
            previousMeal={getPreviousMeal(date, mealType)}
            onSave={onSave}
            onDelete={onDelete}
            onCopyPrevious={onCopyPrevious}
          />
        ))}
      </div>
    </div>
  );
}