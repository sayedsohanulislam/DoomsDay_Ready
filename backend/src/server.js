const db = require('./db');
const { seed } = require('../seed');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await db.init();

    // Auto-seed if database is freshly created
    const countRow = db.prepare('SELECT COUNT(*) as count FROM movies').get();
    if (!countRow || countRow.count === 0) {
      console.log('Database empty, populating with sample MCU data...');
      await seed();
    }

    const app = require('./app');
    app.listen(PORT, () => {
      console.log(`Doomsday Ready API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
