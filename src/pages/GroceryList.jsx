import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { addDays, endOfWeek, format, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Download, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GroceryListItem from '@/components/grocery/GroceryListItem';

const getDateString = (date) => format(date, 'yyyy-MM-dd');

const buildGroceryList = (meals) => {
  const grouped = new Map();

  meals.forEach((meal) => {
    const names = String(meal.notes || meal.meal_name || '')
      .split(/,|\n|\+| and /i)
      .map(item => item.trim())
      .filter(Boolean);
    const items = names.length ? names : [meal.meal_name];

    items.forEach((name) => {
      const key = name.toLowerCase();
      const current = grouped.get(key) || { name, brand: '', serving_size: 'planned meal ingredient', image_url: '', quantity: 0, entries: 0 };
      current.quantity += 1;
      current.entries += 1;
      grouped.set(key, current);
    });
  });

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export default function GroceryList() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const startDate = getDateString(weekStart);
  const endDate = getDateString(weekEnd);

  const [boughtItems, setBoughtItems] = useState({});

  const { data: plannedMeals = [], isLoading } = useQuery({
    queryKey: ['weeklyGroceryPlannedMeals', startDate, endDate],
    queryFn: () => base44.entities.PlannedMeal.list('-date', 500),
  });

  const weeklyMeals = useMemo(() => (
    plannedMeals.filter(meal => meal.date >= startDate && meal.date <= endDate)
  ), [plannedMeals, startDate, endDate]);

  const groceryItems = useMemo(() => buildGroceryList(weeklyMeals), [weeklyMeals]);

  const copyToClipboard = () => {
    const text = groceryItems
      .map(item => `${boughtItems[item.name] ? '✓' : '☐'} ${item.quantity}x ${item.name}`)
      .join('\n');
    navigator.clipboard.writeText(`Grocery list ${startDate} to ${endDate}\n\n${text}`);
  };

  const exportCsv = () => {
    const rows = [
      ['Bought', 'Food', 'Quantity', 'Serving size', 'Planned meals'],
      ...groceryItems.map(item => [boughtItems[item.name] ? 'Yes' : 'No', item.name, item.quantity, item.serving_size, item.entries]),
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
              <p className="text-xs text-muted-foreground">Automatically generated from meals in your Meal Planner.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} disabled={groceryItems.length === 0} className="rounded-xl gap-2">
              <Copy className="w-4 h-4" /> Copy
            </Button>
            <Button onClick={exportCsv} disabled={groceryItems.length === 0} className="rounded-xl gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
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
          <p className="text-xs text-muted-foreground mt-1">Plan meals in the Meal Planner and they’ll appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold">{groceryItems.length} grocery items</p>
            <p className="text-xs text-muted-foreground">From {weeklyMeals.length} planned meals</p>
          </div>
          {groceryItems.map(item => (
            <GroceryListItem
              key={`${item.name}-${item.brand}-${item.serving_size}`}
              item={item}
              checked={!!boughtItems[item.name]}
              onToggle={() => setBoughtItems(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}