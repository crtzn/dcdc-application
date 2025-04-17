import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import {
  addPatient,
  addTreatmentRecord,
  addMedicalHistory,
  addOrthodonticPatient,
  addOrthodonticTreatmentRecord,
  checkRegularPatientNameExists,
  checkOrthoPatientNameExists,
  getAllRegularPatients,
} from "./models/tstmgr.js";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "./types/OrthodonticPatient.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
  }
});

// IPC Handlers
ipcMain.handle(
  "add-patient",
  async (_event, patient: Omit<RegularPatient, "patient_id">) => {
    try {
      return await addPatient(patient);
    } catch (error) {
      console.error("IPC add-patient error:", error);
      return { success: false };
    }
  }
);

ipcMain.handle(
  "add-treatment-record",
  async (_event, record: RegularTreatmentRecord) => {
    try {
      return await addTreatmentRecord(record);
    } catch (error) {
      console.error("IPC add-treatment-record error:", error);
      return { success: false };
    }
  }
);

ipcMain.handle(
  "add-medical-history",
  async (_event, history: Omit<RegularMedicalHistory, "history_id">) => {
    try {
      return await addMedicalHistory(history);
    } catch (error) {
      console.error("IPC add-medical-history error:", error);
      return { success: false };
    }
  }
);

ipcMain.handle("get-all-regular-patients", async () => {
  try {
    return await getAllRegularPatients();
  } catch (error) {
    console.error("IPC get-all-regular-patients error:", error);
    return { success: false, error: String(error) };
  }
});

// ====== ORTHODONTIC PATIENTS ======

ipcMain.handle(
  "add-orthodontic-patient",
  async (
    _event,
    patient: Omit<
      OrthodonticPatient,
      "patient_id" | "created_at" | "updated_at"
    >
  ) => {
    try {
      return await addOrthodonticPatient(patient);
    } catch (error) {
      console.error("IPC add-orthodontic-patient error:", error);
      return { success: false };
    }
  }
);

ipcMain.handle(
  "add-orthodontic-treatment-record",
  async (
    _event,
    record: Omit<OrthodonticTreatmentRecord, "record_id" | "created_at">
  ) => {
    try {
      return await addOrthodonticTreatmentRecord(record);
    } catch (error) {
      console.error("IPC add-orthodontic-treatment-record error:", error);
      return { success: false };
    }
  }
);

ipcMain.handle("check-patient-name", async (_event, name: string) => {
  try {
    return await checkRegularPatientNameExists(name);
  } catch (error) {
    console.error("IPC check-patient-name error:", error);
    return false;
  }
});

ipcMain.handle("check-ortho-patient-name", async (_event, name: string) => {
  try {
    return await checkOrthoPatientNameExists(name);
  } catch (error) {
    console.error("IPC check-ortho-patient-name error:", error);
    return false;
  }
});
