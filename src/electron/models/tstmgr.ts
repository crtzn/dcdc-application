// src/models/tstmgr.ts
import { app } from "electron";
import path from "path";
import sqlite from "better-sqlite3";
// import fs from "fs";
import { isDev } from "../util.js";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "../types/RegularPatient.js";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "../types/OrthodonticPatient.js";

// Get database path
export function dbPath() {
  let dbPath;
  if (isDev()) {
    dbPath = path.join(app.getAppPath(), "clinic.db");
  } else {
    dbPath = path.join(process.resourcesPath, "clinic.db");
  }

  console.log("Database path:", dbPath);
  return dbPath;
}

// Initialize database connection and schema
const db = sqlite(dbPath(), { verbose: console.log, fileMustExist: false });

// Initialize database schema
function initializeDatabase() {
  try {
    // Create regular_patients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS regular_patients (
        patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        birthday TEXT,
        religion TEXT,
        home_address TEXT,
        sex TEXT,
        age INTEGER,
        nationality TEXT,
        cellphone_number TEXT,
        registration_date TEXT
      )
    `);

    // Create regular_medical_history table
    db.exec(`
      CREATE TABLE IF NOT EXISTS regular_medical_history (
        history_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        general_health TEXT,
        under_medical_treatment BOOLEAN DEFAULT 0,
        medical_condition TEXT,
        serious_illness_or_surgery BOOLEAN DEFAULT 0,
        illness_or_surgery_details TEXT,
        hospitalized BOOLEAN DEFAULT 0,
        hospitalization_details TEXT,
        taking_medications BOOLEAN DEFAULT 0,
        medications_list TEXT,
        uses_tobacco BOOLEAN DEFAULT 0,
        list_of_allergies TEXT,
        bleeding_time TEXT,
        is_pregnant BOOLEAN DEFAULT 0,
        is_nursing BOOLEAN DEFAULT 0,
        taking_birth_control BOOLEAN DEFAULT 0,
        blood_type TEXT,
        blood_pressure TEXT,
        selected_conditions TEXT,
        FOREIGN KEY (patient_id) REFERENCES regular_patients(patient_id)
      )
    `);

    // Create regular_treatment_records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS regular_treatment_records (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        treatment_date TEXT,
        tooth_number TEXT,
        procedure TEXT,
        dentist_name TEXT,
        amount_charged REAL,
        amount_paid REAL,
        balance REAL,
        mode_of_payment TEXT,
        notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES regular_patients(patient_id)
      )
    `);

    // Create orthodontic_patients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orthodontic_patients (
        patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_of_exam TEXT,
        name TEXT NOT NULL UNIQUE,
        occupation TEXT,
        birthday TEXT,
        parent_guardian_name TEXT,
        address TEXT,
        telephone_home TEXT,
        telephone_business TEXT,
        cellphone_number TEXT,
        email TEXT,
        chart TEXT,
        sex TEXT,
        age INTEGER,
        chief_complaint TEXT,
        past_medical_dental_history TEXT,
        prior_orthodontic_history TEXT,
        under_treatment_or_medication BOOLEAN DEFAULT 0,
        congenital_abnormalities BOOLEAN DEFAULT 0,
        temporomandibular_joint_problems BOOLEAN DEFAULT 0,
        oral_hygiene TEXT,
        gingival_tissues TEXT
      )
    `);

    // Create orthodontic_treatment_records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orthodontic_treatment_records (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        appt_no TEXT,
        date TEXT,
        arch_wire TEXT,
        procedure TEXT,
        amount_paid REAL,
        next_schedule TEXT,
        FOREIGN KEY (patient_id) REFERENCES orthodontic_patients(patient_id)
      )
    `);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
}

// Call initializeDatabase when the module is loaded
initializeDatabase();

//get all regular patients

export function getAllRegularPatients(): {
  success: boolean;
  total_count?: number;
  error?: string;
} {
  try {
    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM regular_patients`
    );
    const result = countStmt.get() as { total: number };
    const total_count = result.total;

    console.log(`This is the count of regular Patients ${total_count}`);

    return {
      success: true,
      total_count,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching regular patients count:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Add a new patient
export function addPatient(patient: Omit<RegularPatient, "patient_id">): {
  success: boolean;
  patient_id?: number;
  error?: string;
} {
  try {
    if (checkRegularPatientNameExists(patient.name)) {
      return {
        success: false,
        error: `A patient named "${patient.name}" already exists.`,
      };
    }
    const stmt = db.prepare(`
      INSERT INTO regular_patients (
        name, birthday, religion, home_address, sex, age, nationality, cellphone_number, registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      patient.name,
      patient.birthday,
      patient.religion || null,
      patient.home_address || null,
      patient.sex,
      patient.age || null,
      patient.nationality || null,
      patient.cellphone_number,
      patient.registration_date || new Date().toISOString()
    );
    return { success: true, patient_id: Number(result.lastInsertRowid) };
  } catch (error) {
    console.error("Error adding patient:", error);
    return {
      success: false,
      error: "Database error while adding patient.",
    };
  }
}

export function checkRegularPatientNameExists(name: string): boolean {
  try {
    const stmt = db.prepare("SELECT 1 FROM regular_patients WHERE name = ?");
    return stmt.get(name) !== undefined; // Returns true if name exists
  } catch (error) {
    console.error("Error checking patient name:", error);
    return false;
  }
}

// Add treatment record
export function addTreatmentRecord(record: RegularTreatmentRecord): {
  success: boolean;
} {
  try {
    const stmt = db.prepare(`
      INSERT INTO regular_treatment_records (
        patient_id, treatment_date, tooth_number, procedure, dentist_name,
        amount_charged, amount_paid, balance, mode_of_payment, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      record.patient_id,
      record.treatment_date || null,
      record.tooth_number || null,
      record.procedure || null,
      record.dentist_name || null,
      record.amount_charged || null,
      record.amount_paid || null,
      record.balance || null,
      record.mode_of_payment || null,
      record.notes || null
    );
    return { success: true };
  } catch (error) {
    console.error("Error adding treatment record:", error);
    return { success: false };
  }
}

// Add medical history
export function addMedicalHistory(
  history: Omit<RegularMedicalHistory, "history_id">
): {
  success: boolean;
  history_id?: number;
} {
  try {
    const stmt = db.prepare(`
      INSERT INTO regular_medical_history (
        patient_id, general_health, under_medical_treatment, medical_condition,
        serious_illness_or_surgery, illness_or_surgery_details, hospitalized,
        hospitalization_details, taking_medications, medications_list, uses_tobacco,
        list_of_allergies, bleeding_time, is_pregnant, is_nursing, taking_birth_control,
        blood_type, blood_pressure, selected_conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      history.patient_id,
      history.general_health || null,
      history.under_medical_treatment ? 1 : 0,
      history.medical_condition || null,
      history.serious_illness_or_surgery ? 1 : 0,
      history.illness_or_surgery_details || null,
      history.hospitalized ? 1 : 0,
      history.hospitalization_details || null,
      history.taking_medications ? 1 : 0,
      history.medications_list || null,
      history.uses_tobacco ? 1 : 0,
      history.list_of_allergies || null,
      history.bleeding_time || null,
      history.is_pregnant ? 1 : 0,
      history.is_nursing ? 1 : 0,
      history.taking_birth_control ? 1 : 0,
      history.blood_type || null,
      history.blood_pressure || null,
      history.selected_conditions || null
    );
    return { success: true, history_id: Number(result.lastInsertRowid) };
  } catch (error) {
    console.error("Error adding medical history:", error);
    return { success: false };
  }
}

// ====== ORTHODONTIC PATIENTS ======
// Add an orthodontic patient
export function addOrthodonticPatient(
  patient: Omit<OrthodonticPatient, "patient_id">
): {
  success: boolean;
  patient_id?: number;
  error?: string;
} {
  try {
    if (checkOrthoPatientNameExists(patient.name)) {
      return {
        success: false,
        error: `A patient named "${patient.name}" already exists.`,
      };
    }
    const stmt = db.prepare(`
      INSERT INTO orthodontic_patients (
        date_of_exam, name, occupation, birthday, parent_guardian_name, address,
        telephone_home, telephone_business, cellphone_number, email, chart, sex, age,
        chief_complaint, past_medical_dental_history, prior_orthodontic_history,
        under_treatment_or_medication, congenital_abnormalities, temporomandibular_joint_problems,
        oral_hygiene, gingival_tissues
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      patient.date_of_exam || null,
      patient.name,
      patient.occupation || null,
      patient.birthday || null,
      patient.parent_guardian_name || null,
      patient.address || null,
      patient.telephone_home || null,
      patient.telephone_business || null,
      patient.cellphone_number || null,
      patient.email || null,
      patient.chart || null,
      patient.sex || null,
      patient.age || null,
      patient.chief_complaint || null,
      patient.past_medical_dental_history || null,
      patient.prior_orthodontic_history || null,
      patient.under_treatment_or_medication ? 1 : 0,
      patient.congenital_abnormalities ? 1 : 0,
      patient.tmj_problems ? 1 : 0,
      patient.oral_hygiene || null,
      patient.gingival_tissues || null
    );
    return { success: true, patient_id: Number(result.lastInsertRowid) };
  } catch (error) {
    console.error("Error adding orthodontic patient:", error);
    return { success: false };
  }
}

// Add orthodontic treatment record
export function addOrthodonticTreatmentRecord(
  record: OrthodonticTreatmentRecord
): {
  success: boolean;
} {
  try {
    const stmt = db.prepare(`
      INSERT INTO orthodontic_treatment_records (
        patient_id, appt_no, date, arch_wire, procedure, amount_paid, next_schedule
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      record.patient_id,
      record.appointment_number || null,
      record.date || null,
      record.arch_wire || null,
      record.procedure || null,
      record.amount_paid || null,
      record.next_schedule || null
    );
    return { success: true };
  } catch (error) {
    console.error("Error adding orthodontic treatment record:", error);
    return { success: false };
  }
}

// Check if orthodontic patient name exists
export function checkOrthoPatientNameExists(name: string): boolean {
  try {
    const stmt = db.prepare(
      "SELECT 1 FROM orthodontic_patients WHERE name = ?"
    );
    return stmt.get(name) !== undefined;
  } catch (error) {
    console.error("Error checking ortho patient name:", error);
    return false;
  }
}
