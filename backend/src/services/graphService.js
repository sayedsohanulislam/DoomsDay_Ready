const db = require('../db');

/**
 * Detect if adding the given prerequisite IDs to movieId would create a cycle.
 * Uses DFS: starting from each proposed prerequisite, follow its prerequisites.
 * If we ever reach movieId, it's a cycle.
 */
function detectCycle(movieId, proposedPrereqIds) {
  // Build adjacency: movie -> its prerequisites (from DB)
  const allEdges = db.prepare('SELECT movie_id, prerequisite_id FROM movie_prerequisites').all();
  const prereqMap = new Map(); // movie_id -> Set of prerequisite_ids

  for (const edge of allEdges) {
    if (!prereqMap.has(edge.movie_id)) {
      prereqMap.set(edge.movie_id, new Set());
    }
    prereqMap.get(edge.movie_id).add(edge.prerequisite_id);
  }

  // Temporarily add proposed edges
  if (!prereqMap.has(movieId)) {
    prereqMap.set(movieId, new Set());
  }
  for (const pid of proposedPrereqIds) {
    prereqMap.get(movieId).add(pid);
  }

  // DFS from movieId: can we reach movieId again by following prerequisite links?
  const visited = new Set();
  const stack = [...proposedPrereqIds];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === movieId) {
      return true; // Cycle detected
    }
    if (visited.has(current)) continue;
    visited.add(current);

    const prereqs = prereqMap.get(current);
    if (prereqs) {
      for (const p of prereqs) {
        if (!visited.has(p)) {
          stack.push(p);
        }
      }
    }
  }

  return false;
}

/**
 * Collect all transitive prerequisites for a movie (not including itself).
 */
function collectAllPrerequisites(movieId) {
  const visited = new Set();
  const stack = [movieId];

  while (stack.length > 0) {
    const current = stack.pop();
    const prereqs = db.prepare(
      'SELECT prerequisite_id FROM movie_prerequisites WHERE movie_id = ?'
    ).all(current);

    for (const { prerequisite_id } of prereqs) {
      if (!visited.has(prerequisite_id)) {
        visited.add(prerequisite_id);
        stack.push(prerequisite_id);
      }
    }
  }

  return visited; // Set of all transitive prerequisite IDs
}

/**
 * Topological sort using Kahn's algorithm.
 * Takes a set of movie IDs and returns them in topological order.
 * The graph is: movie -> prerequisites (prerequisite must come before movie).
 */
function topologicalSort(movieIds) {
  if (movieIds.size === 0) return [];

  const ids = [...movieIds];

  // Build sub-graph adjacency and in-degree within only these nodes
  // Edge direction: prerequisite -> movie (prerequisite must come first)
  const adjList = new Map(); // from -> [to]
  const inDegree = new Map();

  for (const id of ids) {
    adjList.set(id, []);
    inDegree.set(id, 0);
  }

  // For each movie in our set, get its prerequisites that are also in the set
  for (const id of ids) {
    const prereqs = db.prepare(
      'SELECT prerequisite_id FROM movie_prerequisites WHERE movie_id = ?'
    ).all(id);

    for (const { prerequisite_id } of prereqs) {
      if (movieIds.has(prerequisite_id)) {
        // Edge: prerequisite_id -> id (prerequisite comes before id)
        adjList.get(prerequisite_id).push(id);
        inDegree.set(id, inDegree.get(id) + 1);
      }
    }
  }

  // Start with nodes that have in-degree 0
  const queue = [];
  for (const id of ids) {
    if (inDegree.get(id) === 0) {
      queue.push(id);
    }
  }

  const sorted = [];
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);

    for (const neighbor of adjList.get(node)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

/**
 * Get the full rewatch order for a movie.
 * Returns array of movie objects in topological order (prerequisites first).
 */
function getRewatchOrder(movieId) {
  const prereqIds = collectAllPrerequisites(movieId);
  const sortedIds = topologicalSort(prereqIds);

  // Fetch movie details for each
  const movies = sortedIds.map(id => {
    const movie = db.prepare('SELECT id, title, release_year, runtime, watched FROM movies WHERE id = ?').get(id);
    return {
      id: movie.id,
      title: movie.title,
      releaseYear: movie.release_year,
      runtime: movie.runtime,
      watched: movie.watched === 1
    };
  });

  const totalMovies = movies.length;
  const watchedCount = movies.filter(m => m.watched).length;
  const unwatchedRuntime = movies.filter(m => !m.watched).reduce((sum, m) => sum + m.runtime, 0);

  return {
    rewatchOrder: movies,
    totalMovies,
    watchedCount,
    unwatchedRuntime
  };
}

module.exports = { detectCycle, getRewatchOrder };
