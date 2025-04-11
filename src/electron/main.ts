import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { getPatients } from "./models/tstmgr.js";

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

ipcMain.handle("get-patients", () => {
  return getPatients();
});

// import { app, BrowserWindow, ipcMain } from "electron";
// import path from "path";
// import { fileURLToPath } from "url";
// import { isDev } from "./util.js";
// // import { pollResources } from "./resourceManagement.js";
// import Database from "better-sqlite3";

// // Derive __dirname and __filename in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Define the type for the COUNT query result
// interface CountResult {
//   count: number;
// }

// // Define the type for a patient
// interface Patient {
//   id: number;
//   name: string;
// }

// // Initialize the database connection
// const dbPath = path.join(app.getAppPath(), "/clinic.db");
// let db: Database.Database;

// try {
//   db = new Database(dbPath, { verbose: console.log });
//   console.log("Successfully connected to SQLite database:", dbPath);

//   // Insert test data into the patients table (only if the table is empty)
//   const patientCountResult = db
//     .prepare("SELECT COUNT(*) as count FROM patients")
//     .get() as CountResult;
//   const patientCount = patientCountResult.count;
//   if (patientCount === 0) {
//     const insert = db.prepare("INSERT INTO patients (id, name) VALUES (?, ?)");
//     insert.run(1, "John Doe");
//     insert.run(2, "Jane Smith");
//     console.log("Inserted test data into patients table.");
//   }
// } catch (error) {
//   console.error("Failed to connect to SQLite database:", error);
//   app.quit();
// }

// // IPC handler for get-patients
// ipcMain.handle("get-patients", () => {
//   try {
//     const patients = db.prepare("SELECT * FROM patients").all() as Patient[];
//     return patients;
//   } catch (error) {
//     console.error("Error fetching patients via IPC:", error);
//     throw error;
//   }
// });

// app.on("ready", () => {
//   console.log("isDev:", isDev()); // Debug log to confirm the environment
//   const preloadPath = isDev()
//     ? path.join(app.getAppPath(), "electron/preload.cjs") // Dev mode: use source directory
//     : path.join(__dirname, "preload.cjs"); // Production mode: use build output directory
//   console.log("Preload script path:", preloadPath);

//   const mainWindow = new BrowserWindow({
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, "preload.cjs"), // Simplified path
//     },
//   });

//   if (isDev()) {
//     mainWindow.loadURL("http://localhost:5123");
//   } else {
//     mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
//   }

//   mainWindow.webContents.openDevTools(); // Keep this for debugging

//   // Test the database connection by querying the patients table
//   try {
//     const patients = db.prepare("SELECT * FROM patients").all() as Patient[];
//     console.log("Patients in the database:", patients);
//   } catch (error) {
//     console.error("Error querying the patients table:", error);
//   }

//   // pollResources();
// });

// // Close the database connection when the app is quitting
// app.on("window-all-closed", () => {
//   if (db) {
//     db.close();
//     console.log("Database connection closed.");
//   }
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
