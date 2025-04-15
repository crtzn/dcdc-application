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
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
