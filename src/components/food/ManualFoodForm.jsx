import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emptyFood = {
  name: '',
  brand: '',
  serving_size: '1 serving',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  image_url: '',
};

export default function ManualFoodForm({ onAdd, isAdding }) {
  const [food, setFood] = useState(emptyFood);

  const updateField = (field, value) => {
    setFood(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!food.name || !food.calories) return;

    onAdd({
      ...food,
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      sugar: 0,
      fibre: 0,
      salt: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Input placeholder="Food name" value={food.name} onChange={(e) => updateField('name', e.target.value)} className="rounded-xl" />
        <Input placeholder="Brand or supermarket" value={food.brand} onChange={(e) => updateField('brand', e.target.value)} className="rounded-xl" />
        <Input placeholder="Serving size" value={food.serving_size} onChange={(e) => updateField('serving_size', e.target.value)} className="rounded-xl" />
        <Input placeholder="Image URL (optional)" value={food.image_url} onChange={(e) => updateField('image_url', e.target.value)} className="rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Calories" value={food.calories} onChange={(e) => updateField('calories', e.target.value)} className="rounded-xl" />
        <Input type="number" placeholder="Protein (g)" value={food.protein} onChange={(e) => updateField('protein', e.target.value)} className="rounded-xl" />
        <Input type="number" placeholder="Carbs (g)" value={food.carbs} onChange={(e) => updateField('carbs', e.target.value)} className="rounded-xl" />
        <Input type="number" placeholder="Fat (g)" value={food.fat} onChange={(e) => updateField('fat', e.target.value)} className="rounded-xl" />
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={isAdding || !food.name || !food.calories}>
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Add to Diary
      </Button>
    </form>
  );
}