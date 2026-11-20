import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';

export default function DoomsdayCountdown({ movies = [], onReset }) {
  const toast = useToast();
  const [resetting, setResetting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 168, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const target = new Date('2027-05-07T00:00:00Z').getTime();

    const update = () => {
      const now = new Date().getTime();
      let difference = target - now;
      if (difference <= 0) {
        difference = 180 * 24 * 60 * 60 * 1000 - (now % (24 * 60 * 60 * 1000));
      }

      setTimeLeft({
        days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
        minutes: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 60)),
        seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const total = movies.length;
  const watched = movies.filter(m => m.watched).length;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await api.resetSeed();
      toast('Database reset to official challenge specification data', 'success');
      if (onReset) onReset();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-stone-200 shadow-sm">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#cba158]/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Doomsday Ready Mission Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#cba158]/15 border border-[#cba158]/35 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-[#967026]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#967026] font-bold px-2 py-0.5 rounded-full bg-[#cba158]/15 border border-[#cba158]/30">
                DOOMSDAY READY PREMIERE
              </span>
              <span className="text-xs text-stone-500 font-mono">AVENGERS: DOOMSDAY</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 mt-0.5">
              MCU Rewatch &amp; Watch-Party Command
            </h2>
          </div>
        </div>

        {/* Center: Live Ticking Countdown Timer */}
        <div className="flex items-center gap-2 sm:gap-3 bg-stone-50 px-4 sm:px-5 py-2.5 rounded-2xl border border-stone-200 font-mono">
          <Clock className="w-4 h-4 text-[#967026]" />
          <span className="text-xs text-stone-500 uppercase tracking-widest mr-1">Countdown:</span>
          <div className="flex items-baseline gap-1 text-stone-900 font-bold">
            <span className="text-base sm:text-xl text-[#967026] font-mono font-black">{timeLeft.days}</span>
            <span className="text-[10px] text-stone-500 mr-1.5 uppercase">days</span>
            <span className="text-base sm:text-xl text-[#967026] font-mono font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-500 mr-1.5 uppercase">hrs</span>
            <span className="text-base sm:text-xl text-[#967026] font-mono font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-500 mr-1.5 uppercase">mins</span>
            <span className="text-base sm:text-xl text-emerald-700 font-mono font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] text-stone-500 uppercase">secs</span>
          </div>
        </div>

        {/* Right: Readiness Indicator & Reset Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200">
            <ShieldCheck className={`w-4 h-4 ${percent === 100 ? 'text-emerald-600' : 'text-[#967026]'}`} />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 leading-none">Readiness</div>
              <div className="text-sm font-bold text-stone-900 leading-tight font-mono mt-0.5">{percent}% Prepared</div>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset database to the official 8 MCU movies and 4 test cinemas"
            className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-[#967026]' : ''}`} />
            <span className="hidden sm:inline font-mono uppercase text-[10px] tracking-wider">Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
