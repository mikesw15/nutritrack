import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getDateString, getNextDate, getPrevDate, formatDate } from '@/lib/dateUtils';
import CalorieRing from '@/components/dashboard/CalorieRing';
import MacroBar from '@/components/dashboard/MacroBar';
import DaySummary from '@/components/dashboard/DaySummary';
import MealSection from '@/components/dashboard/MealSection';
import WaterTracker from '@/components/dashboard/WaterTracker';
import { Link } from 'react-router-dom';

const DEFAULT_GOALS = {
  calorie_goal: 2000,
  protein_goal: 150,
  carbs_goal: 250,
  fat_goal: 65,
};

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(getDateString());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const goals = {
    calorie_goal: user?.calorie_goal || DEFAULT_GOALS.calorie_goal,
    protein_goal: user?.protein_goal || DEFAULT_GOALS.protein_goal,
    carbs_goal: user?.carbs_goal || DEFAULT_GOALS.carbs_goal,
    fat_goal: user?.fat_goal || DEFAULT_GOALS.fat_goal,
  };

  const { data: entries = [] } = useQuery({
    queryKey: ['diary', currentDate],
    queryFn: () => base44.entities.DiaryEntry.filter({ date: currentDate }),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', currentDate],
    queryFn: () => base44.entities.ExerciseEntry.filter({ date: currentDate }),
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water', currentDate],
    queryFn: () => base44.entities.WaterLog.filter({ date: currentDate }),
  });

  const waterLog = waterLogs[0];

  const waterMutation = useMutation({
    mutationFn: async (newGlasses) => {
      if (waterLog) {
        return base44.entities.WaterLog.update(waterLog.id, { glasses: newGlasses });
      }
      return base44.entities.WaterLog.create({ date: currentDate, glasses: newGlasses, goal: 8 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['water', currentDate] }),
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const mealEntries = {};
  mealTypes.forEach(type => {
    mealEntries[type] = entries.filter(e => e.meal_type === type);
  });

  const totalCalories = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totalProtein = entries.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0);
  const totalBurned = exercises.reduce((s, e) => s + (e.calories_burned || 0), 0);

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-heading">NutriTrack AI</h1>
        <Link to="/ai-coach">
          <Button variant="outline" size="sm" className="rounded-full gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Coach
          </Button>
        </Link>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-3 border border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(getPrevDate(currentDate))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold">{formatDate(currentDate)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(getNextDate(currentDate))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calorie Ring + Summary */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex justify-center">
          <CalorieRing consumed={totalCalories} goal={goals.calorie_goal} burned={totalBurned} />
        </div>
        <DaySummary consumed={totalCalories} burned={totalBurned} goal={goals.calorie_goal} />
      </div>

      {/* Macro Bars */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-4">
          <MacroBar label="Protein" current={totalProtein} goal={goals.protein_goal} color="bg-chart-1" />
          <MacroBar label="Carbs" current={totalCarbs} goal={goals.carbs_goal} color="bg-chart-2" />
          <MacroBar label="Fat" current={totalFat} goal={goals.fat_goal} color="bg-chart-4" />
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {mealTypes.map(type => (
          <MealSection
            key={type}
            mealType={type}
            entries={mealEntries[type]}
            date={currentDate}
          />
        ))}
      </div>

      {/* Water */}
      <WaterTracker
        glasses={waterLog?.glasses || 0}
        goal={waterLog?.goal || 8}
        onAdd={() => waterMutation.mutate((waterLog?.glasses || 0) + 1)}
        onRemove={() => waterMutation.mutate(Math.max(0, (waterLog?.glasses || 0) - 1))}
      />

      <div className="h-4" />
    </div>
  );
}