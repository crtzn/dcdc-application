import sqlite from "better-sqlite3";

const db = new sqlite("./clinic.db");

export function getDb() {
  return db;
}
