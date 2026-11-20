import { useState, useMemo } from 'react';
import { Plus, Film, Loader2, Search, SlidersHorizontal, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { useToast } from '../hooks/useToast';
import { api } from '../api/client';
import MovieCard from '../components/MovieCard';
import MovieForm from '../components/MovieForm';
import EmptyState from '../components/EmptyState';
import DoomsdayCountdown from '../components/DoomsdayCountdown';

export default function Movies() {
  const { movies, loading, refetch } = useMovies();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all'); // all, watched, unwatched, hasPrereqs
  const [sortBy, setSortBy] = useState('year'); // year, title, runtime

  const handleAdd = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingMovie) {
        await api.updateMovie(editingMovie.id, data);
        toast('Movie updated successfully', 'success');
      } else {
        await api.createMovie(data);
        toast('Movie added to rewatch programme', 'success');
      }
      handleClose();
      refetch();
    } catch (err) {
      if (err.code === 'CIRCULAR_DEPENDENCY') {
        toast('Circular dependency detected! A movie cannot depend on itself, either directly or through other movies.', 'error');
      } else {
        toast(err.message, 'error');
      }
    }
  };

  // Filter & Search Logic
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        String(m.releaseYear).includes(q)
      );
    }

    if (filterState === 'watched') {
      result = result.filter(m => m.watched);
    } else if (filterState === 'unwatched') {
      result = result.filter(m => !m.watched);
    } else if (filterState === 'hasPrereqs') {
      result = result.filter(m => m.prerequisites && m.prerequisites.length > 0);
    }

    result.sort((a, b) => {
      if (sortBy === 'year') return a.releaseYear - b.releaseYear;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'runtime') return b.runtime - a.runtime;
      return 0;
    });

    return result;
  }, [movies, searchQuery, filterState, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = movies.length;
    const watched = movies.filter(m => m.watched).length;
    const totalMins = movies.reduce((sum, m) => sum + m.runtime, 0);
    const unwatchedMins = movies.filter(m => !m.watched).reduce((sum, m) => sum + m.runtime, 0);

    return {
      total,
      watched,
      unwatched: total - watched,
      totalHours: (totalMins / 60).toFixed(1),
      unwatchedHours: Math.floor(unwatchedMins / 60),
      unwatchedMins: unwatchedMins % 60,
    };
  }, [movies]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#967026] animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          Loading MCU Programme...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10">
      {/* Doomsday Ready Countdown Banner */}
      <DoomsdayCountdown movies={movies} onReset={refetch} />

      {/* Editorial Showcase Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#967026] font-bold px-2 py-0.5 rounded bg-[#cba158]/15 border border-[#cba158]/35">
              DOOMSDAY READY • MARVEL RETROSPECTIVE
            </span>
            <span className="text-xs text-stone-500 font-mono">CANONICAL SAGA</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            What’s On / The Collection
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl mt-2 leading-relaxed">
            Curated viewing order and prerequisite dependencies leading into the premiere of <em className="text-stone-900 font-serif font-bold">Avengers: Doomsday</em>.
          </p>
        </div>

        {/* Add Movie CTA Button */}
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold rounded-full px-5 py-2.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-sm self-start md:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Film to Programme
        </button>
      </div>

      {/* Editorial Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-mono text-[#967026] uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
            <Film className="w-3.5 h-3.5" />
            Season Films
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-900">{stats.total} Titles</div>
          <div className="text-[11px] text-stone-500 mt-1">{stats.totalHours} hours total lore</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Watched by You
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-700">{stats.watched} Films</div>
          <div className="text-[11px] text-stone-500 mt-1">{Math.round((stats.watched / (stats.total || 1)) * 100)}% Completed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-mono text-[#b91c1c] uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Unwatched Remaining
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-900">{stats.unwatched} Films</div>
          <div className="text-[11px] text-stone-500 mt-1">{stats.unwatchedHours}h {stats.unwatchedMins}m to stream</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Cycle Guard
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-800">0 Cycles</div>
          <div className="text-[10px] text-stone-500">Strict DAG Topology</div>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, year, or character..."
              className="w-full bg-white border border-stone-200 rounded-full pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#cba158] focus:ring-1 focus:ring-[#cba158]/40 transition-all font-sans shadow-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Films' },
              { id: 'unwatched', label: 'Unwatched' },
              { id: 'watched', label: 'Watched' },
              { id: 'hasPrereqs', label: 'Requires Prereqs' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterState(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  filterState === f.id
                    ? 'bg-stone-900 text-white shadow-sm font-bold'
                    : 'bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 rounded-full px-4 py-2 self-end md:self-auto shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Order By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer uppercase text-xs tracking-wider"
          >
            <option value="year">Release Year</option>
            <option value="title">Title (A–Z)</option>
            <option value="runtime">Runtime</option>
          </select>
        </div>
      </div>

      {/* Films Grid */}
      {filteredMovies.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No Films Found"
          description={
            searchQuery || filterState !== 'all'
              ? "No titles match your current search or filter criteria in the rewatch programme."
              : "Start curating your MCU retrospective by adding your first title."
          }
          action={
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold rounded-full px-5 py-2.5 text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add First Film
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEdit}
              onToggleWatched={refetch}
              onDelete={refetch}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <MovieForm
          movie={editingMovie}
          allMovies={movies}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
