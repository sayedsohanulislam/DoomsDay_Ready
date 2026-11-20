import { useState, useEffect, useMemo } from 'react';
import { X, Search, Film, Check, AlertCircle } from 'lucide-react';

export default function MovieForm({ movie, allMovies, onSubmit, onClose }) {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [runtime, setRuntime] = useState('');
  const [prerequisites, setPrerequisites] = useState([]);
  const [prereqSearch, setPrereqSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!movie;

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setReleaseYear(String(movie.releaseYear));
      setRuntime(String(movie.runtime));
      setPrerequisites(movie.prerequisites?.map((p) => p.id) || []);
    }
  }, [movie]);

  const togglePrerequisite = (id) => {
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        releaseYear: parseInt(releaseYear, 10),
        runtime: parseInt(runtime, 10),
        prerequisites,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out the current movie from prerequisites options
  const prereqOptions = useMemo(() => {
    let list = allMovies.filter((m) => !movie || m.id !== movie.id);
    if (prereqSearch.trim()) {
      const q = prereqSearch.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }
    return list;
  }, [allMovies, movie, prereqSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white border border-stone-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#cba158]/15 border border-[#cba158]/35 flex items-center justify-center">
              <Film className="w-4 h-4 text-[#967026]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
                {isEdit ? 'Edit Film Entry' : 'Add Film to Rewatch Programme'}
              </h2>
              <p className="text-[11px] font-mono text-stone-500">
                {isEdit ? `Modifying ID #${movie.id}` : 'Canonical entry with cycle detection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5">
              Film Title (Must Be Unique)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 px-4 py-2.5 text-sm focus:bg-white focus:border-[#cba158] focus:ring-1 focus:ring-[#cba158]/30 outline-none transition-all font-sans"
              placeholder="e.g. Avengers: Secret Wars"
            />
          </div>

          {/* Year + Runtime row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                Release Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                required
                min="1900"
                max="2099"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 px-4 py-2.5 text-sm focus:bg-white focus:border-[#cba158] focus:ring-1 focus:ring-[#cba158]/30 outline-none transition-all font-mono"
                placeholder="2027"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                Runtime (1–300 Min)
              </label>
              <input
                type="number"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                required
                min="1"
                max="300"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 px-4 py-2.5 text-sm focus:bg-white focus:border-[#cba158] focus:ring-1 focus:ring-[#cba158]/30 outline-none transition-all font-mono"
                placeholder="165"
              />
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                Prerequisite Films (Watch First)
              </label>
              <span className="text-xs font-mono text-[#967026] font-bold">
                {prerequisites.length} selected
              </span>
            </div>

            {/* Filter search in prereqs */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prereqSearch}
                onChange={(e) => setPrereqSearch(e.target.value)}
                placeholder="Filter titles..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#cba158]"
              />
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto space-y-1 bg-stone-50 border border-stone-200 rounded-2xl p-2.5">
              {prereqOptions.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No matching films found.</p>
              ) : (
                prereqOptions.map((m) => {
                  const isChecked = prerequisites.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => togglePrerequisite(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#cba158]/15 border border-[#cba158]/50 text-stone-900 font-bold'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-[#cba158] border-[#cba158] text-stone-950 font-bold'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-serif truncate">{m.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 ml-2 flex-shrink-0">
                        {m.releaseYear} • {m.runtime}m
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-500">
              <AlertCircle className="w-3.5 h-3.5 text-[#967026] flex-shrink-0" />
              <span>DFS cycle detector forbids circular dependencies automatically.</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 shadow-sm transition-all flex items-center gap-2"
            >
              {submitting ? 'Validating...' : isEdit ? 'Save Changes' : 'Confirm & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
