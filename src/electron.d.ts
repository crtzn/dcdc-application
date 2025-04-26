// src/electron.d.ts

import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
  PaymentHistory,
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
      registration_date: string;
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
      registration_date: string;
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
      paymentHistory?: PaymentHistory[];
    };
    error?: string;
  }>;
  updateRegularPatient: (
    patient_id: number,
    patient: Partial<Omit<RegularPatient, "patient_id">>
  ) => Promise<{ success: boolean; error?: string }>;
  updateOrthodonticPatient: (
    patient_id: number,
    patient: Partial<Omit<OrthodonticPatient, "patient_id">>
  ) => Promise<{ success: boolean; error?: string }>;
  updateMedicalHistory: (
    history_id: number,
    history: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => Promise<{ success: boolean; error?: string }>;
  getMonthlyPatientCounts: () => Promise<{
    success: boolean;
    data?: Array<{ year: number; month: number; count: number }>;
    error?: string;
  }>;
  getNextOrthoAppointmentNumber: (
    patientId: number,
    treatmentCycle?: number
  ) => Promise<{
    success: boolean;
    next_appt_no?: number;
    error?: string;
  }>;
  startNewOrthodonticTreatmentCycle: (
    patientId: number,
    contractPrice?: number,
    contractMonths?: number,
    treatmentDate?: string,
    archWire?: string,
    procedure?: string,
    appliances?: string,
    amountPaid?: number,
    modeOfPayment?: string,
    nextSchedule?: string
  ) => Promise<{
    success: boolean;
    new_cycle?: number;
    record_id?: number;
    error?: string;
  }>;
  updateOrthodonticContractDetails: (
    patientId: number,
    contractPrice?: number,
    contractMonths?: number
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onPatientUpdated: (callback: () => void) => () => void;
  onPatientAdded: (callback: () => void) => () => void;

  // Payment history functions
  addPaymentHistory: (
    payment: Omit<PaymentHistory, "payment_id" | "created_at">
  ) => Promise<{ success: boolean; payment_id?: number; error?: string }>;
  getPaymentHistory: (patientId: number) => Promise<{
    success: boolean;
    payments?: PaymentHistory[];
    error?: string;
  }>;
  updateTreatmentRecordBalance: (
    recordId: number,
    newBalance: number
  ) => Promise<{ success: boolean; error?: string }>;
  updateRegularTreatmentRecord: (
    recordId: number,
    record: Partial<Omit<RegularTreatmentRecord, "record_id" | "patient_id">>
  ) => Promise<{ success: boolean; error?: string }>;
  updateOrthodonticTreatmentRecord: (
    recordId: number,
    record: Partial<
      Omit<OrthodonticTreatmentRecord, "record_id" | "patient_id">
    >
  ) => Promise<{ success: boolean; error?: string }>;
  onPaymentAdded: (callback: () => void) => () => void;
  onTreatmentRecordUpdated: (callback: () => void) => () => void;

  // Delete patient functions
  deleteRegularPatient: (
    patientId: number
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOrthodonticPatient: (
    patientId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onPatientDeleted: (callback: () => void) => () => void;

  // Backup system functions
  createBackup: (customPath?: string) => Promise<{
    success: boolean;
    backupPath?: string;
    error?: string;
  }>;
  listBackups: (customPath?: string) => Promise<{
    success: boolean;
    backups?: Array<{
      filename: string;
      path: string;
      size: number;
      date: Date;
    }>;
    error?: string;
  }>;
  restoreFromBackup: (backupPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  deleteBackup: (backupPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  setupAutomaticBackups: (
    intervalHours: number,
    maxBackups: number,
    customPath?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getBackupSettings: () => Promise<{
    intervalHours: number;
    maxBackups: number;
    customPath?: string;
    lastBackup: string;
    enabled: boolean;
  } | null>;
  exportDatabaseToJson: (outputPath?: string) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  importDatabaseFromJson: (jsonFilePath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  exportDatabaseFile: (outputPath: string) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  importDatabaseFile: (importFilePath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // File dialog functions
  selectDirectory: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  } | null>;
  selectFile: (options: any) => Promise<{
    canceled: boolean;
    filePaths: string[];
  } | null>;
  selectSaveFilePath: (options: any) => Promise<{
    canceled: boolean;
    filePath?: string;
  } | null>;

  // Resource path functions
  getLogoPath: () => Promise<string>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
