import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Check, Target, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const goals = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
];

const activityMultipliers = { low: 1.2, medium: 1.45, high: 1.7 };

function calculateTargets({ weight, height, age, activityLevel, goal }) {
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  const adjustment = goal === 'lose_weight' ? -400 : goal === 'gain_muscle' ? 250 : 0;
  const calories = Math.max(1200, Math.round((bmr * activityMultipliers[activityLevel]) + adjustment));
  return {
    calories,
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    goal: 'lose_weight',
    unitSystem: 'metric',
    weight: '',
    height: '',
    stone: '',
    pounds: '',
    feet: '',
    inches: '',
    age: '',
    activityLevel: 'medium',
  });

  const weightKg = form.unitSystem === 'imperial'
    ? (Number(form.stone) * 6.35029) + (Number(form.pounds) * 0.453592)
    : Number(form.weight);
  const heightCm = form.unitSystem === 'imperial'
    ? ((Number(form.feet) * 12) + Number(form.inches)) * 2.54
    : Number(form.height);
  const hasRequiredDetails = form.age && weightKg > 0 && heightCm > 0;

  const targets = calculateTargets({
    weight: weightKg || 75,
    height: heightCm || 175,
    age: Number(form.age) || 30,
    activityLevel: form.activityLevel,
    goal: form.goal,
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({
      onboarding_completed: true,
      goal: form.goal,
      weight: Math.round(weightKg * 10) / 10,
      height: Math.round(heightCm),
      age: Number(form.age),
      activity_level: form.activityLevel,
      calorie_goal: targets.calories,
      protein_goal: targets.protein,
      carbs_goal: targets.carbs,
      fat_goal: targets.fat,
      calorie_target: targets.calories,
      protein_target: targets.protein,
      carb_target: targets.carbs,
      fat_target: targets.fat,
    }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/', { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            {step === 1 ? <Target className="w-7 h-7 text-primary-foreground" /> : step === 2 ? <User className="w-7 h-7 text-primary-foreground" /> : <Activity className="w-7 h-7 text-primary-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          <h1 className="text-2xl font-bold font-heading">Set up NutriTrack</h1>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {goals.map(goal => (
              <button key={goal.value} onClick={() => setForm(prev => ({ ...prev, goal: goal.value }))} className={`w-full h-14 rounded-2xl border text-sm font-semibold transition-all ${form.goal === goal.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'}`}>
                {goal.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
              {[
                ['metric', 'Kg / cm'],
                ['imperial', 'Stone / ft']
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setForm(prev => ({ ...prev, unitSystem: value }))}
                  className={`h-10 rounded-xl text-xs font-semibold transition-all ${form.unitSystem === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {form.unitSystem === 'metric' ? (
              <>
                <Input type="number" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))} className="h-12 rounded-2xl" />
                <Input type="number" placeholder="Height (cm)" value={form.height} onChange={(e) => setForm(prev => ({ ...prev, height: e.target.value }))} className="h-12 rounded-2xl" />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Stone" value={form.stone} onChange={(e) => setForm(prev => ({ ...prev, stone: e.target.value }))} className="h-12 rounded-2xl" />
                  <Input type="number" placeholder="Lbs" value={form.pounds} onChange={(e) => setForm(prev => ({ ...prev, pounds: e.target.value }))} className="h-12 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Feet" value={form.feet} onChange={(e) => setForm(prev => ({ ...prev, feet: e.target.value }))} className="h-12 rounded-2xl" />
                  <Input type="number" placeholder="Inches" value={form.inches} onChange={(e) => setForm(prev => ({ ...prev, inches: e.target.value }))} className="h-12 rounded-2xl" />
                </div>
              </>
            )}

            <Input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value }))} className="h-12 rounded-2xl" />
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map(level => (
                <button key={level} onClick={() => setForm(prev => ({ ...prev, activityLevel: level }))} className={`h-11 rounded-xl border text-xs font-semibold capitalize ${form.activityLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {[['Calories', targets.calories, 'kcal'], ['Protein', targets.protein, 'g'], ['Carbs', targets.carbs, 'g'], ['Fat', targets.fat, 'g']].map(([label, value, unit]) => (
              <div key={label} className="rounded-2xl bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label} / day ({unit})</p>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full h-12 rounded-2xl font-semibold" onClick={() => step < 3 ? setStep(step + 1) : saveMutation.mutate()} disabled={(step === 2 && !hasRequiredDetails) || saveMutation.isPending}>
          {step < 3 ? <>Continue <ArrowRight className="w-4 h-4" /></> : <>Save Profile <Check className="w-4 h-4" /></>}
        </Button>
      </div>
    </div>
  );
}