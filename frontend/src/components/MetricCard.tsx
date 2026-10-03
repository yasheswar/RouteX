import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  badgeColor?: 'green' | 'blue' | 'amber' | 'rose' | 'slate';
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  badgeText,
  badgeColor = 'green',
  icon,
  subtitle,
}) => {
  const badgeColors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-700/40 text-slate-400 border-slate-700/50',
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
        <span>{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {badgeText && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badgeColor]}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};
