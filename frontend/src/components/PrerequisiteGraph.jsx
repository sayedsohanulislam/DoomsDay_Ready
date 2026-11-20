import { useMemo } from 'react';
import { Check, Clock, Eye, Film } from 'lucide-react';
import { getMovieAsset, getFallbackPoster } from '../utils/movieAssets';

export default function PrerequisiteGraph({ movies, targetMovieId, onSelectTarget, onToggleWatched }) {
  // Build a topological layout
  const graphData = useMemo(() => {
    if (!movies || movies.length === 0) return { nodes: [], edges: [] };

    const movieMap = new Map(movies.map(m => [m.id, m]));
    
    // Map movies to phases or depth layers
    const depthMap = new Map();
    const getDepth = (id, visited = new Set()) => {
      if (visited.has(id)) return 0;
      if (depthMap.has(id)) return depthMap.get(id);
      visited.add(id);
      const m = movieMap.get(id);
      if (!m || !m.prerequisites || m.prerequisites.length === 0) {
        depthMap.set(id, 0);
        return 0;
      }
      let maxPrereqDepth = 0;
      for (const p of m.prerequisites) {
        maxPrereqDepth = Math.max(maxPrereqDepth, getDepth(p.id, new Set(visited)) + 1);
      }
      depthMap.set(id, maxPrereqDepth);
      return maxPrereqDepth;
    };

    movies.forEach(m => getDepth(m.id));

    // Group movies by depth column
    const columns = {};
    movies.forEach(m => {
      const d = depthMap.get(m.id) || 0;
      if (!columns[d]) columns[d] = [];
      columns[d].push(m);
    });

    const maxDepth = Math.max(...Object.keys(columns).map(Number), 0);
    const colWidth = 230;
    const rowHeight = 110;
    const startX = 40;
    const startY = 40;

    const nodePositions = new Map();
    const nodes = [];

    Object.keys(columns).forEach(colKey => {
      const col = parseInt(colKey, 10);
      const list = columns[col];
      const x = startX + col * colWidth;
      
      list.forEach((movie, rowIdx) => {
        const yOffset = (4 - list.length) * 35;
        const y = startY + Math.max(0, yOffset) + rowIdx * rowHeight;
        
        nodePositions.set(movie.id, { x, y, movie });
        nodes.push({ x, y, movie });
      });
    });

    // Edges
    const edges = [];
    movies.forEach(movie => {
      if (movie.prerequisites) {
        movie.prerequisites.forEach(prereq => {
          const fromPos = nodePositions.get(prereq.id);
          const toPos = nodePositions.get(movie.id);
          if (fromPos && toPos) {
            edges.push({
              id: `${prereq.id}->${movie.id}`,
              from: fromPos,
              to: toPos,
              fromId: prereq.id,
              toId: movie.id,
            });
          }
        });
      }
    });

    const width = startX + (maxDepth + 1) * colWidth + 60;
    const height = Math.max(480, ...nodes.map(n => n.y + 120));

    return { nodes, edges, width, height };
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-3xl bg-[#fdfcf9] border border-stone-200 p-5 shadow-sm relative cyber-grid">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#cba158]" />
          <span className="text-xs font-mono tracking-widest uppercase text-stone-600 font-bold">
            MCU Topological Network • Directed Acyclic Graph (DAG)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-500" />
            Watched
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-100 border border-stone-400" />
            Unwatched
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#cba158]/20 border border-[#cba158]" />
            Active Target
          </span>
        </div>
      </div>

      <div className="min-w-[860px] relative">
        <svg
          width={graphData.width}
          height={graphData.height}
          className="overflow-visible"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#b48937" opacity="0.7" />
            </marker>
            <marker
              id="arrowhead-highlight"
              markerWidth="9"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 9 3.5, 0 7" fill="#967026" />
            </marker>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cba158" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#967026" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edge-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cba158" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#967026" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Render Connections */}
          {graphData.edges.map((edge) => {
            const isTargetEdge = targetMovieId && (edge.toId === Number(targetMovieId));
            const startX = edge.from.x + 190;
            const startY = edge.from.y + 42;
            const endX = edge.to.x;
            const endY = edge.to.y + 42;
            const dx = (endX - startX) / 2;

            const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isTargetEdge ? 'url(#edge-gradient-active)' : 'url(#edge-gradient)'}
                  strokeWidth={isTargetEdge ? 2.5 : 1.5}
                  strokeDasharray={isTargetEdge ? 'none' : '4 2'}
                  markerEnd={isTargetEdge ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Render Nodes as SVG foreignObjects */}
          {graphData.nodes.map(({ x, y, movie }) => {
            const isTarget = targetMovieId && Number(targetMovieId) === movie.id;
            const isWatched = movie.watched;
            const asset = getMovieAsset(movie.title);

            return (
              <foreignObject
                key={movie.id}
                x={x}
                y={y}
                width={196}
                height={88}
                className="overflow-visible"
              >
                <div
                  onClick={() => onSelectTarget && onSelectTarget(movie.id)}
                  className={`w-[196px] h-[84px] rounded-2xl p-2 transition-all duration-200 cursor-pointer flex gap-2 group ${
                    isTarget
                      ? 'bg-white border-2 border-[#cba158] shadow-md ring-2 ring-[#cba158]/20'
                      : isWatched
                      ? 'bg-white border border-emerald-300 shadow-sm hover:border-emerald-500'
                      : 'bg-white border border-stone-200 hover:border-[#cba158] shadow-sm'
                  }`}
                >
                  {/* Poster Thumbnail */}
                  <div className="w-10 h-full rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h5
                        className={`font-serif text-xs font-bold tracking-tight truncate leading-tight ${
                          isTarget ? 'text-[#967026]' : isWatched ? 'text-stone-700' : 'text-stone-900'
                        }`}
                        title={movie.title}
                      >
                        {movie.title}
                      </h5>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatched && onToggleWatched(movie);
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isWatched
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-stone-50 text-stone-400 border border-stone-200 hover:text-stone-900 hover:border-[#cba158]'
                        }`}
                        title={isWatched ? 'Mark unwatched' : 'Mark watched'}
                      >
                        {isWatched ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Eye className="w-2.5 h-2.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-stone-500 pt-1 border-t border-stone-100 font-mono">
                      <span>{movie.releaseYear}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-stone-400" />
                        {movie.runtime}m
                      </span>
                      {isTarget && (
                        <span className="text-[8px] uppercase tracking-wider font-bold text-[#967026] bg-[#cba158]/15 px-1 py-0.2 rounded">
                          Target
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
