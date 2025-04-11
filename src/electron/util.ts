export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

// import Database from "better-sqlite3";
// import { app } from "electron";
// import path from "path";
// import fs from "fs";
// import { Patient } from "../types/patient.js"; // Adjust the path based on your folder structure

// class DatabaseUtil {
//   private static instance: DatabaseUtil;
//   private db: Database.Database;

//   private constructor() {
//     const dbDir = path.join(app.getPath("userData"), "database");
//     const dbPath = path.join(dbDir, "dental_clinic.db");

//     console.log("Database path:", dbPath);

//     if (!fs.existsSync(dbDir)) {
//       fs.mkdirSync(dbDir, { recursive: true });
//       console.log("Created database directory:", dbDir);
//     }

//     this.db = new Database(dbPath, { verbose: console.log });

//     this.db.exec(`
//       CREATE TABLE IF NOT EXISTS patients (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           first_name TEXT NOT NULL,
//           last_name TEXT NOT NULL,
//           date_of_birth TEXT,
//           contact_number TEXT,
//           email TEXT,
//           address TEXT,
//           created_at TEXT DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//     console.log("Patients table ensured");
//   }

//   public static getInstance(): DatabaseUtil {
//     if (!DatabaseUtil.instance) {
//       DatabaseUtil.instance = new DatabaseUtil();
//     }
//     return DatabaseUtil.instance;
//   }

//   public addPatient(patient: Omit<Patient, "id" | "created_at">): Patient {
//     console.log("Adding patient to database:", patient);
//     const stmt = this.db.prepare(`
//       INSERT INTO patients (first_name, last_name, date_of_birth, contact_number, email, address)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `);
//     const result = stmt.run(
//       patient.first_name,
//       patient.last_name,
//       patient.date_of_birth,
//       patient.contact_number,
//       patient.email,
//       patient.address
//     );
//     console.log("Database insert result:", result);

//     const newPatient = this.db
//       .prepare("SELECT * FROM patients WHERE id = ?")
//       .get(result.lastInsertRowid) as Patient;
//     console.log("Newly inserted patient:", newPatient);
//     return newPatient;
//   }

//   public getPatients(): Patient[] {
//     console.log("Fetching all patients from database");
//     const patients = this.db
//       .prepare("SELECT * FROM patients")
//       .all() as Patient[];
//     console.log("Fetched patients:", patients);
//     return patients;
//   }

//   public getPatientById(id: number): Patient | undefined {
//     console.log("Fetching patient by ID:", id);
//     const patient = this.db
//       .prepare("SELECT * FROM patients WHERE id = ?")
//       .get(id) as Patient | undefined;
//     console.log("Fetched patient:", patient);
//     return patient;
//   }

//   public close() {
//     console.log("Closing database connection");
//     this.db.close();
//   }
// }

// export function isDev(): boolean {
//   return process.env.NODE_ENV === "development";
// }

// export default DatabaseUtil;
