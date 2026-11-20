import { useState, useEffect } from 'react';
import { Plus, Ticket, Users, Minus, Loader2, Sparkles, X, Check, Building2, Calculator, Info, ShieldCheck } from 'lucide-react';
import { useCinemas } from '../hooks/useCinemas';
import { useToast } from '../hooks/useToast';
import { api } from '../api/client';
import BookingResult from '../components/BookingResult';
import SeatMap from '../components/SeatMap';
import TicketStub from '../components/TicketStub';
import EmptyState from '../components/EmptyState';

export default function Booking() {
  const { cinemas, loading, refetch } = useCinemas();
  const toast = useToast();
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [groupSize, setGroupSize] = useState(6);
  const [result, setResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showCinemaForm, setShowCinemaForm] = useState(false);
  const [cinemaName, setCinemaName] = useState('');
  const [bundleSizesInput, setBundleSizesInput] = useState('');
  const [cinemaSubmitting, setCinemaSubmitting] = useState(false);

  // Auto-select first cinema if available
  useEffect(() => {
    if (!selectedCinema && cinemas.length > 0) {
      setSelectedCinema(cinemas[0]);
    }
  }, [cinemas, selectedCinema]);

  // Recalculate quote whenever cinema or group size changes
  useEffect(() => {
    if (!selectedCinema || groupSize < 1 || groupSize > 10000) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const fetchBooking = async () => {
      setBookingLoading(true);
      try {
        const data = await api.getBooking(selectedCinema.id, groupSize);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) toast(err.message, 'error');
      } finally {
        if (!cancelled) setBookingLoading(false);
      }
    };

    const timeout = setTimeout(fetchBooking, 150);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [selectedCinema, groupSize, toast]);

  const handleSelectCinema = (cinema) => {
    setSelectedCinema(cinema);
  };

  const handleAddCinema = async (e) => {
    e.preventDefault();
    if (cinemaSubmitting) return;
    setCinemaSubmitting(true);
    try {
      const sizes = bundleSizesInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);

      if (sizes.length === 0) {
        toast('Enter at least one valid bundle size (1–500)', 'error');
        return;
      }

      const created = await api.createCinema({ name: cinemaName.trim(), bundleSizes: sizes });
      toast('Cinema venue added successfully', 'success');
      setShowCinemaForm(false);
      setCinemaName('');
      setBundleSizesInput('');
      await refetch();
      setSelectedCinema(created);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCinemaSubmitting(false);
    }
  };

  const presetSizes = [
    { label: 'Solo', val: 1 },
    { label: 'Duo', val: 2 },
    { label: 'Squad', val: 6 },
    { label: 'Party', val: 11 },
    { label: 'Mega Crew', val: 44 },
    { label: 'Battalion', val: 100 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#967026] animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          Querying Cinema Venue Seat Matrices...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#967026] font-bold px-2 py-0.5 rounded bg-[#cba158]/15 border border-[#cba158]/35">
              DOOMSDAY READY • SEAT BUNDLE OPTIMIZATION
            </span>
            <span className="text-xs text-stone-500 font-mono">DYNAMIC PROGRAMMING</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Watch-Party Reservation
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl mt-2 leading-relaxed">
            Reserve opening-night group bundles at premier auditoriums. Calculates the fewest seat bundles with exactly zero empty seats.
          </p>
        </div>

        <button
          onClick={() => setShowCinemaForm(true)}
          className="inline-flex items-center gap-2 bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold rounded-full px-5 py-2.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-sm self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Cinema Venue
        </button>
      </div>

      {cinemas.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Cinema Venues Registered"
          description="Register your first cinema venue to begin calculating watch-party group seating."
          action={
            <button
              onClick={() => setShowCinemaForm(true)}
              className="inline-flex items-center gap-2 bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold rounded-full px-5 py-2.5 text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Cinema Venue
            </button>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Step 1: Select Cinema Venue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#967026] flex items-center gap-2 font-bold">
                <Building2 className="w-4 h-4" />
                Step 1: Choose Cinema Venue
              </h3>
              <span className="text-xs text-stone-500 font-mono">
                {cinemas.length} venue{cinemas.length !== 1 ? 's' : ''} available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cinemas.map((cinema) => {
                const isSelected = selectedCinema?.id === cinema.id;
                return (
                  <div
                    key={cinema.id}
                    onClick={() => handleSelectCinema(cinema)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#cba158] shadow-md ring-2 ring-[#cba158]/20'
                        : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className={`font-serif text-base font-bold truncate ${isSelected ? 'text-[#967026]' : 'text-stone-900'}`}>
                          {cinema.name}
                        </h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#cba158] animate-pulse flex-shrink-0" />
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider mb-2">
                        Allowed bundle sizes:
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cinema.bundleSizes.map((size) => (
                          <span
                            key={size}
                            className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                              isSelected
                                ? 'bg-[#cba158]/15 text-[#967026] border-[#cba158]/40'
                                : 'bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            {size} seats
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-[10px] font-mono text-stone-500 flex items-center justify-between">
                      <span>Cinema Screen</span>
                      <span className={isSelected ? 'text-[#967026] font-bold' : ''}>
                        {isSelected ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Configure Group Size */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#967026] flex items-center gap-2 mb-4 font-bold">
              <Users className="w-4 h-4" />
              Step 2: Enter Party Headcount (1 – 10,000 Seats)
            </h3>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-mono text-stone-500 mr-1">Party Presets:</span>
              {presetSizes.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setGroupSize(preset.val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${
                    groupSize === preset.val
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {preset.label} ({preset.val})
                </button>
              ))}
            </div>

            {/* Range Slider + Stepper Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={Math.min(groupSize, 100)}
                  onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#cba158]"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-1.5">
                  <span>1 seat</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100+ seats</span>
                </div>
              </div>

              {/* Exact Counter Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                  className="w-11 h-11 rounded-full bg-stone-50 border border-stone-300 hover:border-stone-500 text-stone-800 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={groupSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setGroupSize(Math.min(10000, Math.max(1, val)));
                    }}
                    className="w-28 text-center font-mono font-black text-xl text-stone-900 bg-white border border-stone-300 rounded-2xl py-2.5 focus:border-[#cba158] focus:outline-none shadow-sm"
                  />
                  <span className="absolute -top-2 left-2 text-[9px] font-mono uppercase bg-stone-100 px-1 text-stone-500 rounded border border-stone-200">
                    Guests
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGroupSize(Math.min(10000, groupSize + 1))}
                  className="w-11 h-11 rounded-full bg-stone-50 border border-stone-300 hover:border-stone-500 text-stone-800 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Allocation Quote & Ticket */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#967026] flex items-center gap-2 font-bold">
                <Calculator className="w-4 h-4" />
                Step 3: Optimal Bundle Quote Breakdown
              </h3>
              {bookingLoading && (
                <div className="flex items-center gap-1.5 text-xs text-[#967026] font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running dynamic programming solver...
                </div>
              )}
            </div>

            {/* Results Component */}
            <BookingResult result={result} />

            {/* Official Admission Pass Stub (When possible) */}
            {result && result.possible && (
              <TicketStub
                cinema={selectedCinema}
                groupSize={result.groupSize}
                result={result}
              />
            )}

            {/* Auditorium Seating Chart (When possible) */}
            {result && result.possible && (
              <SeatMap
                cinemaName={selectedCinema?.name}
                groupSize={result.groupSize}
                bundles={result.bundles}
              />
            )}
          </div>
        </div>
      )}

      {/* Add Cinema Modal */}
      {showCinemaForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#967026]" />
                <h3 className="font-serif text-xl font-bold text-stone-900">Add Cinema Venue</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCinemaForm(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCinema} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                  Cinema Venue Name
                </label>
                <input
                  type="text"
                  required
                  value={cinemaName}
                  onChange={(e) => setCinemaName(e.target.value)}
                  placeholder="e.g. Stark Tower IMAX (Screen 1)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#cba158] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                  Seat Bundle Sizes (Comma-Separated, 1–10 items)
                </label>
                <input
                  type="text"
                  required
                  value={bundleSizesInput}
                  onChange={(e) => setBundleSizesInput(e.target.value)}
                  placeholder="e.g. 2, 5 or 6, 9, 20"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#cba158] font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Each bundle holds 1 to 500 seats. Only unbroken bundles are sold.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCinemaForm(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cinemaSubmitting}
                  className="px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 shadow-sm transition-all"
                >
                  {cinemaSubmitting ? 'Registering...' : 'Register Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
