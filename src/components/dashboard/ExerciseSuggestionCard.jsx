import React, { useMemo } from 'react';
import { Dumbbell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExerciseSuggestionCard({ caloriesConsumed, calorieGoal, caloriesBurned, date, onLogExercise, isLogging }) {
  const suggestion = useMemo(() => {
    const balance = Math.round((Number(caloriesConsumed) || 0) - ((Number(calorieGoal) || 0) + (Number(caloriesBurned) || 0)));

    if (balance > 250) {
      return {
        title: 'Brisk walk + light circuits',
        detail: 'You’re above target today. A steady walk with bodyweight moves can help balance the surplus.',
        type: 'cardio',
        duration_minutes: 45,
        calories_burned: Math.min(450, Math.max(250, balance)),
      };
    }

    if (balance > 0) {
      return {
        title: 'Quick evening walk',
        detail: 'A short low-impact walk should cover today’s small calorie surplus.',
        type: 'cardio',
        duration_minutes: 25,
        calories_burned: Math.max(120, balance),
      };
    }

    return {
      title: 'Mobility and strength session',
      detail: 'You’re in a calorie deficit, so keep it moderate and focus on maintaining strength.',
      type: 'strength',
      duration_minutes: 30,
      calories_burned: 150,
    };
  }, [caloriesConsumed, calorieGoal, caloriesBurned]);

  const handleLog = () => {
    onLogExercise({
      date,
      name: suggestion.title,
      type: suggestion.type,
      duration_minutes: suggestion.duration_minutes,
      calories_burned: suggestion.calories_burned,
      notes: 'Suggested from daily calorie balance',
    });
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <Dumbbell className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Exercise suggestion</p>
          <h3 className="text-sm font-semibold leading-snug">{suggestion.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{suggestion.detail}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-lg font-bold">{suggestion.duration_minutes}</p>
          <p className="text-muted-foreground">minutes</p>
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-lg font-bold text-primary">{suggestion.calories_burned}</p>
          <p className="text-muted-foreground">kcal burned</p>
        </div>
      </div>

      <Button onClick={handleLog} disabled={isLogging} className="w-full rounded-2xl h-11 gap-2">
        <Plus className="w-4 h-4" /> Log Exercise
      </Button>
    </div>
  );
}