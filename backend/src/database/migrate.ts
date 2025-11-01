import { db } from './connection';

export function runMigrations(): void {
  console.log('[Migrations] Starting database migrations...');

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrations = [
    {
      name: '001_create_users_table',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `
    },
    {
      name: '002_create_brutos_table',
      sql: `
        CREATE TABLE IF NOT EXISTS brutos (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL UNIQUE,
          level INTEGER DEFAULT 1,
          xp INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          strength INTEGER NOT NULL,
          agility INTEGER NOT NULL,
          speed INTEGER NOT NULL,
          hp INTEGER NOT NULL,
          appearance TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_brutos_user_id ON brutos(user_id);
        CREATE INDEX IF NOT EXISTS idx_brutos_name ON brutos(name);
      `
    },
    {
      name: '003_create_daily_fights_table',
      sql: `
        CREATE TABLE IF NOT EXISTS daily_fights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          fights_count INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, date)
        );
        CREATE INDEX IF NOT EXISTS idx_daily_fights_user_date ON daily_fights(user_id, date);
      `
    },
    {
      name: '004_create_battles_table',
      sql: `
        CREATE TABLE IF NOT EXISTS battles (
          id TEXT PRIMARY KEY,
          bruto1_id TEXT NOT NULL,
          bruto2_id TEXT NOT NULL,
          winner_id TEXT,
          turn_count INTEGER DEFAULT 0,
          battle_log TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bruto1_id) REFERENCES brutos(id) ON DELETE CASCADE,
          FOREIGN KEY (bruto2_id) REFERENCES brutos(id) ON DELETE CASCADE,
          FOREIGN KEY (winner_id) REFERENCES brutos(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_battles_bruto1 ON battles(bruto1_id);
        CREATE INDEX IF NOT EXISTS idx_battles_bruto2 ON battles(bruto2_id);
        CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_battles_bruto1_created ON battles(bruto1_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_battles_bruto2_created ON battles(bruto2_id, created_at DESC);
      `
    }
  ];

  for (const migration of migrations) {
    const existing = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migration.name);
    
    if (!existing) {
      console.log(`[Migrations] Applying: ${migration.name}`);
      db.exec(migration.sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      console.log(`[Migrations] ✓ ${migration.name} applied`);
    } else {
      console.log(`[Migrations] ○ ${migration.name} already applied`);
    }
  }

  console.log('[Migrations] All migrations completed');
}

// Run migrations immediately if this file is executed directly
if (require.main === module) {
  runMigrations();
  process.exit(0);
}
