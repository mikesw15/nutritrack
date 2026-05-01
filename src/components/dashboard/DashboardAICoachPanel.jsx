import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardAICoachPanel({ totals, goals }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const insight = useMemo(() => {
    const proteinLeft = Math.max(0, Math.round(goals.protein_goal - totals.protein));
    const carbsLeft = Math.max(0, Math.round(goals.carbs_goal - totals.carbs));
    const caloriesLeft = Math.max(0, Math.round(goals.calorie_goal - totals.calories));
    if (totals.calories > goals.calorie_goal) return 'You are over your calorie target today. Keep the next meal lighter.';
    if (proteinLeft > 20) return `You need ${proteinLeft}g more protein today.`;
    if (totals.carbs > goals.carbs_goal) return 'You are over on carbs today.';
    return `On track. You have ${caloriesLeft} calories and ${carbsLeft}g carbs remaining.`;
  }, [totals, goals]);

  const getMealSuggestion = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest one simple UK-friendly meal to fit these remaining nutrition targets: calories ${Math.max(0, goals.calorie_goal - totals.calories)}, protein ${Math.max(0, goals.protein_goal - totals.protein)}g, carbs ${Math.max(0, goals.carbs_goal - totals.carbs)}g, fat ${Math.max(0, goals.fat_goal - totals.fat)}g. Mention common Tesco, Asda or Sainsbury's ingredients. Keep it under 45 words.`,
    });
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">AI coach</p>
          <h3 className="text-sm font-semibold leading-snug">{insight}</h3>
        </div>
      </div>
      {suggestion && <p className="text-sm bg-muted rounded-2xl p-3 leading-relaxed">{suggestion}</p>}
      <Button onClick={getMealSuggestion} disabled={loading} className="w-full rounded-2xl h-11 gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Get Meal Suggestion
      </Button>
    </div>
  );
}