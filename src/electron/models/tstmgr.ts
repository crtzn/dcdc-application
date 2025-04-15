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
        name TEXT NOT NULL,
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

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
}

// Call initializeDatabase when the module is loaded
initializeDatabase();

// Add a new patient
export function addPatient(patient: Omit<RegularPatient, "patient_id">): {
  success: boolean;
  patient_id?: number;
} {
  try {
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
    return { success: false };
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
