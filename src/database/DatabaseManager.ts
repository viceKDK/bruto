/**
 * DatabaseManager - sql.js wrapper with migrations
 * Handles database initialization, migrations, and query execution
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { Result, ok, err } from '../utils/result';
import { GameError, ErrorCodes } from '../utils/errors';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private initialized = false;

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize sql.js and create/load database
   */
  public async initialize(): Promise<Result<void>> {
    if (this.initialized) {
      console.log('[DatabaseManager] Already initialized');
      return ok(undefined);
    }

    try {
      console.log('[DatabaseManager] Initializing sql.js...');

      // Load sql.js WASM module
      this.SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      console.log('[DatabaseManager] sql.js loaded successfully');

      // Load existing database from localStorage or create new
      const savedDb = localStorage.getItem('bruto_database');

      if (savedDb) {
        console.log('[DatabaseManager] Loading existing database from localStorage');
        const uint8Array = new Uint8Array(
          atob(savedDb)
            .split('')
            .map((c) => c.charCodeAt(0))
        );
        this.db = new this.SQL.Database(uint8Array);
      } else {
        console.log('[DatabaseManager] Creating new database');
        this.db = new this.SQL.Database();
      }

      // Run migrations
      await this.runMigrations();

      this.initialized = true;
      console.log('[DatabaseManager] Initialization complete');

      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[DatabaseManager] Initialization failed:', message);
      return err(`Database initialization failed: ${message}`, ErrorCodes.DB_INIT_FAILED);
    }
  }

  /**
   * Run pending migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new GameError(ErrorCodes.DB_INIT_FAILED, 'Database not initialized');
    }

    console.log('[DatabaseManager] Running migrations...');

    // Migration files (order matters!)
    const migrations = [
      {
        name: '001_initial_schema',
        sql: await this.loadMigrationFile('001_initial_schema.sql'),
      },
      {
        name: '002_add_indexes',
        sql: await this.loadMigrationFile('002_add_indexes.sql'),
      },
      {
        name: '003_create_level_upgrades_table',
        sql: await this.loadMigrationFile('003_create_level_upgrades_table.sql'),
      },
      {
        name: '004_coin_economy',
        sql: await this.loadMigrationFile('004_coin_economy.sql'),
      },
      {
        name: '005_battle_snapshots',
        sql: await this.loadMigrationFile('005_battle_snapshots.sql'),
      },
      {
        name: '006_skills_system',
        sql: await this.loadMigrationFile('006_skills_system.sql'),
      },
      {
        name: '007_pets_system',
        sql: await this.loadMigrationFile('007_pets_system.sql'),
      },
    ];

    for (const migration of migrations) {
      // Check if migration already applied
      try {
        const result = this.db.exec(
          `SELECT 1 FROM migrations WHERE name = '${migration.name}'`
        );

        if (result.length > 0 && result[0].values.length > 0) {
          console.log(`[DatabaseManager] Migration ${migration.name} already applied`);
          continue;
        }
      } catch (e) {
        // migrations table doesn't exist yet, will be created
      }

      // Apply migration
      console.log(`[DatabaseManager] Applying migration: ${migration.name}`);
      try {
        this.db.exec(migration.sql);

        // Record migration
        this.db.run(
          `INSERT INTO migrations (name, applied_at) VALUES (?, ?)`,
          [migration.name, Date.now()]
        );

        console.log(`[DatabaseManager] Migration ${migration.name} applied successfully`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new GameError(
          ErrorCodes.DB_MIGRATION_FAILED,
          `Migration ${migration.name} failed: ${message}`
        );
      }
    }

    // Save database after migrations
    this.save();
  }

  /**
   * Load migration file content
   */
  private async loadMigrationFile(filename: string): Promise<string> {
    // In a real setup, these would be imported or fetched
    // For now, we'll import them dynamically
    const response = await fetch(`/src/database/migrations/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load migration: ${filename}`);
    }
    return response.text();
  }

  /**
   * Execute a SQL query and return results
   */
  public query<T = any>(sql: string, params: any[] = []): Result<T[]> {
    if (!this.db) {
      return err('Database not initialized', ErrorCodes.DB_INIT_FAILED);
    }

    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);

      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }
      stmt.free();

      return ok(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[DatabaseManager] Query failed:', sql, message);
      return err(`Query failed: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Execute a single SQL statement (INSERT, UPDATE, DELETE)
   */
  public run(sql: string, params: any[] = []): Result<void> {
    if (!this.db) {
      return err('Database not initialized', ErrorCodes.DB_INIT_FAILED);
    }

    try {
      this.db.run(sql, params);
      this.save(); // Auto-save after mutations
      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[DatabaseManager] Run failed:', sql, message);
      return err(`Run failed: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Get a single row
   */
  public getOne<T = any>(sql: string, params: any[] = []): Result<T | null> {
    const result = this.query<T>(sql, params);
    if (!result.success) {
      return err(result.error, result.code);
    }
    return ok(result.data.length > 0 ? result.data[0] : null);
  }

  /**
   * Save database to localStorage
   */
  public save(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const base64 = btoa(String.fromCharCode(...data));
      localStorage.setItem('bruto_database', base64);
      console.log('[DatabaseManager] Database saved to localStorage');
    } catch (error) {
      console.error('[DatabaseManager] Failed to save database:', error);
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  public clear(): void {
    localStorage.removeItem('bruto_database');
    console.log('[DatabaseManager] Database cleared from localStorage');
  }

  /**
   * Close database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('[DatabaseManager] Database closed');
    }
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();
