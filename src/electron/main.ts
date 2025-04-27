import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import fs from "fs";
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
  startNewOrthodonticTreatmentCycle,
  updateOrthodonticContractDetails,
  deleteRegularPatient,
  deleteOrthodonticPatient,
  updateRegularTreatmentRecord,
  updateOrthodonticTreatmentRecord,
} from "./models/tstmgr.js";
import {
  createBackup,
  listBackups,
  restoreFromBackup,
  deleteBackup,
  setupAutomaticBackups,
  performAutomaticBackupIfDue,
  exportDatabaseToJson,
  importDatabaseFromJson,
  exportDatabaseFile,
  importDatabaseFile,
} from "./models/backup.js";
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

// Check for automatic backup on startup
let backupCheckInterval: NodeJS.Timeout | null = null;

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    fullscreen: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
  });

  // Prevent exiting fullscreen mode
  mainWindow.on("leave-full-screen", () => {
    mainWindow.setFullScreen(true);
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
  }

  // Perform automatic backup check on startup
  performAutomaticBackupIfDue();

  // Set up interval to check for automatic backups
  backupCheckInterval = setInterval(() => {
    performAutomaticBackupIfDue();
  }, 60 * 60 * 1000); // Check every hour
});

// Clean up interval on app quit
app.on("quit", () => {
  if (backupCheckInterval) {
    clearInterval(backupCheckInterval);
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
  async (_event, patientId: number, treatmentCycle?: number) => {
    try {
      return await getNextOrthoAppointmentNumber(patientId, treatmentCycle);
    } catch (error) {
      console.error("IPC get-next-ortho-appointment-number error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  "start-new-orthodontic-treatment-cycle",
  async (
    _event,
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
  ) => {
    try {
      const result = await startNewOrthodonticTreatmentCycle(
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
      );
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC start-new-orthodontic-treatment-cycle error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  "update-orthodontic-contract-details",
  async (
    _event,
    patientId: number,
    contractPrice?: number,
    contractMonths?: number
  ) => {
    try {
      const result = await updateOrthodonticContractDetails(
        patientId,
        contractPrice,
        contractMonths
      );
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-orthodontic-contract-details error:", error);
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

// Update regular treatment record
ipcMain.handle(
  "update-regular-treatment-record",
  async (
    _event,
    recordId: number,
    record: Partial<Omit<RegularTreatmentRecord, "record_id" | "patient_id">>
  ) => {
    try {
      const result = await updateRegularTreatmentRecord(recordId, record);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("treatment-record-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-regular-treatment-record error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// Update orthodontic treatment record
ipcMain.handle(
  "update-orthodontic-treatment-record",
  async (
    _event,
    recordId: number,
    record: Partial<
      Omit<OrthodonticTreatmentRecord, "record_id" | "patient_id">
    >
  ) => {
    try {
      const result = await updateOrthodonticTreatmentRecord(recordId, record);
      if (result.success) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("treatment-record-updated");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC update-orthodontic-treatment-record error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// Delete patient handlers
ipcMain.handle("delete-regular-patient", async (_event, patientId: number) => {
  try {
    const result = await deleteRegularPatient(patientId);
    if (result.success) {
      // Broadcast patient-deleted event to all renderer windows
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("patient-deleted");
      });
    }
    return result;
  } catch (error) {
    console.error("IPC delete-regular-patient error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "delete-orthodontic-patient",
  async (_event, patientId: number) => {
    try {
      const result = await deleteOrthodonticPatient(patientId);
      if (result.success) {
        // Broadcast patient-deleted event to all renderer windows
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("patient-deleted");
        });
      }
      return result;
    } catch (error) {
      console.error("IPC delete-orthodontic-patient error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// Backup system handlers
ipcMain.handle("create-backup", async (_event, customPath?: string) => {
  try {
    return await createBackup(customPath);
  } catch (error) {
    console.error("IPC create-backup error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("list-backups", async (_event, customPath?: string) => {
  try {
    return await listBackups(customPath);
  } catch (error) {
    console.error("IPC list-backups error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("restore-from-backup", async (_event, backupPath: string) => {
  try {
    return await restoreFromBackup(backupPath);
  } catch (error) {
    console.error("IPC restore-from-backup error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("delete-backup", async (_event, backupPath: string) => {
  try {
    return await deleteBackup(backupPath);
  } catch (error) {
    console.error("IPC delete-backup error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "setup-automatic-backups",
  async (
    _event,
    intervalHours: number,
    maxBackups: number,
    customPath?: string
  ) => {
    try {
      return await setupAutomaticBackups(intervalHours, maxBackups, customPath);
    } catch (error) {
      console.error("IPC setup-automatic-backups error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle("get-backup-settings", async () => {
  try {
    const settingsPath = path.join(
      app.getPath("userData"),
      "backup_settings.json"
    );
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      return settings;
    }
    return null;
  } catch (error) {
    console.error("IPC get-backup-settings error:", error);
    return null;
  }
});

ipcMain.handle(
  "export-database-to-json",
  async (_event, outputPath?: string) => {
    try {
      return await exportDatabaseToJson(outputPath);
    } catch (error) {
      console.error("IPC export-database-to-json error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  "import-database-from-json",
  async (_event, jsonFilePath: string) => {
    try {
      return await importDatabaseFromJson(jsonFilePath);
    } catch (error) {
      console.error("IPC import-database-from-json error:", error);
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle("export-database-file", async (_event, outputPath: string) => {
  try {
    return await exportDatabaseFile(outputPath);
  } catch (error) {
    console.error("IPC export-database-file error:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "import-database-file",
  async (_event, importFilePath: string) => {
    try {
      return await importDatabaseFile(importFilePath);
    } catch (error) {
      console.error("IPC import-database-file error:", error);
      return { success: false, error: String(error) };
    }
  }
);

// File dialog handlers
ipcMain.handle("select-directory", async () => {
  try {
    return await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Backup Directory",
    });
  } catch (error) {
    console.error("IPC select-directory error:", error);
    return null;
  }
});

ipcMain.handle("select-file", async (_event, options: any) => {
  try {
    return await dialog.showOpenDialog({
      properties: ["openFile"],
      ...options,
    });
  } catch (error) {
    console.error("IPC select-file error:", error);
    return null;
  }
});

ipcMain.handle("select-save-file-path", async (_event, options: any) => {
  try {
    const result = await dialog.showSaveDialog(options);
    return result;
  } catch (error) {
    console.error("IPC select-save-file-path error:", error);
    return null;
  }
});

// Resource path handlers
ipcMain.handle("get-logo-path", () => {
  try {
    // In development mode, use the app directory path
    if (isDev()) {
      return path.join(app.getAppPath(), "desktopIcon.png");
    } else {
      // In production mode, use the resources directory path
      return path.join(process.resourcesPath, "desktopIcon.png");
    }
  } catch (error) {
    console.error("IPC get-logo-path error:", error);
    return "/desktopIcon.png"; // Fallback to the original path
  }
});

// Font path handler
ipcMain.handle("get-font-path", (_event, fontFileName) => {
  try {
    // In development mode, use the app directory path
    if (isDev()) {
      return path.join(app.getAppPath(), "fonts", fontFileName);
    } else {
      // In production mode, use the resources directory path
      return path.join(process.resourcesPath, "fonts", fontFileName);
    }
  } catch (error) {
    console.error("IPC get-font-path error:", error);
    return `/fonts/${fontFileName}`; // Fallback to the original path
  }
});
