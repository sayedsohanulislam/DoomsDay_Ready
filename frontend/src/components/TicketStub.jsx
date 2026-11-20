import { Ticket, Sparkles, QrCode, CheckCircle2, ShieldCheck, Film } from 'lucide-react';

export default function TicketStub({ cinema, groupSize, result }) {
  if (!result || !result.possible || !cinema) return null;

  return (
    <div className="mt-6 rounded-3xl overflow-hidden border border-stone-300 bg-white shadow-md relative">
      {/* Top Gold Accent Header */}
      <div className="h-2.5 bg-gradient-to-r from-[#cba158] via-[#e6cb89] to-[#cba158]" />

      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-stretch justify-between gap-6 relative">
        {/* Left Section: Admission Pass Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#cba158]" />
              <span className="font-serif font-black tracking-widest text-xs uppercase text-[#967026]">
                DOOMSDAY READY • PREMIERE ADMISSION
              </span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-bold uppercase tracking-wider">
              OPENING NIGHT 2027
            </span>
          </div>

          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
              Avengers: Doomsday • Watch Party
            </h3>
            <p className="text-xs text-[#967026] font-mono mt-1 font-semibold">
              Venue: <strong className="text-stone-900">{cinema.name}</strong> • Royal Auditorium (70mm Laser)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-stone-200 font-mono text-xs">
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-widest">Party Headcount</div>
              <div className="text-base font-bold text-stone-900 mt-0.5">{groupSize} Guests</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-widest">Bundles Bought</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">{result.totalBundles} Total</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-widest">Empty Seats</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">0 (Exact Fit)</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-widest">Seating Tier</div>
              <div className="text-base font-bold text-[#967026] mt-0.5">Royal Lounge</div>
            </div>
          </div>

          {/* Purchased Bundle Breakdown Pills */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
              Bundle Allocation:
            </div>
            <div className="flex flex-wrap gap-2">
              {result.bundles.map((b, i) => (
                <div
                  key={i}
                  className="px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs font-mono shadow-sm"
                >
                  <span className="text-[#967026] font-bold">{b.count}×</span>
                  <span className="text-stone-800">{b.size}-seat bundles</span>
                  <span className="text-stone-500 text-[10px]">({b.count * b.size} seats)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Perforated Receipt Stub */}
        <div className="md:w-56 md:border-l md:border-dashed md:border-stone-300 md:pl-6 flex flex-col items-center justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-dashed border-stone-300">
          <div className="text-center w-full">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#967026] font-bold mb-1">
              DOOMSDAY PASS
            </div>
            <div className="font-serif text-2xl font-black text-stone-900">
              {groupSize} SEATS
            </div>
            <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">
              ADMIT WATCH-PARTY
            </div>
          </div>

          {/* Barcode Simulation in Crisp Black */}
          <div className="w-full flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="h-10 w-full flex items-center justify-center gap-1 overflow-hidden opacity-90">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="h-full bg-stone-900"
                  style={{
                    width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px',
                    opacity: i % 4 === 0 ? 0.35 : 0.95
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-stone-500 uppercase font-semibold">
              DOOMSDAY-READY-2027
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed zero wasted seats</span>
          </div>
        </div>
      </div>
    </div>
  );
}
