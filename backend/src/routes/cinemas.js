const { Router } = require('express');
const db = require('../db');
const { calculateMinBundles } = require('../services/bookingService');

const router = Router();

// Helper: get cinema with bundle sizes
function getCinemaWithBundles(id) {
  const cinema = db.prepare('SELECT id, name, created_at FROM cinemas WHERE id = ?').get(id);
  if (!cinema) return null;

  const bundles = db.prepare('SELECT bundle_size FROM cinema_bundle_sizes WHERE cinema_id = ? ORDER BY bundle_size').all(id);

  return {
    id: cinema.id,
    name: cinema.name,
    createdAt: cinema.created_at,
    bundleSizes: bundles.map(b => b.bundle_size)
  };
}

// POST /api/cinemas — Create cinema
router.post('/', (req, res, next) => {
  try {
    const { name, bundleSizes } = req.body;

    if (!name) {
      const err = new Error('name is required');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (!bundleSizes || !Array.isArray(bundleSizes) || bundleSizes.length === 0) {
      const err = new Error('bundleSizes must be a non-empty array');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (bundleSizes.length > 10) {
      const err = new Error('Maximum 10 bundle sizes allowed');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    for (const size of bundleSizes) {
      if (!Number.isInteger(size) || size < 1 || size > 500) {
        const err = new Error('Each bundle size must be an integer between 1 and 500');
        err.status = 400; err.code = 'VALIDATION_ERROR';
        throw err;
      }
    }

    // Check name uniqueness
    const existing = db.prepare('SELECT id FROM cinemas WHERE name = ?').get(name);
    if (existing) {
      const err = new Error(`Cinema with name "${name}" already exists`);
      err.status = 409; err.code = 'DUPLICATE_NAME';
      throw err;
    }

    const result = db.prepare('INSERT INTO cinemas (name) VALUES (?)').run(name);
    const cinemaId = result.lastInsertRowid;

    // Insert bundle sizes (deduplicate)
    const uniqueSizes = [...new Set(bundleSizes)];
    const insertBundle = db.prepare('INSERT INTO cinema_bundle_sizes (cinema_id, bundle_size) VALUES (?, ?)');
    for (const size of uniqueSizes) {
      insertBundle.run(cinemaId, size);
    }

    res.status(201).json(getCinemaWithBundles(cinemaId));
  } catch (err) {
    next(err);
  }
});

// GET /api/cinemas — List all cinemas
router.get('/', (req, res, next) => {
  try {
    const cinemas = db.prepare('SELECT id, name, created_at FROM cinemas ORDER BY id').all();

    const result = cinemas.map(cinema => {
      const bundles = db.prepare('SELECT bundle_size FROM cinema_bundle_sizes WHERE cinema_id = ? ORDER BY bundle_size').all(cinema.id);
      return {
        id: cinema.id,
        name: cinema.name,
        createdAt: cinema.created_at,
        bundleSizes: bundles.map(b => b.bundle_size)
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/cinemas/:id/booking?groupSize=N
router.get('/:id/booking', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cinema = db.prepare('SELECT id FROM cinemas WHERE id = ?').get(id);
    if (!cinema) {
      const err = new Error(`Cinema with id ${id} not found`);
      err.status = 404; err.code = 'NOT_FOUND';
      throw err;
    }

    const groupSize = parseInt(req.query.groupSize, 10);
    if (isNaN(groupSize) || groupSize < 1 || groupSize > 10000) {
      const err = new Error('groupSize must be an integer between 1 and 10000');
      err.status = 400; err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const bundles = db.prepare('SELECT bundle_size FROM cinema_bundle_sizes WHERE cinema_id = ?').all(id);
    const bundleSizes = bundles.map(b => b.bundle_size);

    const result = calculateMinBundles(bundleSizes, groupSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
