import { Ticket } from 'lucide-react';

export default function CinemaCard({ cinema, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(cinema)}
      className={`w-full text-left bg-dark-700 border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${
        selected
          ? 'border-marvel-red/50 bg-marvel-red/5 ring-1 ring-marvel-red/20'
          : 'border-dark-500 hover:border-dark-400'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected ? 'bg-marvel-red/15' : 'bg-dark-600'}`}>
          <Ticket className={`w-4 h-4 ${selected ? 'text-marvel-red' : 'text-slate-400'}`} />
        </div>
        <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{cinema.name}</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cinema.bundleSizes.map((size) => (
          <span
            key={size}
            className="text-xs px-2 py-0.5 rounded-md bg-dark-600 border border-dark-500 text-slate-400"
          >
            {size}-seat
          </span>
        ))}
      </div>
    </button>
  );
}
