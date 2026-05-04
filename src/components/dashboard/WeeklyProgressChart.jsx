import React from 'react';
import { format, subDays } from 'date-fns';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const dateKey = (date) => format(date, 'yyyy-MM-dd');

export default function WeeklyProgressChart({ entries = [] }) {
  const safeEntries = entries.filter(entry => entry?.date);
  const data = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index);
    const key = dateKey(date);
    const calories = safeEntries.filter(entry => entry.date === key).reduce((sum, entry) => sum + (Number(entry.calories) || 0), 0);
    return { day: format(date, 'EEE'), calories };
  });

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Weekly progress</p>
        <h3 className="text-lg font-bold font-heading">Calories logged</h3>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -22, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}