interface ScoreRingProps {
  score: number;
  max?: number;
  label: string;
  size?: "sm" | "md" | "lg";
  invert?: boolean;
}

export function ScoreRing({
  score,
  max = 100,
  label,
  size = "md",
  invert = false,
}: ScoreRingProps) {
  const percentage = (score / max) * 100;
  const radius = size === "sm" ? 36 : size === "md" ? 48 : 60;
  const stroke = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (invert) {
      if (percentage <= 30) return "#10b981";
      if (percentage <= 60) return "#f59e0b";
      return "#ef4444";
    }
    if (percentage >= 70) return "#10b981";
    if (percentage >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const svgSize = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold text-slate-900 ${size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl"}`}
          >
            {score}
            {max === 100 ? "" : `/${max}`}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
