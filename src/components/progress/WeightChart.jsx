import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function WeightChart({ data, goalWeight }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Log your weight to see the chart</p>;
  }

  const chartData = data.map(d => ({
    date: format(new Date(d.date), 'dd/MM'),
    weight: d.weight,
  }));

  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights, goalWeight || Infinity) - 2;
  const maxW = Math.max(...weights) + 2;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis domain={[minW, maxW]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
        />
        {goalWeight && (
          <ReferenceLine
            y={goalWeight}
            stroke="hsl(var(--chart-2))"
            strokeDasharray="5 5"
            label={{ value: 'Goal', position: 'right', fontSize: 10 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}