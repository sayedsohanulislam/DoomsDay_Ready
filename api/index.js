const db = require('../backend/src/db');
const { seed } = require('../backend/seed');
const app = require('../backend/src/app');

let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await db.init();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM movies').get();
    if (!countRow || countRow.count === 0) {
      await seed();
    }
    initialized = true;
  }
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
