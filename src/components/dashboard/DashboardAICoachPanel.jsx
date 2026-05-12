import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Bot, Loader2, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = ['high protein', 'vegetarian', 'low carb', 'quick', 'budget', 'comfort food'];

export default function DashboardAICoachPanel({ totals, goals, calorieBudget, date }) {
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState(['high protein']);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const insight = useMemo(() => {
    const proteinLeft = Math.max(0, Math.round(goals.protein_goal - totals.protein));
    if (totals.calories > goals.calorie_goal) return 'You are over your calorie target today. Keep the next meal lighter.';
    if (proteinLeft > 20) return `You need ${proteinLeft}g more protein today.`;
    return `On track. You have ${Math.round(calorieBudget)} calories remaining.`;
  }, [totals, goals, calorieBudget]);

  const toggleCategory = (category) => {
    setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  };

  const generateRecipe = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create one simple UK-friendly meal recipe for today's remaining calorie budget of ${Math.round(calorieBudget)} kcal. Match these selected categories: ${selectedCategories.join(', ') || 'balanced'}. Include common supermarket ingredients and realistic nutrition totals.`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
      },
    });
    setRecipe(result);
    setLoading(false);
  };

  const addToDiary = async () => {
    if (!recipe) return;
    setAdding(true);
    await base44.entities.DiaryEntry.create({
      date,
      meal_type: 'dinner',
      food_name: recipe.name,
      brand: 'AI recipe',
      quantity: 1,
      serving_size: '1 meal',
      calories: Number(recipe.calories) || 0,
      protein: Number(recipe.protein) || 0,
      carbs: Number(recipe.carbs) || 0,
      fat: Number(recipe.fat) || 0,
    });
    await queryClient.invalidateQueries({ queryKey: ['diary', date] });
    setAdding(false);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">AI recipe generator</p>
          <h3 className="text-sm font-semibold leading-snug">{insight}</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selectedCategories.includes(category)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border hover:text-foreground'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {recipe && (
        <div className="bg-muted rounded-2xl p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{recipe.name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{recipe.description}</p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">{Math.round(recipe.calories || 0)} kcal</span>
          </div>
          <p className="text-xs text-muted-foreground">{(recipe.ingredients || []).join(' · ')}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-card p-2"><b>{Math.round(recipe.protein || 0)}g</b><br />protein</div>
            <div className="rounded-xl bg-card p-2"><b>{Math.round(recipe.carbs || 0)}g</b><br />carbs</div>
            <div className="rounded-xl bg-card p-2"><b>{Math.round(recipe.fat || 0)}g</b><br />fat</div>
          </div>
          <Button onClick={addToDiary} disabled={adding} variant="outline" className="w-full rounded-2xl h-10 gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add to today’s diary
          </Button>
        </div>
      )}

      <Button onClick={generateRecipe} disabled={loading} className="w-full rounded-2xl h-11 gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate Recipe
      </Button>
    </div>
  );
}