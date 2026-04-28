import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDateString } from '@/lib/dateUtils';
import { toast } from 'sonner';

export default function WeightLogForm({ onClose }) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(getDateString());
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.WeightLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
      toast.success('Weight logged');
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!weight) return;
    mutation.mutate({
      date,
      weight: parseFloat(weight),
      body_fat: bodyFat ? parseFloat(bodyFat) : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Log Weight</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="rounded-xl"
        />
        <Input
          type="number"
          step="0.1"
          placeholder="Body fat % (optional)"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
          className="rounded-xl"
        />
      </div>
      <Button className="w-full rounded-xl" onClick={handleSubmit} disabled={mutation.isPending || !weight}>
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save
      </Button>
    </motion.div>
  );
}