import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import {
  addPatient,
  addTreatmentRecord,
  addMedicalHistory,
} from "./models/tstmgr.js";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "./types/RegularPatient.js";

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
