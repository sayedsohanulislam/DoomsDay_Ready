import { Users, Armchair, Sparkles, Monitor } from 'lucide-react';

export default function SeatMap({ cinemaName, groupSize, bundles }) {
  if (!bundles || bundles.length === 0) return null;

  // Light luxury seating palette
  const bundlePalette = [
    { bg: 'bg-[#cba158]/15', border: 'border-[#cba158]/40', text: 'text-[#967026]', fill: '#cba158', name: 'Gold' },
    { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', fill: '#059669', name: 'Emerald' },
    { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', fill: '#0891b2', name: 'Cyan' },
    { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', fill: '#dc2626', name: 'Crimson' },
    { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', fill: '#7c3aed', name: 'Velvet' },
  ];

  const totalSeats = bundles.reduce((sum, b) => sum + b.size * b.count, 0);

  return (
    <div className="mt-8 p-6 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-sm relative overflow-hidden cyber-grid">
      {/* Background Ambient Warm Flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#cba158]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#967026] font-bold px-2 py-0.5 rounded-full bg-[#cba158]/15 border border-[#cba158]/35">
              AUDITORIUM SEATING MAP
            </span>
            <span className="text-xs text-stone-500 font-mono">Reserved Seating</span>
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#967026]" />
            {cinemaName} • Watch-Party Seating Chart
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Allocated {totalSeats} seats for {groupSize} attendees in contiguous boutique clusters with zero wasted seats.
          </p>
        </div>
        <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold self-start sm:self-auto shadow-sm">
          100% Efficiency
        </span>
      </div>

      {/* Cinematic Screen Curved Indicator */}
      <div className="w-full flex flex-col items-center mb-10 relative z-10">
        <div className="w-full max-w-xl h-3 rounded-t-full bg-gradient-to-r from-transparent via-[#cba158] to-transparent shadow-sm opacity-90" />
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-stone-500 mt-2 font-bold">
          <Monitor className="w-3.5 h-3.5 text-[#967026]" />
          A U D I T O R I U M   P R E M I E R E   S C R E E N
        </div>
      </div>

      {/* Bundle Seating Blocks */}
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto relative z-10">
        {bundles.map((bundle, bIdx) => {
          const color = bundlePalette[bIdx % bundlePalette.length];
          return Array.from({ length: bundle.count }).map((_, cIdx) => (
            <div
              key={`${bIdx}-${cIdx}`}
              className={`p-4 sm:p-5 rounded-2xl border ${color.bg} ${color.border} flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 shadow-sm`}
            >
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-800">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span>Cluster #{bIdx + 1}.{cIdx + 1}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 border border-stone-200 ${color.text}`}>
                  {bundle.size} Seats
                </span>
              </div>

              {/* Armchair Grid */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-[190px]">
                {Array.from({ length: bundle.size }).map((_, seatIdx) => (
                  <div
                    key={seatIdx}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center bg-white border ${color.border} shadow-sm transition-transform hover:scale-110`}
                    title={`Seat ${seatIdx + 1} of ${bundle.size}-seat bundle`}
                  >
                    <Armchair className={`w-3.5 h-3.5 ${color.text}`} />
                  </div>
                ))}
              </div>
            </div>
          ));
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 relative z-10 font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Venue policy: All opening-night ticket bundles are seated contiguously in your auditorium row.
        </span>
        <span className="text-stone-900 font-semibold">
          0 Wasted Seats • Maximum Value
        </span>
      </div>
    </div>
  );
}
