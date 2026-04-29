import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Flame, Dumbbell, Droplets, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { getDateString, getNextDate, getPrevDate, formatDate } from '@/lib/dateUtils';
import CalorieRing from '@/components/dashboard/CalorieRing';
import MealSection from '@/components/dashboard/MealSection';
import DayPhotoGallery from '@/components/dashboard/DayPhotoGallery';
import { cn } from '@/lib/utils';

const DEFAULT_GOALS = {
  calorie_goal: 2000,
  protein_goal: 150,
  carbs_goal: 250,
  fat_goal: 65,
};

function MacroRow({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{Math.round(current)}/{goal}g</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(getDateString());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

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
      if (waterLog) return base44.entities.WaterLog.update(waterLog.id, { glasses: newGlasses });
      return base44.entities.WaterLog.create({ date: currentDate, glasses: newGlasses, goal: 8 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['water', currentDate] }),
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const mealEntries = {};
  mealTypes.forEach(type => { mealEntries[type] = entries.filter(e => e.meal_type === type); });

  const totalCalories = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totalProtein = entries.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0);
  const totalBurned = exercises.reduce((s, e) => s + (e.calories_burned || 0), 0);
  const remaining = Math.max(0, goals.calorie_goal + totalBurned - totalCalories);

  const glasses = waterLog?.glasses || 0;
  const waterGoal = waterLog?.goal || 8;
  const waterMl = glasses * 250;
  const waterGoalMl = waterGoal * 250;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{formatDate(currentDate)}</p>
          <h1 className="text-lg font-bold font-heading">Daily Diary</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(getPrevDate(currentDate))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(getNextDate(currentDate))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Calories remaining */}
        <div className="col-span-2 md:col-span-1 bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Calories Remaining</p>
          <div className="flex items-center gap-3">
            <CalorieRing consumed={totalCalories} goal={goals.calorie_goal} burned={totalBurned} size="sm" />
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between gap-4"><span>Goal</span><span className="font-semibold text-foreground">{goals.calorie_goal}</span></div>
              <div className="flex justify-between gap-4"><span>Food</span><span className="font-semibold text-foreground">{totalCalories}</span></div>
              <div className="flex justify-between gap-4"><span>Exercise</span><span className="font-semibold text-foreground">{totalBurned}</span></div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Macros</p>
          <MacroRow label="Protein" current={totalProtein} goal={goals.protein_goal} color="bg-blue-500" />
          <MacroRow label="Carbs" current={totalCarbs} goal={goals.carbs_goal} color="bg-amber-400" />
          <MacroRow label="Fat" current={totalFat} goal={goals.fat_goal} color="bg-orange-400" />
        </div>

        {/* Micronutrients placeholder */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Micronutrients</p>
          {[
            { label: 'Sugar', current: entries.reduce((s,e)=>s+(e.sugar||0),0), goal: 90, color: 'bg-amber-400' },
            { label: 'Fibre', current: entries.reduce((s,e)=>s+(e.fibre||0),0), goal: 30, color: 'bg-primary' },
            { label: 'Salt', current: entries.reduce((s,e)=>s+(e.salt||0),0), goal: 6, color: 'bg-red-400' },
          ].map(m => <MacroRow key={m.label} {...m} />)}
        </div>

        {/* Water */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Water</p>
          <p className="text-2xl font-bold font-heading text-foreground">
            {(waterMl / 1000).toFixed(1)}L <span className="text-sm font-normal text-muted-foreground">/ {(waterGoalMl / 1000).toFixed(1)}L</span>
          </p>
          <div className="flex gap-1 mt-2 mb-3">
            {Array.from({ length: Math.min(waterGoal, 8) }).map((_, i) => (
              <div key={i} className={cn("flex-1 h-4 rounded-full", i < glasses ? "bg-blue-400" : "bg-muted")} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs rounded-lg" onClick={() => waterMutation.mutate(Math.max(0, glasses - 1))} disabled={glasses <= 0}>
              <Minus className="w-3 h-3" />
            </Button>
            <Button size="sm" className="flex-1 h-7 text-xs rounded-lg" onClick={() => waterMutation.mutate(glasses + 1)}>
              Add 250ml
            </Button>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Daily Diary</h2>
        </div>
        <div className="divide-y divide-border">
          {mealTypes.map(type => (
            <MealSection key={type} mealType={type} entries={mealEntries[type]} date={currentDate} />
          ))}
        </div>
      </div>

      {/* Photo Gallery */}
      <DayPhotoGallery entries={entries} />

      <div className="h-4" />
    </div>
  );
}