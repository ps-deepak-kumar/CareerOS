import React from 'react';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  colorClass?: string; // Tailwind gradient text or class
  gradientId?: string;
  colors?: { from: string; to: string };
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 120,
  strokeWidth = 10,
  progress,
  gradientId = 'progressGradient',
  colors = { from: '#4f46e5', to: '#3b82f6' },
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        {/* Track circle */}
        <circle
          className="text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Absolute center layout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5 select-none">
        <span className="text-xs sm:text-sm font-bold font-display text-white leading-tight">{Math.round(progress)}%</span>
        {label && (
          <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-tight mt-0.5 max-w-[72px] break-words">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
export default ProgressRing;
