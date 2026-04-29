import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Target, Activity, LogOut, Loader2, Save, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: '1–3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
  { value: 'active', label: 'Active', desc: '6–7 days/week' },
];

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65,
    goal_weight: '', height: '', activity_level: 'moderate',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        calorie_goal: user.calorie_goal || 2000,
        protein_goal: user.protein_goal || 150,
        carbs_goal: user.carbs_goal || 250,
        fat_goal: user.fat_goal || 65,
        goal_weight: user.goal_weight || '',
        height: user.height || '',
        activity_level: user.activity_level || 'moderate',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile saved');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      calorie_goal: parseInt(formData.calorie_goal) || 2000,
      protein_goal: parseInt(formData.protein_goal) || 150,
      carbs_goal: parseInt(formData.carbs_goal) || 250,
      fat_goal: parseInt(formData.fat_goal) || 65,
      goal_weight: formData.goal_weight ? parseFloat(formData.goal_weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      activity_level: formData.activity_level,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold font-heading">Profile</h1>

      {/* User card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary-foreground">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-base">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Daily Nutrition Goals</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'calorie_goal', label: 'Calories', icon: Flame, color: 'text-orange-500', unit: 'kcal' },
            { key: 'protein_goal', label: 'Protein', icon: Beef, color: 'text-blue-500', unit: 'g' },
            { key: 'carbs_goal', label: 'Carbs', icon: Wheat, color: 'text-amber-500', unit: 'g' },
            { key: 'fat_goal', label: 'Fat', icon: Droplets, color: 'text-pink-500', unit: 'g' },
          ].map(({ key, label, icon: Icon, color, unit }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <Label className="text-xs font-medium">{label} ({unit})</Label>
              </div>
              <Input
                type="number"
                value={formData[key]}
                onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                className="rounded-xl h-9"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Body metrics */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Body & Goals</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Goal Weight (kg)</Label>
            <Input
              type="number" step="0.1"
              value={formData.goal_weight}
              onChange={(e) => setFormData(p => ({ ...p, goal_weight: e.target.value }))}
              className="rounded-xl h-9" placeholder="e.g. 70"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Height (cm)</Label>
            <Input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData(p => ({ ...p, height: e.target.value }))}
              className="rounded-xl h-9" placeholder="e.g. 175"
            />
          </div>
        </div>

        {/* Activity level */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Activity Level</Label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setFormData(p => ({ ...p, activity_level: value }))}
                className={`text-left p-3 rounded-xl border transition-all ${
                  formData.activity_level === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                }`}
              >
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] opacity-70">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <Button className="w-full rounded-xl h-10 gap-2 font-semibold" onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Profile
      </Button>

      <Button
        variant="outline"
        className="w-full rounded-xl h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      <div className="h-4" />
    </div>
  );
}