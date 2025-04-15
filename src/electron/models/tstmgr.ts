import { app } from "electron";
import path from "path";
import sqlite from "better-sqlite3";
import fs from "fs";
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
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at ${dbPath}`);
  }

  return dbPath;
}

// Initialize database connection
const db = sqlite(dbPath(), { verbose: console.log });

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
        serious_illness_or_surgery, hospitalization_details, taking_medications,
        medications_list, uses_tobacco, list_of_allergies, bleeding_time,
        is_pregnant, is_nursing, taking_birth_control, blood_type, blood_pressure
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      history.patient_id,
      history.general_health || null,
      history.under_medical_treatment || false,
      history.medical_condition || null,
      history.serious_illness_or_surgery || false,
      history.hospitalization_details || null,
      history.taking_medications || false,
      history.medications_list || null,
      history.uses_tobacco || false,
      history.list_of_allergies || null,
      history.bleeding_time || null,
      history.is_pregnant || false,
      history.is_nursing || false,
      history.taking_birth_control || false,
      history.blood_type || null,
      history.blood_pressure || null
    );
    return { success: true, history_id: Number(result.lastInsertRowid) };
  } catch (error) {
    console.error("Error adding medical history:", error);
    return { success: false };
  }
}
