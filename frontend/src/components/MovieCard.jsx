import { useState } from 'react';
import { Clock, Eye, EyeOff, Pencil, Trash2, Route, Check, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import { getMovieAsset, getFallbackPoster } from '../utils/movieAssets';

export default function MovieCard({ movie, onEdit, onDelete, onToggleWatched }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  const asset = getMovieAsset(movie.title);
  const currentPoster = imgSrc || asset.poster;

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      await api.updateMovie(movie.id, { watched: !movie.watched });
      onToggleWatched();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    if (!window.confirm(`Are you sure you want to remove "${movie.title}" from the rewatch programme?`)) return;
    setDeleting(true);
    try {
      await api.deleteMovie(movie.id);
      toast('Film removed from programme', 'success');
      if (onDelete) onDelete(movie.id);
      else onToggleWatched();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/rewatch?target=${movie.id}`)}
      className={`group rounded-2xl flex flex-col cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border ${
        movie.watched
          ? 'border-emerald-400/80 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.12)]'
          : 'border-stone-200 hover:border-[#cba158] shadow-sm hover:shadow-md'
      }`}
    >
      {/* Poster Image Area */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-stone-100">
        <img
          src={currentPoster}
          alt={movie.title}
          onError={() => {
            setImgSrc(getFallbackPoster(movie.title, movie.releaseYear));
          }}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20 pointer-events-none" />

        {/* Editorial Format Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 text-[#967026] border border-[#cba158]/40 shadow-sm">
            {asset.phase}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 text-stone-700 border border-stone-200 shadow-sm">
            {asset.format}
          </span>
        </div>

        {/* Quick Edit/Delete on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(movie);
            }}
            className="p-2 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 shadow-md transition-colors"
            title="Edit film"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-md transition-colors"
            title="Remove film"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editorial Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Metadata String */}
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-1.5">
            <span className="text-[#967026] font-bold">{movie.releaseYear}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {movie.runtime}m
            </span>
            <span>•</span>
            <span className="text-[10px] text-stone-600 px-1 py-0.2 rounded border border-stone-200 uppercase bg-stone-50">
              {asset.rating}
            </span>
          </div>

          {/* Film Title */}
          <h3 className="font-serif text-lg font-bold text-stone-900 tracking-tight leading-snug group-hover:text-[#967026] transition-colors line-clamp-2 min-h-[2.75rem] mb-1">
            {movie.title}
          </h3>

          {/* Tagline */}
          <p className="text-xs text-stone-500 italic line-clamp-1 mb-3">
            "{asset.tagline}"
          </p>

          {/* Prerequisites */}
          <div className="mb-4 pt-2 border-t border-stone-100">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1.5 flex items-center justify-between">
              <span>Required Canon:</span>
              <span className="text-stone-700 font-mono font-semibold">
                {movie.prerequisites?.length || 0}
              </span>
            </div>
            {movie.prerequisites && movie.prerequisites.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {movie.prerequisites.slice(0, 2).map((p) => (
                  <span
                    key={p.id}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-medium truncate max-w-[130px]"
                    title={p.title}
                  >
                    {p.title}
                  </span>
                ))}
                {movie.prerequisites.length > 2 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[#967026] font-mono font-bold">
                    +{movie.prerequisites.length - 2}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-stone-400 italic">Standalone entry</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-full px-4 py-2.5 transition-all duration-200 uppercase tracking-wider ${
              movie.watched
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 shadow-sm'
                : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {movie.watched ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Watched
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                Mark Watched
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/rewatch?target=${movie.id}`);
            }}
            className="p-2.5 rounded-full bg-stone-50 border border-stone-200 hover:border-[#cba158] hover:text-[#967026] text-stone-500 transition-colors"
            title="Generate MCU rewatch roadmap"
          >
            <Route className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
