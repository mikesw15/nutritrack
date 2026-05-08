import React, { useMemo, useState } from 'react';
import { Check, Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const numberFields = ['calories', 'protein', 'carbs', 'fat'];

const emptyItem = {
  name: '',
  portion_size: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export default function MealAnalysisReview({ analysis, onConfirm, isAdding }) {
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState(analysis?.items?.length ? analysis.items : [emptyItem]);

  const totals = useMemo(() => items.reduce((sum, item) => ({
    calories: sum.calories + (Number(item.calories) || 0),
    protein: sum.protein + (Number(item.protein) || 0),
    carbs: sum.carbs + (Number(item.carbs) || 0),
    fat: sum.fat + (Number(item.fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [items]);

  const updateItem = (index, field, value) => {
    setItems(current => current.map((item, i) => i === index ? {
      ...item,
      [field]: numberFields.includes(field) ? Number(value) : value,
    } : item));
  };

  const removeItem = (index) => setItems(current => current.filter((_, i) => i !== index));

  const handleConfirm = () => {
    const names = items.map(item => item.name).filter(Boolean);
    onConfirm({
      name: names.length ? `AI meal: ${names.join(', ')}` : 'AI analysed meal',
      serving_size: items.map(item => `${item.name || 'Item'} (${item.portion_size || 'portion'})`).join(', '),
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    });
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">AI Meal Analysis</p>
          <p className="text-xs text-muted-foreground">Review the estimated items and portions before logging.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setEditing(!editing)}>
          <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Done' : 'Edit'}
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-card border border-border p-3 space-y-2">
            <div className="flex gap-2">
              {editing ? (
                <Input value={item.name || ''} onChange={(e) => updateItem(index, 'name', e.target.value)} placeholder="Food item" className="rounded-xl" />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name || 'Food item'}</p>
                  <p className="text-xs text-muted-foreground">{item.portion_size || 'Estimated portion'}</p>
                </div>
              )}
              {editing && items.length > 1 && (
                <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" onClick={() => removeItem(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {editing && (
              <Input value={item.portion_size || ''} onChange={(e) => updateItem(index, 'portion_size', e.target.value)} placeholder="Portion size" className="rounded-xl" />
            )}

            <div className="grid grid-cols-4 gap-2 text-center">
              {numberFields.map(field => (
                <div key={field} className="rounded-xl bg-muted/60 p-2">
                  {editing ? (
                    <Input type="number" value={item[field] || 0} onChange={(e) => updateItem(index, field, e.target.value)} className="h-8 text-center rounded-lg px-1" />
                  ) : (
                    <p className="text-sm font-bold">{Math.round(Number(item[field]) || 0)}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground capitalize">{field}{field !== 'calories' ? 'g' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Button variant="secondary" className="w-full rounded-xl gap-2" onClick={() => setItems(current => [...current, emptyItem])}>
          <Plus className="w-4 h-4" /> Add item
        </Button>
      )}

      <div className="grid grid-cols-4 gap-2 text-center rounded-2xl bg-card border border-border p-3">
        <div><p className="font-bold">{Math.round(totals.calories)}</p><p className="text-[10px] text-muted-foreground">kcal</p></div>
        <div><p className="font-bold">{Math.round(totals.protein)}g</p><p className="text-[10px] text-muted-foreground">protein</p></div>
        <div><p className="font-bold">{Math.round(totals.carbs)}g</p><p className="text-[10px] text-muted-foreground">carbs</p></div>
        <div><p className="font-bold">{Math.round(totals.fat)}g</p><p className="text-[10px] text-muted-foreground">fat</p></div>
      </div>

      <Button onClick={handleConfirm} className="w-full rounded-xl h-11 gap-2" disabled={isAdding || items.every(item => !item.name)}>
        <Check className="w-4 h-4" /> Confirm & Log Meal
      </Button>
    </div>
  );
}