import React from 'react';
import { TrendingUp, CalendarDays } from 'lucide-react';
import { endOfWeek, format, startOfWeek, subDays } from 'date-fns';

const toDateString = (date) => format(date, 'yyyy-MM-dd');

const sumCalories = (entries) => entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);

export default function WeeklyReportCard({ entries = [] }) {
  const safeEntries = entries.filter(entry => entry?.date);
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = subDays(thisWeekStart, 7);
  const lastWeekEnd = subDays(thisWeekEnd, 7);

  const thisWeekEntries = safeEntries.filter(entry => entry.date >= toDateString(thisWeekStart) && entry.date <= toDateString(thisWeekEnd));
  const lastWeekEntries = safeEntries.filter(entry => entry.date >= toDateString(lastWeekStart) && entry.date <= toDateString(lastWeekEnd));
  const thisWeekCalories = sumCalories(thisWeekEntries);
  const lastWeekCalories = sumCalories(lastWeekEntries);
  const improvedPercent = lastWeekCalories > 0 ? Math.round(((thisWeekCalories - lastWeekCalories) / lastWeekCalories) * 100) : 0;
  const loggedDays = new Set(thisWeekEntries.map(entry => entry.date)).size;

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Weekly report</p>
          <h3 className="text-lg font-bold font-heading">{improvedPercent >= 0 ? 'Improved' : 'Changed'} {Math.abs(improvedPercent)}% this week</h3>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-lg font-bold">{loggedDays}</p>
          <p className="text-[10px] text-muted-foreground">days logged</p>
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-lg font-bold">{Math.round(thisWeekCalories)}</p>
          <p className="text-[10px] text-muted-foreground">kcal logged</p>
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-lg font-bold">{thisWeekEntries.length}</p>
          <p className="text-[10px] text-muted-foreground">food entries</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5" />
        {format(thisWeekStart, 'd MMM')} – {format(thisWeekEnd, 'd MMM')}
      </div>
    </div>
  );
}