const db = require('./src/db');

const movies = [
  { title: 'Iron Man', releaseYear: 2008, runtime: 126, watched: 1 },
  { title: 'Captain America: The First Avenger', releaseYear: 2011, runtime: 124, watched: 1 },
  { title: 'The Avengers', releaseYear: 2012, runtime: 143, watched: 1 },
  { title: 'Captain America: Civil War', releaseYear: 2016, runtime: 147, watched: 1 },
  { title: 'Thor: Ragnarok', releaseYear: 2017, runtime: 130, watched: 0 },
  { title: 'Avengers: Infinity War', releaseYear: 2018, runtime: 149, watched: 0 },
  { title: 'Avengers: Endgame', releaseYear: 2019, runtime: 181, watched: 0 },
  { title: 'Avengers: Doomsday', releaseYear: 2026, runtime: 165, watched: 0 }
];

// Title -> list of prerequisite titles (from official challenge specification)
const prerequisites = {
  'The Avengers': ['Iron Man', 'Captain America: The First Avenger'],
  'Captain America: Civil War': ['The Avengers'],
  'Avengers: Infinity War': ['Captain America: Civil War', 'Thor: Ragnarok'],
  'Avengers: Endgame': ['Avengers: Infinity War'],
  'Avengers: Doomsday': ['Avengers: Endgame']
};

const sampleCinemas = [
  { name: 'Stark Tower IMAX', bundleSizes: [1, 3, 4] },
  { name: 'Sanctum Sanctorum Cinema', bundleSizes: [2, 5] },
  { name: 'Wakanda Royal Dolby Cinema', bundleSizes: [6, 9, 20] },
  { name: 'Avengers Compound Cineplex', bundleSizes: [4, 6] }
];

async function seed() {
  await db.init();

  console.log('Seeding MCU Doomsday Ready database...');

  // Clear existing data to ensure clean seed
  db.exec('DELETE FROM movie_prerequisites');
  db.exec('DELETE FROM cinema_bundle_sizes');
  db.exec('DELETE FROM movies');
  db.exec('DELETE FROM cinemas');

  const insertMovie = db.prepare(
    'INSERT INTO movies (title, release_year, runtime, watched) VALUES (?, ?, ?, ?)'
  );

  const insertPrereq = db.prepare(
    'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES (?, ?)'
  );

  const titleToId = {};
  for (const movie of movies) {
    const result = insertMovie.run(movie.title, movie.releaseYear, movie.runtime, movie.watched);
    titleToId[movie.title] = result.lastInsertRowid;
  }

  // Insert prerequisites
  for (const [targetTitle, prereqTitles] of Object.entries(prerequisites)) {
    const movieId = titleToId[targetTitle];
    for (const prereqTitle of prereqTitles) {
      const prereqId = titleToId[prereqTitle];
      if (movieId && prereqId) {
        insertPrereq.run(movieId, prereqId);
      }
    }
  }

  // Insert sample cinemas
  const insertCinema = db.prepare('INSERT INTO cinemas (name) VALUES (?)');
  const insertBundle = db.prepare('INSERT INTO cinema_bundle_sizes (cinema_id, bundle_size) VALUES (?, ?)');

  for (const cinema of sampleCinemas) {
    const result = insertCinema.run(cinema.name);
    const cinemaId = result.lastInsertRowid;
    for (const size of cinema.bundleSizes) {
      insertBundle.run(cinemaId, size);
    }
  }

  console.log(`Seeded ${movies.length} MCU movies with official prerequisite graph.`);
  console.log(`Seeded ${sampleCinemas.length} sample cinemas with opening night bundle sizes.`);
  console.log('Seeding complete!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };

