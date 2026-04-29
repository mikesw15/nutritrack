import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { addDays, endOfWeek, format, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Download, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GroceryListItem from '@/components/grocery/GroceryListItem';

const getDateString = (date) => format(date, 'yyyy-MM-dd');

const buildGroceryList = (entries) => {
  const grouped = new Map();

  entries.forEach((entry) => {
    const key = [entry.food_name, entry.brand || '', entry.serving_size || 'serving'].join('|').toLowerCase();
    const current = grouped.get(key) || {
      name: entry.food_name,
      brand: entry.brand || '',
      serving_size: entry.serving_size || 'serving',
      image_url: entry.image_url || '',
      quantity: 0,
      entries: 0,
    };

    current.quantity = Math.round((current.quantity + (entry.quantity || 1)) * 100) / 100;
    current.entries += 1;
    if (!current.image_url && entry.image_url) current.image_url = entry.image_url;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export default function GroceryList() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const startDate = getDateString(weekStart);
  const endDate = getDateString(weekEnd);

  const { data: diaryEntries = [], isLoading } = useQuery({
    queryKey: ['weeklyGroceryDiary', startDate, endDate],
    queryFn: () => base44.entities.DiaryEntry.list('-date', 500),
  });

  const weeklyEntries = useMemo(() => (
    diaryEntries.filter(entry => entry.date >= startDate && entry.date <= endDate)
  ), [diaryEntries, startDate, endDate]);

  const groceryItems = useMemo(() => buildGroceryList(weeklyEntries), [weeklyEntries]);

  const exportCsv = () => {
    const rows = [
      ['Food', 'Brand', 'Quantity', 'Serving size', 'Diary entries'],
      ...groceryItems.map(item => [item.name, item.brand, item.quantity, item.serving_size, item.entries]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grocery-list-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-4">
      <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading">Weekly Grocery List</h1>
              <p className="text-xs text-muted-foreground">Consolidated from diary entries planned this week.</p>
            </div>
          </div>
          <Button onClick={exportCsv} disabled={groceryItems.length === 0} className="rounded-xl gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <div className="flex items-center justify-between mt-5 bg-muted rounded-2xl p-2">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setWeekStart(prev => subDays(prev, 7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="w-4 h-4 text-primary" />
            {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setWeekStart(prev => addDays(prev, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : groceryItems.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-8 text-center shadow-sm">
          <ShoppingCart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-semibold">No planned foods this week</p>
          <p className="text-xs text-muted-foreground mt-1">Add meals to your diary for this week and they’ll appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold">{groceryItems.length} grocery items</p>
            <p className="text-xs text-muted-foreground">From {weeklyEntries.length} diary entries</p>
          </div>
          {groceryItems.map(item => <GroceryListItem key={`${item.name}-${item.brand}-${item.serving_size}`} item={item} />)}
        </div>
      )}
    </div>
  );
}