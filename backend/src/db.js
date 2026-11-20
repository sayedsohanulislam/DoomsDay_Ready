/**
 * sql.js wrapper that exposes a better-sqlite3-compatible synchronous API.
 * Call `await db.init()` once before using any other method.
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const os = require('os');
const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? os.tmpdir() : path.join(__dirname, '..', 'data');
const DB_PATH = path.join(dataDir, 'doomsday.db');

let sqlDb = null;

function save() {
  try {
    if (sqlDb) {
      const data = sqlDb.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
  } catch (err) {
    // In serverless environments, in-memory DB persists across warm invokes
  }
}

const db = {
  async init() {
    const wasmPath = path.dirname(require.resolve('sql.js'));
    const SQL = await initSqlJs({
      locateFile: file => path.join(wasmPath, file)
    });
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {}
    }
    if (fs.existsSync(DB_PATH)) {
      try {
        const buf = fs.readFileSync(DB_PATH);
        sqlDb = new SQL.Database(buf);
      } catch (err) {
        sqlDb = new SQL.Database();
      }
    } else {
      sqlDb = new SQL.Database();
    }

    sqlDb.run('PRAGMA foreign_keys = ON');

    sqlDb.exec(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        release_year INTEGER NOT NULL,
        runtime INTEGER NOT NULL CHECK(runtime >= 1 AND runtime <= 300),
        watched INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS movie_prerequisites (
        movie_id INTEGER NOT NULL,
        prerequisite_id INTEGER NOT NULL,
        PRIMARY KEY (movie_id, prerequisite_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_id) REFERENCES movies(id) ON DELETE CASCADE,
        CHECK (movie_id != prerequisite_id)
      );

      CREATE TABLE IF NOT EXISTS cinemas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS cinema_bundle_sizes (
        cinema_id INTEGER NOT NULL,
        bundle_size INTEGER NOT NULL CHECK(bundle_size >= 1 AND bundle_size <= 500),
        PRIMARY KEY (cinema_id, bundle_size),
        FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
      );
    `);

    save();
    return db;
  },

  prepare(sql) {
    return {
      run(...params) {
        sqlDb.run(sql, params);
        const changes = sqlDb.getRowsModified();
        const res = sqlDb.exec('SELECT last_insert_rowid()');
        const lastInsertRowid = res.length > 0 ? res[0].values[0][0] : 0;
        save();
        return { changes, lastInsertRowid };
      },

      get(...params) {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let row;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row || undefined;
      },

      all(...params) {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }
    };
  },

  exec(sql) {
    sqlDb.exec(sql);
    save();
  },

  pragma(str) {
    sqlDb.run(`PRAGMA ${str}`);
  },

  transaction(fn) {
    return (...args) => {
      sqlDb.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        sqlDb.run('COMMIT');
        save();
        return result;
      } catch (e) {
        try { sqlDb.run('ROLLBACK'); } catch (_) {}
        throw e;
      }
    };
  }
};

module.exports = db;
