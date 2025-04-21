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
  getNextOrthoAppointmentNumber: (patientId: number) =>
    ipcRenderer.invoke("get-next-ortho-appointment-number", patientId),
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
  onPaymentAdded: (callback: () => void) => {
    ipcRenderer.on("payment-added", callback);
    return () => ipcRenderer.removeListener("payment-added", callback);
  },
  onTreatmentRecordUpdated: (callback: () => void) => {
    ipcRenderer.on("treatment-record-updated", callback);
    return () =>
      ipcRenderer.removeListener("treatment-record-updated", callback);
  },
});
