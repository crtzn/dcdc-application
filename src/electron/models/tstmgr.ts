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
  PaymentHistory,
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
        registration_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
        registration_date TEXT,
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
        gingival_tissues TEXT,
        treatment_status TEXT DEFAULT 'Not Started',
        current_contract_price REAL,
        current_contract_months INTEGER,
        current_balance REAL,
        treatment_cycle INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orthodontic_treatment_records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orthodontic_treatment_records (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        treatment_cycle INTEGER DEFAULT 1,
        appt_no TEXT,
        date TEXT,
        arch_wire TEXT,
        procedure TEXT,
        appliances TEXT,
        contract_price REAL,
        contract_months INTEGER,
        amount_paid REAL,
        next_schedule TEXT,
        mode_of_payment TEXT,
        balance REAL,
        FOREIGN KEY (patient_id) REFERENCES orthodontic_patients(patient_id)
      )
    `);

    // Create payment_history table
    db.exec(`
      CREATE TABLE IF NOT EXISTS payment_history (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        treatment_record_id INTEGER,
        patient_type TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        payment_method TEXT NOT NULL,
        remaining_balance REAL NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
    // Trim the patient name to avoid whitespace issues
    const trimmedName = patient.name.trim();

    if (checkRegularPatientNameExists(trimmedName)) {
      return {
        success: false,
        error: `A patient named "${trimmedName}" already exists.`,
      };
    }
    const stmt = db.prepare(`
      INSERT INTO regular_patients (
        name, birthday, religion, home_address, sex, age, nationality, cellphone_number, registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      trimmedName, // Use trimmed name
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
    const stmt = db.prepare(
      "SELECT 1 FROM regular_patients WHERE LOWER(name) = LOWER(?)"
    );
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
        registration_date, name, occupation, birthday, parent_guardian_name, address,
        telephone_home, telephone_business, cellphone_number, email, chart, sex, age,
        chief_complaint, past_medical_dental_history, prior_orthodontic_history,
        under_treatment_or_medication, congenital_abnormalities, temporomandibular_joint_problems,
        oral_hygiene, gingival_tissues, treatment_status, current_contract_price,
        current_contract_months, current_balance, treatment_cycle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      patient.registration_date || null,
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
      patient.gingival_tissues || null,
      patient.treatment_status || "Not Started",
      patient.current_contract_price || null,
      patient.current_contract_months || null,
      patient.current_balance || null,
      patient.treatment_cycle || 1
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
  error?: string; // Added for better error reporting
} {
  try {
    // Begin transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Insert the treatment record
      const stmt = db.prepare(`
        INSERT INTO orthodontic_treatment_records (
          patient_id, treatment_cycle, appt_no, date, arch_wire, procedure, appliances,
          contract_price, contract_months, amount_paid, mode_of_payment, next_schedule, balance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Calculate balance for this record
      let balance = 0;

      // If this is the first appointment with contract details, set initial balance
      if (record.appt_no === "1" && record.contract_price) {
        balance = record.contract_price - (record.amount_paid || 0);
      } else {
        // For subsequent appointments, get current balance from patient record
        const getBalanceStmt = db.prepare(`
          SELECT current_balance FROM orthodontic_patients
          WHERE patient_id = ?
        `);

        const balanceResult = getBalanceStmt.get(record.patient_id) as
          | { current_balance: number }
          | undefined;

        if (
          balanceResult &&
          balanceResult.current_balance !== null &&
          balanceResult.current_balance !== undefined
        ) {
          balance = Math.max(
            0,
            balanceResult.current_balance - (record.amount_paid || 0)
          );
        }
      }

      stmt.run(
        record.patient_id,
        record.treatment_cycle || 1,
        record.appt_no || null,
        record.date || null,
        record.arch_wire || null,
        record.procedure || null,
        record.appliances || null,
        record.contract_price || null,
        record.contract_months || null,
        record.amount_paid || null,
        record.mode_of_payment || null,
        record.next_schedule || null,
        balance
      );

      // Check if this is the first appointment (appt_no = 1) and has contract details
      if (record.appt_no === "1" && record.contract_price) {
        // Update the patient's treatment status and contract details
        const updatePatientStmt = db.prepare(`
          UPDATE orthodontic_patients
          SET treatment_status = 'In Progress',
              current_contract_price = ?,
              current_contract_months = ?,
              current_balance = ?
          WHERE patient_id = ?
        `);

        // Calculate initial balance
        const initialBalance =
          record.contract_price - (record.amount_paid || 0);

        updatePatientStmt.run(
          record.contract_price,
          record.contract_months || null,
          initialBalance,
          record.patient_id
        );
      } else {
        // For subsequent appointments
        const getPatientStmt = db.prepare(`
          SELECT current_balance, current_contract_months, treatment_cycle
          FROM orthodontic_patients
          WHERE patient_id = ?
        `);

        const patientData = getPatientStmt.get(record.patient_id) as
          | {
              current_balance: number;
              current_contract_months: number;
              treatment_cycle: number;
            }
          | undefined;

        // Update balance if payment was made
        if (
          record.amount_paid &&
          patientData &&
          patientData.current_balance !== null &&
          patientData.current_balance !== undefined
        ) {
          const newBalance = Math.max(
            0,
            patientData.current_balance - record.amount_paid
          );

          const updateBalanceStmt = db.prepare(`
            UPDATE orthodontic_patients
            SET current_balance = ?
            WHERE patient_id = ?
          `);

          updateBalanceStmt.run(newBalance, record.patient_id);
        }

        // Check if this appointment completes the treatment
        // Note: Contract duration starts from appointment #2, with #1 being the initial consultation
        // So treatment is complete when appointment count reaches (contract_months + 1)
        if (patientData && patientData.current_contract_months) {
          // Get the highest appointment number in this treatment cycle
          const maxApptStmt = db.prepare(`
            SELECT MAX(CAST(appt_no AS INTEGER)) as max_appt_no
            FROM orthodontic_treatment_records
            WHERE patient_id = ? AND treatment_cycle = ?
          `);

          const maxApptResult = maxApptStmt.get(
            record.patient_id,
            record.treatment_cycle || patientData.treatment_cycle
          ) as { max_appt_no: number } | undefined;

          // If the highest appointment number is equal to or greater than (contract_months + 1),
          // mark the treatment as completed
          if (
            maxApptResult &&
            maxApptResult.max_appt_no !== null &&
            maxApptResult.max_appt_no >= patientData.current_contract_months + 1
          ) {
            const updateStatusStmt = db.prepare(`
              UPDATE orthodontic_patients
              SET treatment_status = 'Completed'
              WHERE patient_id = ?
            `);

            updateStatusStmt.run(record.patient_id);
          }
        }
      }

      // Commit the transaction
      db.prepare("COMMIT").run();

      return { success: true };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error adding orthodontic treatment record:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
// Check if orthodontic patient name exists
export function checkOrthoPatientNameExists(name: string): boolean {
  try {
    const stmt = db.prepare(
      "SELECT 1 FROM orthodontic_patients WHERE LOWER(name) = LOWER(?)"
    );
    return stmt.get(name) !== undefined;
  } catch (error) {
    console.error("Error checking ortho patient name:", error);
    return false;
  }
}

export function getAllOrthodonticPatients(): {
  success: boolean;
  total_count?: number;
  error?: string;
} {
  try {
    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM orthodontic_patients`
    );
    const result = countStmt.get() as { total: number };
    const total_count = result.total;

    console.log(`Total orthodontic patients: ${total_count}`);

    return {
      success: true,
      total_count,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching orthodontic patients count:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// New getAllPatients
export function getAllPatients(): {
  success: boolean;
  total_count?: number;
  error?: string;
} {
  try {
    // Query both tables and sum the counts
    const regularStmt = db.prepare(
      `SELECT COUNT(*) as total FROM regular_patients`
    );
    const orthoStmt = db.prepare(
      `SELECT COUNT(*) as total FROM orthodontic_patients`
    );
    const regularResult = regularStmt.get() as { total: number };
    const orthoResult = orthoStmt.get() as { total: number };
    const total_count = regularResult.total + orthoResult.total;

    console.log(`Total overall patients: ${total_count}`);

    return {
      success: true,
      total_count,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching overall patients count:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

//=========

export function getRecentPatients(limit = 5): {
  success: boolean;
  patients?: Array<{
    name: string;
    type: "Regular" | "Ortho";
    sex: string;
    age: number;
    registration_date: string;
  }>;
  error?: string;
} {
  try {
    const query = `
      SELECT name, 'Regular' as type, sex, age, registration_date
      FROM regular_patients
      UNION ALL
      SELECT name, 'Ortho' as type, sex, age, registration_date
      FROM orthodontic_patients
      ORDER BY registration_date DESC
      LIMIT ?
    `;
    const stmt = db.prepare(query);
    const results = stmt.all(limit) as Array<{
      name: string;
      type: "Regular" | "Ortho";
      sex: string;
      age: number;
      registration_date: string;
    }>;

    console.log(`Fetched ${results.length} recent patients`);

    return {
      success: true,
      patients: results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching recent patients:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function getFilteredPatients(
  searchName = "",
  typeFilter = "All",
  genderFilter = "All",
  sortBy = "registration_date",
  sortDirection = "DESC"
): {
  success: boolean;
  patients?: Array<{
    patient_id: number;
    name: string;
    type: "Regular" | "Ortho";
    sex: string;
    age: number;
    registration_date: string;
  }>;
  error?: string;
} {
  try {
    // Build the query with proper filtering for both tables
    let regularQuery = `SELECT patient_id, name, 'Regular' as type, sex, age, registration_date FROM regular_patients WHERE 1=1`;
    let orthoQuery = `SELECT patient_id, name, 'Ortho' as type, sex, age, registration_date FROM orthodontic_patients WHERE 1=1`;

    const params: (string | number)[] = [];
    const orthoParams: (string | number)[] = [];

    // Name filter
    if (searchName) {
      regularQuery += ` AND name LIKE ?`;
      orthoQuery += ` AND name LIKE ?`;
      params.push(`%${searchName}%`);
      orthoParams.push(`%${searchName}%`);
    }

    // Gender filter
    if (genderFilter !== "All") {
      regularQuery += ` AND sex = ?`;
      orthoQuery += ` AND sex = ?`;
      params.push(genderFilter);
      orthoParams.push(genderFilter);
    }

    // Type filter - if type is specified, only include that type in the final query
    let finalQuery;
    if (typeFilter === "Regular") {
      finalQuery = regularQuery;
    } else if (typeFilter === "Ortho") {
      finalQuery = orthoQuery;
      params.length = 0; // Clear regular params
      params.push(...orthoParams); // Use ortho params instead
    } else {
      // If "All" types, combine both queries
      finalQuery = `${regularQuery} UNION ALL ${orthoQuery}`;
      params.push(...orthoParams); // Add ortho params to the end
    }

    // Sorting
    const validSortColumns = [
      "name",
      "type",
      "sex",
      "age",
      "registration_date",
    ];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "registration_date";
    const direction = sortDirection === "ASC" ? "ASC" : "DESC";
    finalQuery += ` ORDER BY ${sortColumn} ${direction}`;

    console.log("Executing query:", finalQuery, "with params:", params);

    const stmt = db.prepare(finalQuery);
    const results = stmt.all(...params) as Array<{
      patient_id: number;
      name: string;
      type: "Regular" | "Ortho";
      sex: string;
      age: number;
      registration_date: string;
    }>;

    console.log(`Fetched ${results.length} patients with filters`);

    return {
      success: true,
      patients: results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching filtered patients:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function getPatientDetails(
  patientId: number,
  type: "Regular" | "Ortho"
): {
  success: boolean;
  patient?: {
    info: RegularPatient | OrthodonticPatient;
    medicalHistory?: RegularMedicalHistory[];
    treatmentRecords?: RegularTreatmentRecord[] | OrthodonticTreatmentRecord[];
    paymentHistory?: PaymentHistory[];
  };
  error?: string;
} {
  try {
    let patientInfo: RegularPatient | OrthodonticPatient;
    let medicalHistory: RegularMedicalHistory[] | undefined;
    let treatmentRecords:
      | RegularTreatmentRecord[]
      | OrthodonticTreatmentRecord[]
      | undefined;
    let paymentHistory: PaymentHistory[] | undefined;

    if (type === "Regular") {
      // Fetch patient info
      const infoStmt = db.prepare(`
        SELECT patient_id, name, birthday, religion, home_address, sex, age,
               nationality, cellphone_number, registration_date, created_at
        FROM regular_patients
        WHERE patient_id = ?
      `);
      const result = infoStmt.get(patientId) as RegularPatient | undefined;

      if (!result) {
        throw new Error("Regular patient not found");
      }
      patientInfo = result;

      // Fetch medical history
      const historyStmt = db.prepare(`
        SELECT history_id, patient_id, general_health, under_medical_treatment,
               medical_condition, serious_illness_or_surgery, illness_or_surgery_details,
               hospitalized, hospitalization_details, taking_medications, medications_list,
               uses_tobacco, list_of_allergies, bleeding_time, is_pregnant, is_nursing,
               taking_birth_control, blood_type, blood_pressure, selected_conditions
        FROM regular_medical_history
        WHERE patient_id = ?
      `);
      medicalHistory = historyStmt.all(patientId) as RegularMedicalHistory[];

      // Fetch treatment records
      const recordsStmt = db.prepare(`
        SELECT record_id, patient_id, treatment_date, tooth_number, procedure,
               dentist_name, amount_charged, amount_paid, balance, mode_of_payment, notes
        FROM regular_treatment_records
        WHERE patient_id = ?
        ORDER BY treatment_date DESC
      `);
      treatmentRecords = recordsStmt.all(patientId) as RegularTreatmentRecord[];

      // Fetch payment history
      const paymentStmt = db.prepare(`
        SELECT payment_id, patient_id, treatment_record_id, patient_type, payment_date,
               amount_paid, payment_method, remaining_balance, notes, created_at
        FROM payment_history
        WHERE patient_id = ? AND patient_type = 'Regular'
        ORDER BY payment_date DESC, created_at DESC
      `);
      paymentHistory = paymentStmt.all(patientId) as PaymentHistory[];
    } else if (type === "Ortho") {
      // Fetch patient info
      const infoStmt = db.prepare(`
        SELECT patient_id, registration_date, name, occupation, birthday, parent_guardian_name,
               address, telephone_home, telephone_business, cellphone_number, email,
               chart, sex, age, chief_complaint, past_medical_dental_history,
               prior_orthodontic_history, under_treatment_or_medication,
               congenital_abnormalities, temporomandibular_joint_problems,
               oral_hygiene, gingival_tissues, treatment_status, current_contract_price,
               current_contract_months, current_balance, treatment_cycle, created_at
        FROM orthodontic_patients
        WHERE patient_id = ?
      `);
      const result = infoStmt.get(patientId) as OrthodonticPatient | undefined;

      if (!result) {
        throw new Error("Orthodontic patient not found");
      }
      patientInfo = result;

      // Fetch treatment records
      const recordsStmt = db.prepare(`
        SELECT record_id, patient_id, treatment_cycle, appt_no, date, arch_wire, procedure, appliances,
               contract_price, contract_months, amount_paid, mode_of_payment, next_schedule, balance
        FROM orthodontic_treatment_records
        WHERE patient_id = ?
        ORDER BY date DESC
      `);
      treatmentRecords = recordsStmt.all(
        patientId
      ) as OrthodonticTreatmentRecord[];

      // Fetch payment history for orthodontic patients
      const paymentStmt = db.prepare(`
        SELECT payment_id, patient_id, treatment_record_id, patient_type, payment_date,
               amount_paid, payment_method, remaining_balance, notes, created_at
        FROM payment_history
        WHERE patient_id = ? AND patient_type = 'Ortho'
        ORDER BY payment_date DESC, created_at DESC
      `);
      paymentHistory = paymentStmt.all(patientId) as PaymentHistory[];
    } else {
      throw new Error("Invalid patient type");
    }

    console.log(`Fetched details for patient ID ${patientId} (${type})`);

    return {
      success: true,
      patient: {
        info: patientInfo,
        medicalHistory,
        treatmentRecords,
        paymentHistory,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching patient details:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Add payment history record
export function addPaymentHistory(
  payment: Omit<PaymentHistory, "payment_id" | "created_at">
): {
  success: boolean;
  payment_id?: number;
  error?: string;
} {
  try {
    // Begin transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Insert payment history record
      const stmt = db.prepare(`
        INSERT INTO payment_history (
          patient_id, treatment_record_id, patient_type, payment_date, amount_paid,
          payment_method, remaining_balance, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        payment.patient_id,
        payment.treatment_record_id || null,
        payment.patient_type,
        payment.payment_date,
        payment.amount_paid,
        payment.payment_method,
        payment.remaining_balance,
        payment.notes || null
      );

      // If this is an orthodontic patient, update their current balance
      if (payment.patient_type === "Ortho") {
        const updateBalanceStmt = db.prepare(`
          UPDATE orthodontic_patients
          SET current_balance = ?
          WHERE patient_id = ?
        `);

        updateBalanceStmt.run(payment.remaining_balance, payment.patient_id);

        // Note: We don't automatically mark the treatment as completed here
        // Treatment completion is based on appointment count reaching contract months
        // This is handled in the addOrthodonticTreatmentRecord function
      }

      // Commit the transaction
      db.prepare("COMMIT").run();

      return {
        success: true,
        payment_id: Number(result.lastInsertRowid),
      };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    console.error("Error adding payment history:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get payment history for a patient
export function getPaymentHistory(patientId: number): {
  success: boolean;
  payments?: PaymentHistory[];
  error?: string;
} {
  try {
    const stmt = db.prepare(`
      SELECT payment_id, patient_id, treatment_record_id, payment_date,
             amount_paid, payment_method, remaining_balance, notes, created_at
      FROM payment_history
      WHERE patient_id = ?
      ORDER BY payment_date DESC, created_at DESC
    `);

    const payments = stmt.all(patientId) as PaymentHistory[];

    return {
      success: true,
      payments,
    };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Update treatment record balance
export function updateTreatmentRecordBalance(
  recordId: number,
  newBalance: number
): {
  success: boolean;
  error?: string;
} {
  try {
    const stmt = db.prepare(`
      UPDATE regular_treatment_records
      SET balance = ?
      WHERE record_id = ?
    `);

    stmt.run(newBalance, recordId);

    return { success: true };
  } catch (error) {
    console.error("Error updating treatment record balance:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Update regular patient information
export function updateRegularPatient(
  patient_id: number,
  patient: Partial<Omit<RegularPatient, "patient_id">>
): {
  success: boolean;
  error?: string;
} {
  try {
    const fields = Object.keys(patient)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(patient);
    if (!fields) {
      return { success: false, error: "No fields to update" };
    }
    const stmt = db.prepare(`
      UPDATE regular_patients
      SET ${fields}
      WHERE patient_id = ?
    `);
    stmt.run(...values, patient_id);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating regular patient:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Update orthodontic patient information
export function updateOrthodonticPatient(
  patient_id: number,
  patient: Partial<Omit<OrthodonticPatient, "patient_id">>
): {
  success: boolean;
  error?: string;
} {
  try {
    const fields = Object.keys(patient)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(patient);
    if (!fields) {
      return { success: false, error: "No fields to update" };
    }
    const stmt = db.prepare(`
      UPDATE orthodontic_patients
      SET ${fields}
      WHERE patient_id = ?
    `);
    stmt.run(...values, patient_id);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating orthodontic patient:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Update medical history (for regular patients)

export function updateMedicalHistory(
  history_id: number,
  history: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
): {
  success: boolean;
  error?: string;
} {
  try {
    const fields = Object.keys(history)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(history);
    if (!fields) {
      return { success: false, error: "No fields to update" };
    }
    const stmt = db.prepare(`
      UPDATE regular_medical_history
      SET ${fields}
      WHERE history_id = ?
    `);
    stmt.run(...values, history_id);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating medical history:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Get next appointment number for an orthodontic patient
export function getNextOrthoAppointmentNumber(
  patientId: number,
  treatmentCycle?: number
): {
  success: boolean;
  next_appt_no?: number;
  error?: string;
} {
  try {
    let query = `
      SELECT appt_no
      FROM orthodontic_treatment_records
      WHERE patient_id = ?
    `;

    const params = [patientId];

    // If treatment cycle is specified, filter by it
    if (treatmentCycle !== undefined) {
      query += ` AND treatment_cycle = ?`;
      params.push(treatmentCycle);
    }

    query += ` ORDER BY CAST(appt_no AS INTEGER) DESC LIMIT 1`;

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { appt_no: string } | undefined;

    // If no previous appointments, start with 1, otherwise increment by 1
    const nextApptNo = result ? parseInt(result.appt_no) + 1 : 1;

    console.log(
      `Next appointment number for patient ${patientId}${
        treatmentCycle ? ` (cycle ${treatmentCycle})` : ""
      }: ${nextApptNo}`
    );

    return {
      success: true,
      next_appt_no: nextApptNo,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error getting next appointment number:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Start a new treatment cycle for a returning orthodontic patient
export function startNewOrthodonticTreatmentCycle(
  patientId: number,
  contractPrice?: number,
  contractMonths?: number
): {
  success: boolean;
  new_cycle?: number;
  error?: string;
} {
  try {
    // Begin transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Get the current treatment cycle
      const getCycleStmt = db.prepare(`
        SELECT treatment_cycle FROM orthodontic_patients
        WHERE patient_id = ?
      `);

      const cycleResult = getCycleStmt.get(patientId) as
        | { treatment_cycle: number }
        | undefined;

      if (!cycleResult) {
        throw new Error("Patient not found");
      }

      // Increment the treatment cycle
      const newCycle = (cycleResult.treatment_cycle || 1) + 1;

      // Update the patient record
      const updatePatientStmt = db.prepare(`
        UPDATE orthodontic_patients
        SET treatment_status = 'In Progress',
            treatment_cycle = ?,
            current_contract_price = ?,
            current_contract_months = ?,
            current_balance = ?
        WHERE patient_id = ?
      `);

      updatePatientStmt.run(
        newCycle,
        contractPrice || null,
        contractMonths || null,
        contractPrice || null, // Initial balance is the full contract price
        patientId
      );

      // Commit the transaction
      db.prepare("COMMIT").run();

      return {
        success: true,
        new_cycle: newCycle,
      };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error starting new treatment cycle:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Update orthodontic contract details during treatment
export function updateOrthodonticContractDetails(
  patientId: number,
  contractPrice?: number,
  contractMonths?: number
): {
  success: boolean;
  error?: string;
} {
  try {
    // Begin transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Get current patient details
      const getPatientStmt = db.prepare(`
        SELECT current_contract_price, current_balance, treatment_cycle
        FROM orthodontic_patients
        WHERE patient_id = ?
      `);

      const patientData = getPatientStmt.get(patientId) as
        | {
            current_contract_price: number;
            current_balance: number;
            treatment_cycle: number;
          }
        | undefined;

      if (!patientData) {
        throw new Error("Patient not found");
      }

      // Calculate new balance if contract price is changing
      let newBalance = patientData.current_balance;
      if (
        contractPrice !== undefined &&
        patientData.current_contract_price !== null
      ) {
        // Calculate how much has been paid so far
        const paidSoFar =
          patientData.current_contract_price - patientData.current_balance;
        // New balance is new price minus amount already paid
        newBalance = Math.max(0, contractPrice - paidSoFar);
      }

      // Update the patient record with new contract details
      const updateStmt = db.prepare(`
        UPDATE orthodontic_patients
        SET current_contract_price = COALESCE(?, current_contract_price),
            current_contract_months = COALESCE(?, current_contract_months),
            current_balance = ?
        WHERE patient_id = ?
      `);

      updateStmt.run(
        contractPrice !== undefined ? contractPrice : null,
        contractMonths !== undefined ? contractMonths : null,
        newBalance,
        patientId
      );

      // Also update the first treatment record of the current cycle to reflect the new contract details
      if (contractPrice !== undefined || contractMonths !== undefined) {
        const updateRecordStmt = db.prepare(`
          UPDATE orthodontic_treatment_records
          SET contract_price = COALESCE(?, contract_price),
              contract_months = COALESCE(?, contract_months)
          WHERE patient_id = ? AND treatment_cycle = ? AND appt_no = '1'
        `);

        updateRecordStmt.run(
          contractPrice !== undefined ? contractPrice : null,
          contractMonths !== undefined ? contractMonths : null,
          patientId,
          patientData.treatment_cycle
        );
      }

      // Commit the transaction
      db.prepare("COMMIT").run();

      return { success: true };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating orthodontic contract details:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Delete a regular patient and all associated records
export function deleteRegularPatient(patientId: number): {
  success: boolean;
  error?: string;
} {
  try {
    // Start a transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Delete payment history records
      const deletePaymentHistoryStmt = db.prepare(`
        DELETE FROM payment_history
        WHERE patient_id = ?
      `);
      deletePaymentHistoryStmt.run(patientId);

      // Delete treatment records
      const deleteTreatmentRecordsStmt = db.prepare(`
        DELETE FROM regular_treatment_records
        WHERE patient_id = ?
      `);
      deleteTreatmentRecordsStmt.run(patientId);

      // Delete medical history
      const deleteMedicalHistoryStmt = db.prepare(`
        DELETE FROM regular_medical_history
        WHERE patient_id = ?
      `);
      deleteMedicalHistoryStmt.run(patientId);

      // Finally, delete the patient
      const deletePatientStmt = db.prepare(`
        DELETE FROM regular_patients
        WHERE patient_id = ?
      `);
      const result = deletePatientStmt.run(patientId);

      // Commit the transaction
      db.prepare("COMMIT").run();

      if (result.changes === 0) {
        return { success: false, error: "Patient not found" };
      }

      console.log(
        `Successfully deleted regular patient with ID ${patientId} and all associated records`
      );
      return { success: true };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error deleting regular patient:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Delete an orthodontic patient and all associated records
export function deleteOrthodonticPatient(patientId: number): {
  success: boolean;
  error?: string;
} {
  try {
    // Start a transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Delete treatment records
      const deleteTreatmentRecordsStmt = db.prepare(`
        DELETE FROM orthodontic_treatment_records
        WHERE patient_id = ?
      `);
      deleteTreatmentRecordsStmt.run(patientId);

      // Finally, delete the patient
      const deletePatientStmt = db.prepare(`
        DELETE FROM orthodontic_patients
        WHERE patient_id = ?
      `);
      const result = deletePatientStmt.run(patientId);

      // Commit the transaction
      db.prepare("COMMIT").run();

      if (result.changes === 0) {
        return { success: false, error: "Patient not found" };
      }

      console.log(
        `Successfully deleted orthodontic patient with ID ${patientId} and all associated records`
      );
      return { success: true };
    } catch (error) {
      // If any error occurs, roll back the transaction
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error deleting orthodontic patient:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get monthly patient counts
export function getMonthlyPatientCounts(): {
  success: boolean;
  data?: Array<{ year: number; month: number; count: number }>;
  error?: string;
} {
  try {
    const query = `
      SELECT
        strftime('%Y', registration_date) as year,
        strftime('%m', registration_date) as month,
        COUNT(*) as count
      FROM (
        SELECT registration_date FROM regular_patients
        UNION ALL
        SELECT registration_date FROM orthodontic_patients
      )
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `;
    const stmt = db.prepare(query);
    const results = stmt.all() as Array<{
      year: string;
      month: string;
      count: number;
    }>;

    const data = results.map((row) => ({
      year: parseInt(row.year),
      month: parseInt(row.month),
      count: row.count,
    }));

    console.log(`Fetched monthly patient counts: ${JSON.stringify(data)}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching monthly patient counts:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
