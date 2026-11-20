import { Check, X, Package, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function BookingResult({ result }) {
  if (!result) return null;

  if (result.possible) {
    const totalSeats = result.bundles?.reduce((sum, b) => sum + b.size * b.count, 0) || result.groupSize;

    return (
      <div className="animate-fade-in bg-emerald-50/60 border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-sm">
              <Check className="w-6 h-6 text-emerald-700 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                  EXACT SEATING GUARANTEE
                </span>
                <span className="text-xs text-stone-600 font-mono">Zero Wasted Seats</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                Optimal Seating Solution Found
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-stone-200 font-mono shadow-sm">
            <span className="text-xs text-stone-500 uppercase tracking-widest">Total Bundles:</span>
            <span className="text-2xl font-black text-emerald-700">{result.totalBundles}</span>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="relative z-10 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-600 mb-3 font-semibold">
            Allocated Ticket Bundles:
          </div>
          <div className="flex flex-wrap gap-3">
            {result.bundles.map((bundle, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-5 py-3.5 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#cba158]/15 border border-[#cba158]/35 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#967026]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-black text-stone-900">{bundle.count}</span>
                    <span className="text-xs text-stone-400">×</span>
                    <span className="text-sm font-bold text-[#967026]">{bundle.size}-seat</span>
                    <span className="text-xs text-stone-500 font-mono">bundle{bundle.count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500">
                    Subtotal: {bundle.size * bundle.count} seats
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-between text-xs text-stone-600 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Verified fewest bundles via bottom-up dynamic programming
          </span>
          <span>
            {totalSeats} seats booked for {result.groupSize} attendees
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-red-50/70 border border-red-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center flex-shrink-0">
          <X className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-red-700 font-bold px-2 py-0.5 rounded-full bg-red-100 border border-red-300">
              NOT POSSIBLE
            </span>
            <span className="text-xs text-stone-500 font-mono">No Exact Bundle Fit</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Cannot Seat Exactly {result.groupSize} Guests
          </h3>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            Opening-night seat bundles must be sold in unbroken quantities so that zero empty seats remain in the auditorium. No combination of the selected cinema venue's bundle sizes adds up to exactly <strong className="text-stone-900 font-mono font-bold">{result.groupSize}</strong> seats.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-stone-700 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-[#967026] flex-shrink-0" />
            <span>Booking Concierge: Try adjusting your party size up or down, or choose a venue offering different bundle sizes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
