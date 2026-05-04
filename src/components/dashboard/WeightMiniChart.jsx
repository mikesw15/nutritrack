import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

export default function WeightMiniChart({ logs = [] }) {
  const data = [...logs]
    .filter(log => log?.date && !Number.isNaN(new Date(log.date).getTime()) && Number.isFinite(Number(log.weight)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-8)
    .map(log => ({ date: format(new Date(log.date), 'd MMM'), weight: Number(log.weight) }));

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Weight tracking</p>
        <h3 className="text-lg font-bold font-heading">Recent trend</h3>
      </div>
      <div className="h-44">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Log weight to see your trend</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}