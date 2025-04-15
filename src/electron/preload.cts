const electron = require("electron");
const { ipcRenderer } = electron;
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";

electron.contextBridge.exposeInMainWorld("api", {
  addPatient: (patient: Omit<RegularPatient, "patient_id">) =>
    ipcRenderer.invoke("add-patient", patient),
  addTreatmentRecord: (record: RegularTreatmentRecord) =>
    ipcRenderer.invoke("add-treatment-record", record),
  addMedicalHistory: (history: Omit<RegularMedicalHistory, "history_id">) =>
    ipcRenderer.invoke("add-medical-history", history),
});
