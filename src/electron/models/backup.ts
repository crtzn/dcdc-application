// src/electron/models/backup.ts
import { app } from "electron";
import path from "path";
import fs from "fs";
import sqlite from "better-sqlite3";
import { dbPath } from "./tstmgr.js";
import { isDev } from "../util.js";

// Define backup directory paths
export function getBackupDirectories() {
  // Default backup location in app data
  const appDataBackupDir = path.join(app.getPath("userData"), "backups");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(appDataBackupDir)) {
    fs.mkdirSync(appDataBackupDir, { recursive: true });
  }

  return {
    appDataBackupDir,
    customBackupDir: null, // Will be set by user
  };
}

// Create a backup of the database
export function createBackup(customPath?: string): {
  success: boolean;
  backupPath?: string;
  error?: string;
} {
  try {
    // Get the source database path
    const sourcePath = dbPath();

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilename = `clinic_backup_${timestamp}.db`;

    // Determine backup path
    let backupPath;
    if (customPath) {
      // Ensure custom directory exists
      if (!fs.existsSync(customPath)) {
        fs.mkdirSync(customPath, { recursive: true });
      }
      backupPath = path.join(customPath, backupFilename);
    } else {
      // Use default app data backup directory
      const { appDataBackupDir } = getBackupDirectories();
      backupPath = path.join(appDataBackupDir, backupFilename);
    }

    // Create a read stream from the source database
    const sourceDb = fs.createReadStream(sourcePath);

    // Create a write stream to the backup location
    const backupDb = fs.createWriteStream(backupPath);

    // Return a promise that resolves when the backup is complete
    return new Promise((resolve, reject) => {
      sourceDb.pipe(backupDb);

      backupDb.on("finish", () => {
        console.log(`Backup created successfully at: ${backupPath}`);
        resolve({
          success: true,
          backupPath,
        });
      });

      backupDb.on("error", (err) => {
        console.error("Error creating backup:", err);
        reject({
          success: false,
          error: `Backup failed: ${err.message}`,
        });
      });
    });
  } catch (error) {
    console.error("Error in createBackup:", error);
    return {
      success: false,
      error: `Backup failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// List all available backups
export function listBackups(customPath?: string): {
  success: boolean;
  backups?: Array<{
    filename: string;
    path: string;
    size: number;
    date: Date;
  }>;
  error?: string;
} {
  try {
    // Determine which directory to scan
    let backupDir;
    if (customPath && fs.existsSync(customPath)) {
      backupDir = customPath;
    } else {
      const { appDataBackupDir } = getBackupDirectories();
      backupDir = appDataBackupDir;
    }

    // Read the directory
    const files = fs.readdirSync(backupDir);

    // Filter for database backup files
    const backupFiles = files.filter(
      (file) => file.startsWith("clinic_backup_") && file.endsWith(".db")
    );

    // Get details for each backup file
    const backups = backupFiles.map((filename) => {
      const filePath = path.join(backupDir, filename);
      const stats = fs.statSync(filePath);

      return {
        filename,
        path: filePath,
        size: stats.size,
        date: stats.mtime,
      };
    });

    // Sort by date (newest first)
    backups.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      success: true,
      backups,
    };
  } catch (error) {
    console.error("Error listing backups:", error);
    return {
      success: false,
      error: `Failed to list backups: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Restore from a backup
export function restoreFromBackup(backupPath: string): {
  success: boolean;
  error?: string;
} {
  try {
    // Verify the backup file exists
    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        error: "Backup file does not exist",
      };
    }

    // Get the destination path (current database)
    const destPath = dbPath();

    // Create a backup of the current database before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const { appDataBackupDir } = getBackupDirectories();
    const preRestoreBackupPath = path.join(
      appDataBackupDir,
      `pre_restore_${timestamp}.db`
    );

    // Copy current database to pre-restore backup
    fs.copyFileSync(destPath, preRestoreBackupPath);

    // Copy the backup file to the current database location
    fs.copyFileSync(backupPath, destPath);

    console.log(`Database restored from backup: ${backupPath}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error restoring from backup:", error);
    return {
      success: false,
      error: `Restore failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Delete a backup
export function deleteBackup(backupPath: string): {
  success: boolean;
  error?: string;
} {
  try {
    // Verify the backup file exists
    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        error: "Backup file does not exist",
      };
    }

    // Delete the backup file
    fs.unlinkSync(backupPath);

    console.log(`Backup deleted: ${backupPath}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting backup:", error);
    return {
      success: false,
      error: `Delete failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Set up automatic backups
export function setupAutomaticBackups(
  intervalHours: number = 24,
  maxBackups: number = 7,
  customPath?: string
): {
  success: boolean;
  error?: string;
} {
  try {
    // Store backup settings in a JSON file
    const settingsPath = path.join(
      app.getPath("userData"),
      "backup_settings.json"
    );

    const settings = {
      intervalHours,
      maxBackups,
      customPath,
      lastBackup: new Date().toISOString(),
      enabled: true,
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    console.log(
      `Automatic backups configured: every ${intervalHours} hours, keeping ${maxBackups} backups`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error setting up automatic backups:", error);
    return {
      success: false,
      error: `Setup failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Check if automatic backup is due
export function checkAutomaticBackup(): {
  shouldBackup: boolean;
  settings?: {
    intervalHours: number;
    maxBackups: number;
    customPath?: string;
    lastBackup: string;
    enabled: boolean;
  };
} {
  try {
    const settingsPath = path.join(
      app.getPath("userData"),
      "backup_settings.json"
    );

    // If settings don't exist, no automatic backups are configured
    if (!fs.existsSync(settingsPath)) {
      return { shouldBackup: false };
    }

    // Read settings
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

    // If automatic backups are disabled, don't backup
    if (!settings.enabled) {
      return { shouldBackup: false, settings };
    }

    // Check if it's time for a backup
    const lastBackup = new Date(settings.lastBackup);
    const now = new Date();
    const hoursSinceLastBackup =
      (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

    return {
      shouldBackup: hoursSinceLastBackup >= settings.intervalHours,
      settings,
    };
  } catch (error) {
    console.error("Error checking automatic backup:", error);
    return { shouldBackup: false };
  }
}

// Perform automatic backup if due
export async function performAutomaticBackupIfDue(): Promise<void> {
  try {
    const { shouldBackup, settings } = checkAutomaticBackup();

    if (shouldBackup && settings) {
      console.log("Automatic backup is due, performing backup...");

      // Create backup
      const backupResult = await createBackup(settings.customPath);

      if (backupResult.success) {
        // Update last backup time
        settings.lastBackup = new Date().toISOString();
        const settingsPath = path.join(
          app.getPath("userData"),
          "backup_settings.json"
        );
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        // Clean up old backups if needed
        const backupDir =
          settings.customPath || getBackupDirectories().appDataBackupDir;
        const listResult = listBackups(backupDir);

        if (
          listResult.success &&
          listResult.backups &&
          listResult.backups.length > settings.maxBackups
        ) {
          // Delete oldest backups to maintain max count
          const backupsToDelete = listResult.backups.slice(settings.maxBackups);

          for (const backup of backupsToDelete) {
            await deleteBackup(backup.path);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in performAutomaticBackupIfDue:", error);
  }
}

// Export database to JSON format
export function exportDatabaseToJson(outputPath?: string): {
  success: boolean;
  filePath?: string;
  error?: string;
} {
  try {
    // Get database path
    const dbFilePath = dbPath();

    // Open database connection
    const db = sqlite(dbFilePath, { readonly: true });

    // Get all tables
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
      )
      .all() as Array<{ name: string }>;

    // Create export object
    const exportData: Record<string, any[]> = {};

    // Export each table
    for (const table of tables) {
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      exportData[table.name] = rows;
    }

    // Determine output path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let exportFilePath;

    if (outputPath) {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      exportFilePath = outputPath;
    } else {
      const { appDataBackupDir } = getBackupDirectories();
      exportFilePath = path.join(
        appDataBackupDir,
        `clinic_export_${timestamp}.json`
      );
    }

    // Write export file
    fs.writeFileSync(exportFilePath, JSON.stringify(exportData, null, 2));

    console.log(`Database exported to JSON: ${exportFilePath}`);

    // Close database connection
    db.close();

    return {
      success: true,
      filePath: exportFilePath,
    };
  } catch (error) {
    console.error("Error exporting database to JSON:", error);
    return {
      success: false,
      error: `Export failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Import database from JSON
export function importDatabaseFromJson(jsonFilePath: string): {
  success: boolean;
  error?: string;
} {
  try {
    // Verify the JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
      return {
        success: false,
        error: "JSON file does not exist",
      };
    }

    // Read the JSON file
    const importData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

    // Get database path
    const dbFilePath = dbPath();

    // Create a backup before import
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const { appDataBackupDir } = getBackupDirectories();
    const preImportBackupPath = path.join(
      appDataBackupDir,
      `pre_import_${timestamp}.db`
    );

    // Copy current database to pre-import backup
    fs.copyFileSync(dbFilePath, preImportBackupPath);

    // Open database connection
    const db = sqlite(dbFilePath);

    // Begin transaction
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Import each table
      for (const [tableName, rows] of Object.entries(importData)) {
        // Skip if no rows
        if (!Array.isArray(rows) || rows.length === 0) continue;

        // Clear existing data
        db.prepare(`DELETE FROM ${tableName}`).run();

        // Get column names from first row
        const columns = Object.keys(rows[0]);

        // Prepare insert statement
        const placeholders = columns.map(() => "?").join(", ");
        const insertStmt = db.prepare(`
          INSERT INTO ${tableName} (${columns.join(", ")})
          VALUES (${placeholders})
        `);

        // Insert rows
        for (const row of rows) {
          const values = columns.map((col) => row[col]);
          insertStmt.run(values);
        }
      }

      // Commit transaction
      db.prepare("COMMIT").run();

      console.log(`Database imported from JSON: ${jsonFilePath}`);

      // Close database connection
      db.close();

      return {
        success: true,
      };
    } catch (error) {
      // Rollback transaction on error
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    console.error("Error importing database from JSON:", error);
    return {
      success: false,
      error: `Import failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Export database file directly
export function exportDatabaseFile(outputPath: string): {
  success: boolean;
  filePath?: string;
  error?: string;
} {
  try {
    // Get the source database path
    const sourcePath = dbPath();

    // Ensure the output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Copy the database file
    fs.copyFileSync(sourcePath, outputPath);

    console.log(`Database file exported to: ${outputPath}`);

    return {
      success: true,
      filePath: outputPath,
    };
  } catch (error) {
    console.error("Error exporting database file:", error);
    return {
      success: false,
      error: `Export failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Import database file directly
export function importDatabaseFile(importFilePath: string): {
  success: boolean;
  error?: string;
} {
  try {
    // Verify the import file exists
    if (!fs.existsSync(importFilePath)) {
      return {
        success: false,
        error: "Database file does not exist",
      };
    }

    // Get the destination database path
    const destPath = dbPath();

    // Create a backup before import
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const { appDataBackupDir } = getBackupDirectories();
    const preImportBackupPath = path.join(
      appDataBackupDir,
      `pre_db_import_${timestamp}.db`
    );

    // Copy current database to pre-import backup
    fs.copyFileSync(destPath, preImportBackupPath);

    // Close any open connections to the database
    // This is a simplified approach - in a real app, you might need to ensure all connections are closed
    try {
      const tempDb = sqlite(destPath);
      tempDb.close();
    } catch (error) {
      console.log("No active connection to close");
    }

    // Copy the import file to the current database location
    fs.copyFileSync(importFilePath, destPath);

    console.log(`Database imported from: ${importFilePath}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error importing database file:", error);
    return {
      success: false,
      error: `Import failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
