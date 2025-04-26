const electron = require("electron");
const { ipcRenderer } = electron;
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
  PaymentHistory,
} from "./types/RegularPatient.js";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "./types/OrthodonticPatient.js";

electron.contextBridge.exposeInMainWorld("api", {
  addPatient: (patient: Omit<RegularPatient, "patient_id">) =>
    ipcRenderer.invoke("add-patient", patient),
  addTreatmentRecord: (record: RegularTreatmentRecord) =>
    ipcRenderer.invoke("add-treatment-record", record),
  addMedicalHistory: (history: Omit<RegularMedicalHistory, "history_id">) =>
    ipcRenderer.invoke("add-medical-history", history),
  addOrthodonticPatient: (
    patient: Omit<
      OrthodonticPatient,
      "patient_id" | "created_at" | "updated_at"
    >
  ) => ipcRenderer.invoke("add-orthodontic-patient", patient),
  addOrthodonticTreatmentRecord: (
    record: Omit<OrthodonticTreatmentRecord, "record_id" | "created_at">
  ) => ipcRenderer.invoke("add-orthodontic-treatment-record", record),
  checkPatientName: (name: string) =>
    ipcRenderer.invoke("check-patient-name", name),
  checkOrthoPatientName: (name: string) =>
    ipcRenderer.invoke("check-ortho-patient-name", name),
  getAllRegularPatients: () => ipcRenderer.invoke("get-all-regular-patients"),
  getAllOrthodonticPatients: () =>
    ipcRenderer.invoke("get-all-orthodontic-patients"),
  getAllPatients: () => ipcRenderer.invoke("get-all-patients"),
  getRecentPatients: () => ipcRenderer.invoke("get-recent-patients"),
  getFilteredPatients: (
    searchName: string,
    typeFilter: string,
    genderFilter: string,
    sortBy: string,
    sortDirection: string
  ) =>
    ipcRenderer.invoke(
      "get-filtered-patients",
      searchName,
      typeFilter,
      genderFilter,
      sortBy,
      sortDirection
    ),
  getPatientDetails: (patientId: number, type: "Regular" | "Ortho") =>
    ipcRenderer.invoke("get-patient-details", patientId, type),
  onPatientAdded: (callback: () => void) => {
    ipcRenderer.on("patient-added", callback);

    // Return cleanup function
    return () => ipcRenderer.removeListener("patient-added", callback);
  },
  updateRegularPatient: (
    patient_id: number,
    patient: Partial<Omit<RegularPatient, "patient_id">>
  ) => ipcRenderer.invoke("update-regular-patient", patient_id, patient),
  updateOrthodonticPatient: (
    patient_id: number,
    patient: Partial<Omit<OrthodonticPatient, "patient_id">>
  ) => ipcRenderer.invoke("update-orthodontic-patient", patient_id, patient),
  updateMedicalHistory: (
    history_id: number,
    history: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => ipcRenderer.invoke("update-medical-history", history_id, history),
  getMonthlyPatientCounts: () =>
    ipcRenderer.invoke("get-monthly-patient-counts"),
  getNextOrthoAppointmentNumber: (patientId: number, treatmentCycle?: number) =>
    ipcRenderer.invoke(
      "get-next-ortho-appointment-number",
      patientId,
      treatmentCycle
    ),
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
  ) =>
    ipcRenderer.invoke(
      "start-new-orthodontic-treatment-cycle",
      patientId,
      contractPrice,
      contractMonths,
      treatmentDate,
      archWire,
      procedure,
      appliances,
      amountPaid,
      modeOfPayment,
      nextSchedule
    ),
  updateOrthodonticContractDetails: (
    patientId: number,
    contractPrice?: number,
    contractMonths?: number
  ) =>
    ipcRenderer.invoke(
      "update-orthodontic-contract-details",
      patientId,
      contractPrice,
      contractMonths
    ),
  onPatientUpdated: (callback: () => void) => {
    ipcRenderer.on("patient-updated", callback);
    return () => ipcRenderer.removeListener("patient-updated", callback);
  },
  // Payment history functions
  addPaymentHistory: (
    payment: Omit<PaymentHistory, "payment_id" | "created_at">
  ) => ipcRenderer.invoke("add-payment-history", payment),
  getPaymentHistory: (patientId: number) =>
    ipcRenderer.invoke("get-payment-history", patientId),
  updateTreatmentRecordBalance: (recordId: number, newBalance: number) =>
    ipcRenderer.invoke("update-treatment-record-balance", recordId, newBalance),
  updateRegularTreatmentRecord: (
    recordId: number,
    record: Partial<Omit<RegularTreatmentRecord, "record_id" | "patient_id">>
  ) => ipcRenderer.invoke("update-regular-treatment-record", recordId, record),
  updateOrthodonticTreatmentRecord: (
    recordId: number,
    record: Partial<
      Omit<OrthodonticTreatmentRecord, "record_id" | "patient_id">
    >
  ) =>
    ipcRenderer.invoke("update-orthodontic-treatment-record", recordId, record),
  onPaymentAdded: (callback: () => void) => {
    ipcRenderer.on("payment-added", callback);
    return () => ipcRenderer.removeListener("payment-added", callback);
  },
  onTreatmentRecordUpdated: (callback: () => void) => {
    ipcRenderer.on("treatment-record-updated", callback);
    return () =>
      ipcRenderer.removeListener("treatment-record-updated", callback);
  },
  // Delete patient functions
  deleteRegularPatient: (patientId: number) =>
    ipcRenderer.invoke("delete-regular-patient", patientId),
  deleteOrthodonticPatient: (patientId: number) =>
    ipcRenderer.invoke("delete-orthodontic-patient", patientId),
  onPatientDeleted: (callback: () => void) => {
    ipcRenderer.on("patient-deleted", callback);
    return () => ipcRenderer.removeListener("patient-deleted", callback);
  },

  // Backup system functions
  createBackup: (customPath?: string) =>
    ipcRenderer.invoke("create-backup", customPath),
  listBackups: (customPath?: string) =>
    ipcRenderer.invoke("list-backups", customPath),
  restoreFromBackup: (backupPath: string) =>
    ipcRenderer.invoke("restore-from-backup", backupPath),
  deleteBackup: (backupPath: string) =>
    ipcRenderer.invoke("delete-backup", backupPath),
  setupAutomaticBackups: (
    intervalHours: number,
    maxBackups: number,
    customPath?: string
  ) =>
    ipcRenderer.invoke(
      "setup-automatic-backups",
      intervalHours,
      maxBackups,
      customPath
    ),
  getBackupSettings: () => ipcRenderer.invoke("get-backup-settings"),
  exportDatabaseToJson: (outputPath?: string) =>
    ipcRenderer.invoke("export-database-to-json", outputPath),
  importDatabaseFromJson: (jsonFilePath: string) =>
    ipcRenderer.invoke("import-database-from-json", jsonFilePath),
  exportDatabaseFile: (outputPath: string) =>
    ipcRenderer.invoke("export-database-file", outputPath),
  importDatabaseFile: (importFilePath: string) =>
    ipcRenderer.invoke("import-database-file", importFilePath),

  // File dialog functions
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  selectFile: (options: any) => ipcRenderer.invoke("select-file", options),
  selectSaveFilePath: (options: any) =>
    ipcRenderer.invoke("select-save-file-path", options),

  // Resource path functions
  getLogoPath: () => ipcRenderer.invoke("get-logo-path"),
});
