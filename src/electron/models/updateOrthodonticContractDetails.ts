// src/models/tstmgr.ts
import { app } from "electron";
import path from "path";
import sqlite from "better-sqlite3";
// import fs from "fs";
import { isDev } from "../util.js";

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
