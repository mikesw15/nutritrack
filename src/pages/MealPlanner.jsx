import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, startOfWeek, format } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDateString } from '@/lib/dateUtils';
import MealPlanDay from '@/components/meal-planner/MealPlanDay';

export default function MealPlanner() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(getDateString(startOfWeek(new Date(), { weekStartsOn: 1 })));

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => getDateString(addDays(new Date(weekStart), index))), [weekStart]);

  const { data: plannedMeals = [] } = useQuery({
    queryKey: ['plannedMeals', weekStart],
    queryFn: async () => {
      const weeks = await Promise.all(weekDates.map((date) => base44.entities.PlannedMeal.filter({ date })));
      return weeks.flat();
    },
  });

  const refreshPlanner = () => queryClient.invalidateQueries({ queryKey: ['plannedMeals', weekStart] });

  const saveMutation = useMutation({
    mutationFn: async (mealData) => {
      const existing = plannedMeals.find((meal) => meal.date === mealData.date && meal.meal_type === mealData.meal_type);
      if (existing) return base44.entities.PlannedMeal.update(existing.id, mealData);
      return base44.entities.PlannedMeal.create(mealData);
    },
    onSuccess: refreshPlanner,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlannedMeal.delete(id),
    onSuccess: refreshPlanner,
  });

  const getMealsForDate = (date) => plannedMeals.filter((meal) => meal.date === date);
  const getPreviousMeal = (date, mealType) => {
    const currentIndex = weekDates.indexOf(date);
    if (currentIndex <= 0) return null;
    return plannedMeals.find((meal) => meal.date === weekDates[currentIndex - 1] && meal.meal_type === mealType);
  };

  const copyPreviousMeal = (date, mealType, previousMeal) => {
    if (!previousMeal) return;
    saveMutation.mutate({ date, meal_type: mealType, meal_name: previousMeal.meal_name, calories: previousMeal.calories || 0, notes: previousMeal.notes || '' });
  };

  const weekTotal = plannedMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading">Meal Planner</h1>
            <p className="text-xs text-muted-foreground">Plan breakfast, lunch and dinner for the week.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setWeekStart(getDateString(addDays(new Date(weekStart), -7)))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="rounded-xl bg-card border border-border px-4 py-2 text-center min-w-44">
            <p className="text-xs text-muted-foreground">Week of</p>
            <p className="text-sm font-semibold">{format(new Date(weekStart), 'd MMM yyyy')}</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setWeekStart(getDateString(addDays(new Date(weekStart), 7)))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-semibold">Expected weekly intake</p>
          <p className="text-xs text-muted-foreground">Calculated from all planned meals this week.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{Math.round(weekTotal)}</p>
          <p className="text-xs text-muted-foreground">kcal planned</p>
        </div>
      </div>

      <div className="space-y-4">
        {weekDates.map((date) => (
          <MealPlanDay
            key={date}
            date={date}
            meals={getMealsForDate(date)}
            getPreviousMeal={getPreviousMeal}
            onSave={(meal) => saveMutation.mutate(meal)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onCopyPrevious={copyPreviousMeal}
          />
        ))}
      </div>
    </div>
  );
}