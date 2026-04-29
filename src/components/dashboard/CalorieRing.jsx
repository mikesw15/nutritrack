import React from 'react';
import { motion } from 'framer-motion';

export default function CalorieRing({ consumed, goal, burned = 0, size = 'md' }) {
  const total = goal + burned;
  const remaining = Math.max(0, total - consumed);
  const percentage = Math.min((consumed / total) * 100, 100);

  const isSmall = size === 'sm';
  const dim = isSmall ? 80 : 200;
  const r = isSmall ? 30 : 80;
  const sw = isSmall ? 7 : 12;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage > 100) return 'hsl(0, 72%, 55%)';
    if (percentage > 85) return 'hsl(36, 95%, 55%)';
    return 'hsl(152, 60%, 42%)';
  };

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} strokeLinecap="round" />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} fill="none"
          stroke={getColor()} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={isSmall ? "text-lg font-bold font-heading text-foreground" : "text-4xl font-bold font-heading text-foreground"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {remaining}
        </motion.span>
        {!isSmall && <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">remaining</span>}
      </div>
    </div>
  );
}