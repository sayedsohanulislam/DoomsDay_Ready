const { Router } = require('express');
const db = require('../db');
const { detectCycle, getRewatchOrder } = require('../services/graphService');

const router = Router();

// Helper: get a movie with its prerequisites
function getMovieWithPrereqs(id) {
  const movie = db.prepare('SELECT id, title, release_year, runtime, watched, created_at FROM movies WHERE id = ?').get(id);
  if (!movie) return null;

  const prereqs = db.prepare(`
    SELECT m.id, m.title FROM movie_prerequisites mp
    JOIN movies m ON m.id = mp.prerequisite_id
    WHERE mp.movie_id = ?
  `).all(id);

  return {
    id: movie.id,
    title: movie.title,
    releaseYear: movie.release_year,
    runtime: movie.runtime,
    watched: movie.watched === 1,
    createdAt: movie.created_at,
    prerequisites: prereqs
  };
}

// POST /api/movies — Create movie
router.post('/', (req, res, next) => {
  try {
    const { title, releaseYear, runtime, prerequisites } = req.body;

    if (!title || releaseYear == null || runtime == null) {
      const err = new Error('title, releaseYear, and runtime are required');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (runtime < 1 || runtime > 300) {
      const err = new Error('runtime must be between 1 and 300');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Check title uniqueness
    const existing = db.prepare('SELECT id FROM movies WHERE title = ?').get(title);
    if (existing) {
      const err = new Error(`Movie with title "${title}" already exists`);
      err.status = 409; err.code = 'DUPLICATE_TITLE';
      throw err;
    }

    // Validate prerequisite IDs exist
    const prereqIds = prerequisites || [];
    for (const pid of prereqIds) {
      const exists = db.prepare('SELECT id FROM movies WHERE id = ?').get(pid);
      if (!exists) {
        const err = new Error(`Prerequisite movie with id ${pid} not found`);
        err.status = 404; err.code = 'PREREQUISITE_NOT_FOUND';
        throw err;
      }
    }

    // Insert movie
    const result = db.prepare(
      'INSERT INTO movies (title, release_year, runtime) VALUES (?, ?, ?)'
    ).run(title, releaseYear, runtime);

    const movieId = result.lastInsertRowid;

    // Check for cycles before inserting prerequisites
    if (prereqIds.length > 0) {
      if (detectCycle(movieId, prereqIds)) {
        // Rollback: delete the movie we just created
        db.prepare('DELETE FROM movies WHERE id = ?').run(movieId);
        const err = new Error('Adding these prerequisites would create a circular dependency');
        err.status = 409; err.code = 'CIRCULAR_DEPENDENCY';
        throw err;
      }

      const insertPrereq = db.prepare(
        'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES (?, ?)'
      );
      for (const pid of prereqIds) {
        insertPrereq.run(movieId, pid);
      }
    }

    res.status(201).json(getMovieWithPrereqs(movieId));
  } catch (err) {
    next(err);
  }
});

// GET /api/movies — List all movies
router.get('/', (req, res, next) => {
  try {
    const movies = db.prepare('SELECT id, title, release_year, runtime, watched, created_at FROM movies ORDER BY id').all();

    const result = movies.map(movie => {
      const prereqs = db.prepare(`
        SELECT m.id, m.title FROM movie_prerequisites mp
        JOIN movies m ON m.id = mp.prerequisite_id
        WHERE mp.movie_id = ?
      `).all(movie.id);

      return {
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        runtime: movie.runtime,
        watched: movie.watched === 1,
        createdAt: movie.created_at,
        prerequisites: prereqs
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/movies/:id — Update movie
router.patch('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
    if (!movie) {
      const err = new Error(`Movie with id ${id} not found`);
      err.status = 404; err.code = 'NOT_FOUND';
      throw err;
    }

    const { title, releaseYear, runtime, watched, prerequisites } = req.body;

    // Validate runtime if provided
    if (runtime != null && (runtime < 1 || runtime > 300)) {
      const err = new Error('runtime must be between 1 and 300');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Check title uniqueness if changing title
    if (title != null && title !== movie.title) {
      const existing = db.prepare('SELECT id FROM movies WHERE title = ? AND id != ?').get(title, id);
      if (existing) {
        const err = new Error(`Movie with title "${title}" already exists`);
        err.status = 409; err.code = 'DUPLICATE_TITLE';
        throw err;
      }
    }

    // Update fields
    const updates = [];
    const params = [];

    if (title != null) { updates.push('title = ?'); params.push(title); }
    if (releaseYear != null) { updates.push('release_year = ?'); params.push(releaseYear); }
    if (runtime != null) { updates.push('runtime = ?'); params.push(runtime); }
    if (watched != null) { updates.push('watched = ?'); params.push(watched ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE movies SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    // Handle prerequisites update
    if (prerequisites != null) {
      // Validate all prereq IDs exist
      for (const pid of prerequisites) {
        if (pid === id) {
          const err = new Error('A movie cannot be its own prerequisite');
          err.status = 409; err.code = 'CIRCULAR_DEPENDENCY';
          throw err;
        }
        const exists = db.prepare('SELECT id FROM movies WHERE id = ?').get(pid);
        if (!exists) {
          const err = new Error(`Prerequisite movie with id ${pid} not found`);
          err.status = 404; err.code = 'PREREQUISITE_NOT_FOUND';
          throw err;
        }
      }

      // Remove existing prerequisites temporarily to check cycle with new set
      const oldPrereqs = db.prepare('SELECT prerequisite_id FROM movie_prerequisites WHERE movie_id = ?').all(id);
      db.prepare('DELETE FROM movie_prerequisites WHERE movie_id = ?').run(id);

      if (prerequisites.length > 0 && detectCycle(id, prerequisites)) {
        // Restore old prerequisites
        const insertPrereq = db.prepare('INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES (?, ?)');
        for (const old of oldPrereqs) {
          insertPrereq.run(id, old.prerequisite_id);
        }
        const err = new Error('Adding these prerequisites would create a circular dependency');
        err.status = 409; err.code = 'CIRCULAR_DEPENDENCY';
        throw err;
      }

      // Insert new prerequisites
      const insertPrereq = db.prepare('INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES (?, ?)');
      for (const pid of prerequisites) {
        insertPrereq.run(id, pid);
      }
    }

    res.json(getMovieWithPrereqs(id));
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id/rewatch-order
router.get('/:id/rewatch-order', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(id);
    if (!movie) {
      const err = new Error(`Movie with id ${id} not found`);
      err.status = 404; err.code = 'NOT_FOUND';
      throw err;
    }

    const result = getRewatchOrder(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/movies/:id — Delete a movie
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(id);
    if (!movie) {
      const err = new Error(`Movie with id ${id} not found`);
      err.status = 404; err.code = 'NOT_FOUND';
      throw err;
    }

    // Cascade deletes handle movie_prerequisites
    db.prepare('DELETE FROM movie_prerequisites WHERE movie_id = ? OR prerequisite_id = ?').run(id, id);
    db.prepare('DELETE FROM movies WHERE id = ?').run(id);

    res.json({ message: 'Movie deleted successfully', id });
  } catch (err) {
    next(err);
  }
});

// POST /api/movies/reset-seed — Reset dataset to official MCU sample data
router.post('/reset-seed', async (req, res, next) => {
  try {
    const { seed } = require('../../seed');
    await seed();
    res.json({ message: 'Database reset to official sample MCU dataset' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
