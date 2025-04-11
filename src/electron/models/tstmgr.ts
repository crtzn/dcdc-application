// import { getDb } from "./dbmgr.js";
import { app } from "electron";
import path from "path";
import sqlite from "better-sqlite3";

export function getPatients() {
  // For development (in your project root)
  const dbPath = path.join(app.getAppPath(), "clinic.db");

  // For production (in user data directory)
  // const dbPath = path.join(app.getPath('userData'), 'clinic.db');

  const db = new sqlite(dbPath);
  const sql = "SELECT * FROM patients";
  const stmt = db.prepare(sql);
  const res = stmt.all();
  return res;
}
