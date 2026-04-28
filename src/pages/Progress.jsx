import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, Plus, Scale, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import WeightChart from '@/components/progress/WeightChart';
import WeightLogForm from '@/components/progress/WeightLogForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function Progress() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: weightLogs = [] } = useQuery({
    queryKey: ['weightLogs'],
    queryFn: () => base44.entities.WeightLog.list('date', 100),
  });

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
  const startWeight = weightLogs.length > 0 ? weightLogs[0] : null;
  const goalWeight = user?.goal_weight;
  const totalLost = startWeight && latestWeight
    ? Math.round((startWeight.weight - latestWeight.weight) * 10) / 10
    : 0;

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-heading">Progress</h1>
        <Button
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-3.5 h-3.5" />
          Log Weight
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <WeightLogForm onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <Scale className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold font-heading">{latestWeight?.weight || '—'}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Current (kg)</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <TrendingDown className="w-4 h-4 mx-auto text-chart-1 mb-1" />
          <p className="text-lg font-bold font-heading">{totalLost > 0 ? `-${totalLost}` : totalLost || '—'}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Lost (kg)</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <Ruler className="w-4 h-4 mx-auto text-chart-2 mb-1" />
          <p className="text-lg font-bold font-heading">{goalWeight || '—'}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Goal (kg)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold mb-3">Weight Over Time</h3>
        <WeightChart data={weightLogs} goalWeight={goalWeight} />
      </div>

      {/* History */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Weigh-ins</h3>
        {weightLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No weigh-ins yet</p>
        ) : (
          <div className="space-y-2">
            {[...weightLogs].reverse().slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{format(new Date(log.date), 'dd MMM yyyy')}</span>
                <span className="text-sm font-semibold">{log.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}