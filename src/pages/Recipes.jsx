import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChefHat, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeForm from '@/components/recipes/RecipeForm';
import { toast } from 'sonner';

export default function Recipes() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted');
    },
  });

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-heading">My Recipes</h1>
        <Button
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => { setEditingRecipe(null); setShowForm(true); }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Recipe
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <RecipeForm
            recipe={editingRecipe}
            onClose={() => { setShowForm(false); setEditingRecipe(null); }}
          />
        )}
      </AnimatePresence>

      {recipes.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recipes yet. Create your first!</p>
        </div>
      )}

      <div className="space-y-3">
        {recipes.map((recipe) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{recipe.name}</h3>
                {recipe.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{recipe.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {recipe.calories_per_serving || 0} kcal/serving
                  </span>
                  <span className="text-xs text-muted-foreground">{recipe.servings} servings</span>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>P: {recipe.protein_per_serving || 0}g</span>
                  <span>C: {recipe.carbs_per_serving || 0}g</span>
                  <span>F: {recipe.fat_per_serving || 0}g</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { setEditingRecipe(recipe); setShowForm(true); }}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(recipe.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}