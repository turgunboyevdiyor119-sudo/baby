import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    experience INTEGER,
    status TEXT,
    photo TEXT,
    courseStartDate TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workerId INTEGER NOT NULL,
    workerName TEXT NOT NULL,
    clientName TEXT NOT NULL,
    clientPhone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    slotId INTEGER NOT NULL,
    FOREIGN KEY(workerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workerId INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    booked INTEGER DEFAULT 0,
    FOREIGN KEY(workerId) REFERENCES users(id)
  );
`);

export default db;
