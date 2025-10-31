import Database from 'better-sqlite3';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../../database/bruto.db');

class DatabaseConnection {
  private static instance: Database.Database;

  public static getConnection(): Database.Database {
    if (!DatabaseConnection.instance) {
      console.log(`[Database] Connecting to SQLite database at: ${DB_PATH}`);
      DatabaseConnection.instance = new Database(DB_PATH);
      DatabaseConnection.instance.pragma('journal_mode = WAL');
      DatabaseConnection.instance.pragma('foreign_keys = ON');
      console.log('[Database] Connected successfully');
    }
    return DatabaseConnection.instance;
  }

  public static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      console.log('[Database] Connection closed');
    }
  }
}

export const db = DatabaseConnection.getConnection();
export default DatabaseConnection;
