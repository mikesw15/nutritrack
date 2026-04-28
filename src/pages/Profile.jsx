import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Target, Flame, Activity, LogOut, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    calorie_goal: 2000,
    protein_goal: 150,
    carbs_goal: 250,
    fat_goal: 65,
    goal_weight: '',
    height: '',
    activity_level: 'moderate',
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
      toast.success('Profile updated');
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

  return (
    <div className="px-4 pt-4 space-y-4">
      <h1 className="text-xl font-bold font-heading">Profile</h1>

      {/* User info */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Daily Goals</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Calorie Goal</Label>
            <Input
              type="number"
              value={formData.calorie_goal}
              onChange={(e) => setFormData(p => ({ ...p, calorie_goal: e.target.value }))}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Protein (g)</Label>
            <Input
              type="number"
              value={formData.protein_goal}
              onChange={(e) => setFormData(p => ({ ...p, protein_goal: e.target.value }))}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Carbs (g)</Label>
            <Input
              type="number"
              value={formData.carbs_goal}
              onChange={(e) => setFormData(p => ({ ...p, carbs_goal: e.target.value }))}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Fat (g)</Label>
            <Input
              type="number"
              value={formData.fat_goal}
              onChange={(e) => setFormData(p => ({ ...p, fat_goal: e.target.value }))}
              className="rounded-xl mt-1"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Body & Goals</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Goal Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.goal_weight}
              onChange={(e) => setFormData(p => ({ ...p, goal_weight: e.target.value }))}
              className="rounded-xl mt-1"
              placeholder="e.g. 70"
            />
          </div>
          <div>
            <Label className="text-xs">Height (cm)</Label>
            <Input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData(p => ({ ...p, height: e.target.value }))}
              className="rounded-xl mt-1"
              placeholder="e.g. 175"
            />
          </div>
        </div>
      </div>

      <Button className="w-full rounded-xl gap-2" onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Profile
      </Button>

      <Button
        variant="outline"
        className="w-full rounded-xl gap-2 text-destructive"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      <div className="h-4" />
    </div>
  );
}