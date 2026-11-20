import { Check, Clock, Eye, EyeOff, Sparkles, Film } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';
import { getMovieAsset, getFallbackPoster } from '../utils/movieAssets';

export default function RewatchList({ items, onItemUpdated }) {
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const toggleItem = async (movie) => {
    if (updatingId) return;
    setUpdatingId(movie.id);
    try {
      await api.updateMovie(movie.id, { watched: !movie.watched });
      movie.watched = !movie.watched;
      if (onItemUpdated) onItemUpdated();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="relative pl-1 sm:pl-3 space-y-4">
      {items.map((movie, index) => {
        const isWatched = movie.watched;
        const isLast = index === items.length - 1;
        const asset = getMovieAsset(movie.title);

        return (
          <div
            key={movie.id}
            className="relative flex gap-4 animate-fade-in group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Timeline connector track */}
            {!isLast && (
              <div
                className={`absolute left-[19px] sm:left-[23px] top-12 bottom-0 w-0.5 transition-colors z-0 ${
                  isWatched ? 'bg-emerald-300' : 'bg-stone-200'
                }`}
              />
            )}

            {/* Step Badge */}
            <div className="relative z-10 flex-shrink-0 mt-2">
              {isWatched ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#cba158] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                  <span className="text-sm sm:text-base font-serif font-black text-[#967026]">{index + 1}</span>
                </div>
              )}
            </div>

            {/* Programme Card */}
            <div
              className={`flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-300 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isWatched
                  ? 'bg-stone-50 border-emerald-200 opacity-90'
                  : 'bg-white border-stone-200 hover:border-[#cba158] hover:shadow-md shadow-sm'
              }`}
            >
              {/* Left Details with Poster Thumbnail */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Poster Thumbnail */}
                <div className="w-12 sm:w-14 aspect-[2/3] rounded-xl overflow-hidden border border-stone-200 shadow-sm flex-shrink-0 bg-stone-100">
                  <img
                    src={asset.poster}
                    alt={movie.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackPoster(movie.title, movie.releaseYear);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#967026] font-bold bg-[#cba158]/15 px-2 py-0.5 rounded-full border border-[#cba158]/35">
                      Rewatch Step #{index + 1}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{movie.releaseYear}</span>
                    <span className="text-[10px] font-mono text-stone-500 hidden sm:inline">
                      • {asset.format}
                    </span>
                  </div>

                  <h4
                    className={`font-serif text-base sm:text-lg font-bold tracking-tight truncate transition-all ${
                      isWatched ? 'text-stone-400 line-through decoration-stone-400' : 'text-stone-900'
                    }`}
                  >
                    {movie.title}
                  </h4>

                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {movie.runtime} min ({Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m)
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-500 italic truncate hidden sm:inline font-sans">
                      "{asset.tagline}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Watched Toggle Button */}
              <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleItem(movie)}
                  disabled={updatingId === movie.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    isWatched
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {isWatched ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      Watched
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      Mark Watched
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
