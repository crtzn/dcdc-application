// src/electron.d.ts

import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";

interface ElectronAPI {
  addPatient: (
    patient: Omit<RegularPatient, "patient_id">
  ) => Promise<{ success: boolean; patient_id?: number }>;
  addTreatmentRecord: (
    record: RegularTreatmentRecord
  ) => Promise<{ success: boolean }>;
  addMedicalHistory: (
    history: Omit<RegularMedicalHistory, "history_id">
  ) => Promise<{ success: boolean; history_id?: number }>;
  addOrthodonticPatient: (
    patient: Omit<
      OrthodonticPatient,
      "patient_id" | "created_at" | "updated_at"
    >
  ) => Promise<{ success: boolean; patient_id?: number }>;
  addOrthodonticTreatmentRecord: (
    record: Omit<OrthodonticTreatmentRecord, "record_id" | "created_at">
  ) => Promise<{ success: boolean }>;
  checkPatientName: (name: string) => Promise<boolean>;
  checkOrthoPatientName: (name: string) => Promise<boolean>;
  getAllRegularPatients: () => Promise<{
    success: boolean;
    total_count?: number;
    error?: string;
  }>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
