// src/electron.d.ts

import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";

interface ElectronAPI {
  getAllOrthodonticPatients(): unknown;
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
  getAllOrthodonticPatients: () => Promise<{
    success: boolean;
    total_count?: number;
    error?: string;
  }>;
  getAllPatients: () => Promise<{
    success: boolean;
    total_count?: number;
    error?: string;
  }>;
  getRecentPatients: () => Promise<{
    success: boolean;
    patients?: Array<{
      name: string;
      type: "Regular" | "Ortho";
      sex: string;
      age: number;
      created_at: string;
    }>;
    error?: string;
  }>;
  getFilteredPatients: (
    searchName: string,
    typeFilter: string,
    genderFilter: string,
    sortBy: string,
    sortDirection: string
  ) => Promise<{
    success: boolean;
    patients?: Array<{
      patient_id: number;
      name: string;
      type: "Regular" | "Ortho";
      sex: string;
      age: number;
      created_at: string;
    }>;
    error?: string;
  }>;
  getPatientDetails: (
    patientId: number,
    type: "Regular" | "Ortho"
  ) => Promise<{
    success: boolean;
    patient?: {
      info: RegularPatient | OrthodonticPatient;
      medicalHistory?: RegularMedicalHistory[];
      treatmentRecords?:
        | RegularTreatmentRecord[]
        | OrthodonticTreatmentRecord[];
    };
    error?: string;
  }>;
  onPatientAdded: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
