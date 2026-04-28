import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function RecipeForm({ recipe, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    servings: recipe?.servings || 1,
    ingredients: recipe?.ingredients || [],
  });
  const [newIngredient, setNewIngredient] = useState({ food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0, quantity: 1, unit: 'g' });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const totals = data.ingredients.reduce(
        (acc, ing) => ({
          calories: acc.calories + (ing.calories || 0),
          protein: acc.protein + (ing.protein || 0),
          carbs: acc.carbs + (ing.carbs || 0),
          fat: acc.fat + (ing.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const saveData = {
        ...data,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
        calories_per_serving: Math.round(totals.calories / (data.servings || 1)),
        protein_per_serving: Math.round(totals.protein / (data.servings || 1) * 10) / 10,
        carbs_per_serving: Math.round(totals.carbs / (data.servings || 1) * 10) / 10,
        fat_per_serving: Math.round(totals.fat / (data.servings || 1) * 10) / 10,
      };
      if (recipe?.id) return base44.entities.Recipe.update(recipe.id, saveData);
      return base44.entities.Recipe.create(saveData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success(recipe ? 'Recipe updated' : 'Recipe created');
      onClose();
    },
  });

  const addIngredient = () => {
    if (!newIngredient.food_name) return;
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...newIngredient }],
    }));
    setNewIngredient({ food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0, quantity: 1, unit: 'g' });
  };

  const removeIngredient = (idx) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{recipe ? 'Edit Recipe' : 'New Recipe'}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Recipe name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="rounded-xl"
      />
      <Textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="rounded-xl h-16"
      />
      <div className="flex items-center gap-2">
        <span className="text-sm">Servings:</span>
        <Input
          type="number"
          min={1}
          value={formData.servings}
          onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
          className="w-20 rounded-xl"
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Ingredients</h4>
        {formData.ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2 text-sm bg-muted rounded-xl p-2">
            <span className="flex-1 truncate">{ing.food_name}</span>
            <span className="text-xs text-muted-foreground">{ing.calories} kcal</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeIngredient(i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Ingredient name"
            value={newIngredient.food_name}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, food_name: e.target.value }))}
            className="rounded-xl col-span-2"
          />
          <Input
            type="number"
            placeholder="Calories"
            value={newIngredient.calories || ''}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, calories: parseFloat(e.target.value) || 0 }))}
            className="rounded-xl"
          />
          <Input
            type="number"
            placeholder="Protein (g)"
            value={newIngredient.protein || ''}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
            className="rounded-xl"
          />
          <Input
            type="number"
            placeholder="Carbs (g)"
            value={newIngredient.carbs || ''}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
            className="rounded-xl"
          />
          <Input
            type="number"
            placeholder="Fat (g)"
            value={newIngredient.fat || ''}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
            className="rounded-xl"
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={addIngredient}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Ingredient
        </Button>
      </div>

      <Button
        className="w-full rounded-xl"
        onClick={() => saveMutation.mutate(formData)}
        disabled={saveMutation.isPending || !formData.name}
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {recipe ? 'Update Recipe' : 'Save Recipe'}
      </Button>
    </motion.div>
  );
}