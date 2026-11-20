import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Clock, ListChecks, Loader2, PartyPopper, GitFork, CheckCheck, Share2, Ticket, Check, Film, Sparkles, Star, Clapperboard, Compass } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import ProgressBar from '../components/ProgressBar';
import RewatchList from '../components/RewatchList';
import PrerequisiteGraph from '../components/PrerequisiteGraph';
import EmptyState from '../components/EmptyState';
import { getMovieAsset } from '../utils/movieAssets';

export default function RewatchPlan() {
  const { movies, loading: moviesLoading, refetch: refetchMovies } = useMovies();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read target ID from query params or default to Avengers: Doomsday if available
  const paramTarget = searchParams.get('target');
  const [selectedId, setSelectedId] = useState(paramTarget || '');
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'graph'
  const [batching, setBatching] = useState(false);

  // Sync state when URL param changes
  useEffect(() => {
    if (paramTarget && paramTarget !== selectedId) {
      setSelectedId(paramTarget);
    }
  }, [paramTarget]);

  // If no target selected yet, automatically select Doomsday if found
  useEffect(() => {
    if (!selectedId && movies.length > 0) {
      const doomsday = movies.find(m => m.title.toLowerCase().includes('doomsday'));
      if (doomsday) {
        setSelectedId(String(doomsday.id));
        setSearchParams({ target: String(doomsday.id) });
      } else {
        setSelectedId(String(movies[movies.length - 1].id));
      }
    }
  }, [movies, selectedId, setSearchParams]);

  // Fetch rewatch order when selectedId changes
  useEffect(() => {
    if (!selectedId) {
      setPlan(null);
      return;
    }

    let cancelled = false;
    const fetchPlan = async () => {
      setPlanLoading(true);
      try {
        const data = await api.getRewatchOrder(selectedId);
        if (!cancelled) setPlan(data);
      } catch (err) {
        if (!cancelled) toast(err.message, 'error');
      } finally {
        if (!cancelled) setPlanLoading(false);
      }
    };

    fetchPlan();
    return () => { cancelled = true; };
  }, [selectedId, toast]);

  const handleSelectMovie = (id) => {
    setSelectedId(String(id));
    setSearchParams({ target: String(id) });
  };

  const formatRuntime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Mark all prerequisites as watched in one action
  const handleMarkAllWatched = async () => {
    if (!plan || plan.rewatchOrder.length === 0 || batching) return;
    setBatching(true);
    try {
      const unwatched = plan.rewatchOrder.filter(m => !m.watched);
      await Promise.all(unwatched.map(m => api.updateMovie(m.id, { watched: true })));
      toast(`Marked ${unwatched.length} prerequisite films as watched!`, 'success');
      refetchMovies();
      const updatedPlan = await api.getRewatchOrder(selectedId);
      setPlan(updatedPlan);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBatching(false);
    }
  };

  // Copy schedule summary to clipboard
  const handleCopySchedule = () => {
    if (!plan || !targetMovie) return;
    const lines = [
      `DOOMSDAY READY • MCU Rewatch Roadmap for ${targetMovie.title}`,
      `Prerequisite Programme: ${plan.totalMovies} titles • Remaining: ${formatRuntime(plan.unwatchedRuntime)}`,
      '',
      ...plan.rewatchOrder.map((m, i) => `${i + 1}. [${m.watched ? 'x' : ' '}] ${m.title} (${m.releaseYear}) - ${m.runtime}m`),
      '',
      `Curated by Doomsday Ready`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast('Roadmap copied to clipboard!', 'success');
  };

  const targetMovie = movies.find(m => String(m.id) === String(selectedId));
  const targetAsset = targetMovie ? getMovieAsset(targetMovie.title) : null;

  if (moviesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#967026] animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          Calculating Canonical Prerequisite Topology...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-10">
      {/* Doomsday Ready Spotlight Hero Banner */}
      {targetMovie && targetAsset && (
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-white">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={targetAsset.backdrop}
              alt={targetMovie.title}
              className="w-full h-full object-cover object-center opacity-15 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 max-w-2xl">
              {/* Poster Thumbnail */}
              <div className="w-28 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white shadow-xl flex-shrink-0 hidden sm:block bg-stone-100">
                <img
                  src={targetAsset.poster}
                  alt={targetMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#cba158]/15 text-[#967026] border border-[#cba158]/35">
                    {targetAsset.phase}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                    {targetAsset.format}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {targetMovie.releaseYear} • {targetMovie.runtime} MINS • {targetAsset.rating}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                  {targetMovie.title}
                </h1>

                <p className="text-sm text-[#967026] font-serif italic mt-1.5 font-medium">
                  "{targetAsset.tagline}"
                </p>

                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                  MCU Prerequisite Programme: Every prior canonical title you should experience in exact chronological dependency order before opening night.
                </p>
              </div>
            </div>

            {/* Target Selector Dropdown */}
            <div className="w-full md:w-auto flex-shrink-0 bg-stone-50/90 backdrop-blur-md p-5 rounded-2xl border border-stone-200 shadow-sm">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#967026] mb-2 font-bold">
                Select Destination Film
              </label>
              <div className="relative min-w-[240px]">
                <select
                  value={selectedId}
                  onChange={(e) => handleSelectMovie(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl text-stone-900 px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#cba158] focus:ring-1 focus:ring-[#cba158]/40 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id} className="bg-white text-stone-900">
                      {m.title} ({m.releaseYear})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border border-stone-200 self-start sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'timeline'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            Programme Roadmap
          </button>
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'graph'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Interactive DAG
          </button>
        </div>

        {/* Action Buttons */}
        {plan && plan.rewatchOrder.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {plan.watchedCount < plan.totalMovies && (
              <button
                type="button"
                onClick={handleMarkAllWatched}
                disabled={batching}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Watched
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-400 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Copy Roadmap
            </button>

            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 transition-all shadow-sm"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
              Book Watch-Party
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {planLoading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#967026] animate-spin mb-3" />
          <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
            Compiling Kahn's Topological Order...
          </p>
        </div>
      )}

      {/* Plan Results */}
      {plan && !planLoading && (
        <div className="animate-fade-in space-y-8">
          {plan.rewatchOrder.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Zero Prerequisites Required</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                <strong className="text-emerald-700 font-semibold">{targetMovie?.title}</strong> is a standalone screening entry. You can watch it immediately with no prerequisite backlog!
              </p>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Progress Bar */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 sm:col-span-2 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">
                      Rewatch Programme Readiness
                    </span>
                    <span className="text-xs font-mono font-bold text-[#967026]">
                      {Math.round((plan.watchedCount / plan.totalMovies) * 100)}% Complete
                    </span>
                  </div>
                  <ProgressBar
                    current={plan.watchedCount}
                    total={plan.totalMovies}
                    label={`${plan.watchedCount} of ${plan.totalMovies} films watched`}
                  />
                </div>

                {/* Remaining Screen Time */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-[#cba158]/15 border border-[#cba158]/35 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="w-6 h-6 text-[#967026]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-semibold">Remaining Screen Time</p>
                    <p className="text-xl font-extrabold text-stone-900 font-mono tracking-tight">
                      {formatRuntime(plan.unwatchedRuntime)}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {plan.totalMovies - plan.watchedCount} films left to stream
                    </p>
                  </div>
                </div>
              </div>

              {/* View Rendering: Timeline vs DAG Graph */}
              {viewMode === 'timeline' ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-[#967026]" />
                      <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                        Chronological Viewing Programme ({plan.totalMovies} Titles)
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-stone-500">
                      Topologically Ordered
                    </span>
                  </div>
                  <RewatchList items={plan.rewatchOrder} />
                </div>
              ) : (
                <PrerequisiteGraph
                  movies={movies}
                  targetMovieId={selectedId}
                  onSelectTarget={handleSelectMovie}
                  onToggleWatched={async (movie) => {
                    await api.updateMovie(movie.id, { watched: !movie.watched });
                    refetchMovies();
                    const updated = await api.getRewatchOrder(selectedId);
                    setPlan(updated);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
