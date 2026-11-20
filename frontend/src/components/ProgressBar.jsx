export default function ProgressBar({ current, total, label }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700">{label}</span>
          <span className="text-sm font-bold text-[#967026] font-mono">{percent}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden border border-stone-300 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#cba158] to-[#967026] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
