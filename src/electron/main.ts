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
  getAllOrthodonticPatients,
  getAllPatients,
  getRecentPatients,
  getFilteredPatients,
  getPatientDetails,
  updateOrthodonticPatient,
  updateMedicalHistory,
  updateRegularPatient,
  getMonthlyPatientCounts,
  addPaymentHistory,
  getPaymentHistory,
  updateTreatmentRecordBalance,
  getNextOrthoAppointmentNumber,
} from "./models/tstmgr.js";
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
// IPC Handlers
ipcMain.handle(
  "add-patient",
  async (_event, patient: Omit<RegularPatient, "patient_id">) => {
    try {
      const result = await addPatient(patient);
      if (result.success) {
        // Broadcast patient-added event to all renderer windows
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-added");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC add-patient error:", error);
      return { success: false, error: String(error) };
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
      const result = await addOrthodonticPatient(patient);
      if (result.success) {
        // Broadcast patient-added event to all renderer windows
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-added");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC add-orthodontic-patient error:", error);
      return { success: false, error: String(error) };
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
  console.log(`Received check-ortho-patient-name for: ${name}`);
  try {
    return await checkOrthoPatientNameExists(name);
  } catch (error) {
    console.error("IPC check-ortho-patient-name error:", error);
    return false;
  }
});

ipcMain.handle("get-all-orthodontic-patients", async () => {
  try {
    return await getAllOrthodonticPatients();
  } catch (error) {
    console.error("IPC get-all-orthodontic-patients error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("get-all-patients", async () => {
  try {
    return await getAllPatients();
  } catch (error) {
    console.error("IPC get-all-patients error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("get-recent-patients", async () => {
  try {
    return await getRecentPatients();
  } catch (error) {
    console.error("IPC get-recent-patients error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "get-filtered-patients",
  async (
    _event,
    searchName,
    typeFilter,
    genderFilter,
    sortBy,
    sortDirection
  ) => {
    try {
      return await getFilteredPatients(
        searchName,
        typeFilter,
        genderFilter,
        sortBy,
        sortDirection
      );
    } catch (error) {
      console.error("IPC get-filtered-patients error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// Register IPC handler for getPatientDetails
ipcMain.handle(
  "get-patient-details",
  async (_event, patientId: number, type: "Regular" | "Ortho") => {
    try {
      const result = getPatientDetails(patientId, type);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }
);

// new handle

ipcMain.handle(
  "update-regular-patient",
  async (
    _event,
    patient_id: number,
    patient: Partial<Omit<RegularPatient, "patient_id">>
  ) => {
    try {
      const result = await updateRegularPatient(patient_id, patient);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-regular-patient error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  "update-orthodontic-patient",
  async (
    _event,
    patient_id: number,
    patient: Partial<Omit<OrthodonticPatient, "patient_id">>
  ) => {
    try {
      const result = await updateOrthodonticPatient(patient_id, patient);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-orthodontic-patient error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  "update-medical-history",
  async (
    _event,
    history_id: number,
    history: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => {
    try {
      return await updateMedicalHistory(history_id, history);
    } catch (error) {
      console.error("IPC update-medical-history error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle("get-monthly-patient-counts", async () => {
  try {
    return await getMonthlyPatientCounts();
  } catch (error) {
    console.error("IPC get-monthly-patient-counts error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "get-next-ortho-appointment-number",
  async (_event, patientId: number) => {
    try {
      return await getNextOrthoAppointmentNumber(patientId);
    } catch (error) {
      console.error("IPC get-next-ortho-appointment-number error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// Payment history handlers
ipcMain.handle(
  "add-payment-history",
  async (
    _event,
    payment: Omit<PaymentHistory, "payment_id" | "created_at">
  ) => {
    try {
      const result = await addPaymentHistory(payment);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("payment-added");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC add-payment-history error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle("get-payment-history", async (_event, patientId: number) => {
  try {
    return await getPaymentHistory(patientId);
  } catch (error) {
    console.error("IPC get-payment-history error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "update-treatment-record-balance",
  async (_event, recordId: number, newBalance: number) => {
    try {
      const result = await updateTreatmentRecordBalance(recordId, newBalance);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("treatment-record-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-treatment-record-balance error:", error);
      return { success: false, error: String(error) };
    }
  }
);
