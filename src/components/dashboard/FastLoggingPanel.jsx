import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Flame, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPrevDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

export default function FastLoggingPanel({ date }) {
  const queryClient = useQueryClient();
  const [quickCalories, setQuickCalories] = useState('');

  const { data: recentEntries = [] } = useQuery({ queryKey: ['dashboardRecentFoods'], queryFn: () => base44.entities.DiaryEntry.list('-created_date', 10) });
  const { data: favouriteMeals = [] } = useQuery({ queryKey: ['favouriteMeals'], queryFn: () => base44.entities.FavouriteMeal.list('-created_date', 5) });
  const { data: yesterdayEntries = [] } = useQuery({ queryKey: ['dashboardYesterdayEntries', date], queryFn: () => base44.entities.DiaryEntry.filter({ date: getPrevDate(date) }) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['diary', date] });

  const addEntryMutation = useMutation({
    mutationFn: (entry) => base44.entities.DiaryEntry.create({ ...entry, date }),
    onSuccess: () => { refresh(); toast.success('Added'); },
  });

  const bulkAddMutation = useMutation({
    mutationFn: (entries) => base44.entities.DiaryEntry.bulkCreate(entries),
    onSuccess: () => { refresh(); toast.success('Meals added'); },
  });

  const addRecent = (entry) => {
    const { id, created_date, updated_date, created_by, ...copy } = entry;
    addEntryMutation.mutate(copy);
  };

  const addFavourite = (meal) => {
    bulkAddMutation.mutate((meal.items || []).map(({ id, created_date, updated_date, created_by, ...item }) => ({ ...item, date, meal_type: meal.meal_type || 'lunch' })));
  };

  const repeatYesterday = () => {
    bulkAddMutation.mutate(yesterdayEntries.map(({ id, created_date, updated_date, created_by, ...entry }) => ({ ...entry, date })));
  };

  const quickAdd = () => {
    const calories = Number(quickCalories);
    if (!calories) return;
    addEntryMutation.mutate({ meal_type: 'snacks', food_name: 'Quick add calories', calories, protein: 0, carbs: 0, fat: 0, serving_size: 'manual entry' });
    setQuickCalories('');
  };

  const uniqueRecent = recentEntries.reduce((acc, entry) => acc.find(item => item.food_name === entry.food_name) ? acc : [...acc, entry], []).slice(0, 5);

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Fast logging</p>
          <h3 className="text-lg font-bold font-heading">Under 3 taps</h3>
        </div>
        <Flame className="w-5 h-5 text-primary" />
      </div>

      <div className="flex gap-2">
        <Input type="number" value={quickCalories} onChange={(e) => setQuickCalories(e.target.value)} placeholder="Quick add kcal" className="h-11 rounded-2xl" />
        <Button onClick={quickAdd} className="h-11 rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
      </div>

      <Button variant="secondary" onClick={repeatYesterday} disabled={yesterdayEntries.length === 0 || bulkAddMutation.isPending} className="w-full h-11 rounded-2xl gap-2">
        <Copy className="w-4 h-4" /> Repeat yesterday’s meals
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Recent foods</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {uniqueRecent.map(entry => (
            <button key={entry.id} onClick={() => addRecent(entry)} className="min-w-32 rounded-2xl border border-border bg-background p-3 text-left">
              <p className="text-xs font-semibold truncate">{entry.food_name}</p>
              <p className="text-[10px] text-muted-foreground">{entry.calories} kcal</p>
            </button>
          ))}
        </div>
      </div>

      {favouriteMeals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Favourite meals</p>
          {favouriteMeals.slice(0, 2).map(meal => (
            <button key={meal.id} onClick={() => addFavourite(meal)} className="w-full flex items-center justify-between rounded-2xl border border-border bg-background p-3 text-left">
              <span className="text-xs font-semibold truncate"><Star className="w-3 h-3 inline mr-1 text-primary" />{meal.name}</span>
              <span className="text-[10px] text-muted-foreground">{meal.total_calories || 0} kcal</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}