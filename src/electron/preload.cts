const electron = require("electron");
const { ipcRenderer } = electron;
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "./types/OrthodonticPatient.js";
import { getAllRegularPatients } from "./models/tstmgr.js";

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
});
