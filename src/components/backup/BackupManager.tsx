// src/components/backup/BackupManager.tsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  Database,
  FileUp,
  FileDown,
  Trash2,
  Settings,
  RefreshCw,
} from "lucide-react";

interface BackupFile {
  filename: string;
  path: string;
  size: number;
  date: Date;
}

interface BackupSettings {
  intervalHours: number;
  maxBackups: number;
  customPath?: string;
  lastBackup: string;
  enabled: boolean;
}

const BackupManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupPath, setBackupPath] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [exportPath, setExportPath] = useState("");
  const [importPath, setImportPath] = useState("");
  const [dbExportPath, setDbExportPath] = useState("");
  const [dbImportPath, setDbImportPath] = useState("");
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    intervalHours: 24,
    maxBackups: 7,
    lastBackup: new Date().toISOString(),
    enabled: true,
  });
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isImportingDb, setIsImportingDb] = useState(false);

  // Load backups when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadBackups();
      loadBackupSettings();

      // Check if the new functions are available
      if (
        typeof window.api.exportDatabaseFile !== "function" ||
        typeof window.api.importDatabaseFile !== "function"
      ) {
        toast.info(
          "Some backup features require a restart. Please restart the application to enable all features.",
          { duration: 5000 }
        );
      }
    }
  }, [isOpen]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const result = await window.api.listBackups(customPath || undefined);
      if (result.success && result.backups) {
        setBackups(result.backups);
      } else {
        toast.error(result.error || "Failed to load backups");
      }
    } catch (error) {
      toast.error("Error loading backups");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBackupSettings = async () => {
    try {
      const settings = await window.api.getBackupSettings();
      if (settings) {
        setBackupSettings(settings);
        if (settings.customPath) {
          setCustomPath(settings.customPath);
          setBackupPath(settings.customPath); // Also set backupPath for the Create Backup tab
        }
      }
    } catch (error) {
      console.error("Error loading backup settings:", error);
    }
  };

  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const result = await window.api.createBackup(backupPath || undefined);
      if (result.success) {
        toast.success("Backup created successfully");

        // Apply maximum backups limit after creating a new backup
        if (backupSettings.maxBackups > 0) {
          const backupDir = backupPath || customPath || undefined;
          const listResult = await window.api.listBackups(backupDir);

          if (
            listResult.success &&
            listResult.backups &&
            listResult.backups.length > backupSettings.maxBackups
          ) {
            // Delete oldest backups to maintain max count
            const backupsToDelete = listResult.backups.slice(
              backupSettings.maxBackups
            );

            for (const backup of backupsToDelete) {
              await window.api.deleteBackup(backup.path);
            }

            toast.info(
              `Removed ${backupsToDelete.length} old backup(s) to maintain limit of ${backupSettings.maxBackups}`
            );
          }
        }

        loadBackups();
      } else {
        toast.error(result.error || "Failed to create backup");
      }
    } catch (error) {
      toast.error("Error creating backup");
      console.error(error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) {
      toast.error("Please select a backup to restore");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to restore this backup? This will replace your current database."
      )
    ) {
      return;
    }

    try {
      setIsRestoringBackup(true);
      const result = await window.api.restoreFromBackup(selectedBackup);
      if (result.success) {
        toast.success("Backup restored successfully");
        setSelectedBackup(null);
      } else {
        toast.error(result.error || "Failed to restore backup");
      }
    } catch (error) {
      toast.error("Error restoring backup");
      console.error(error);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const deleteBackup = async (backupPath: string) => {
    if (!window.confirm("Are you sure you want to delete this backup?")) {
      return;
    }

    try {
      const result = await window.api.deleteBackup(backupPath);
      if (result.success) {
        toast.success("Backup deleted successfully");
        loadBackups();
        if (selectedBackup === backupPath) {
          setSelectedBackup(null);
        }
      } else {
        toast.error(result.error || "Failed to delete backup");
      }
    } catch (error) {
      toast.error("Error deleting backup");
      console.error(error);
    }
  };

  const exportDatabase = async () => {
    try {
      setIsExporting(true);
      const result = await window.api.exportDatabaseToJson(
        exportPath || undefined
      );
      if (result.success) {
        toast.success(`Database exported successfully to ${result.filePath}`);
      } else {
        toast.error(result.error || "Failed to export database");
      }
    } catch (error) {
      toast.error("Error exporting database");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const importDatabase = async () => {
    if (!importPath) {
      toast.error("Please select a JSON file to import");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to import this database? This will replace your current data."
      )
    ) {
      return;
    }

    try {
      setIsImporting(true);
      const result = await window.api.importDatabaseFromJson(importPath);
      if (result.success) {
        toast.success("Database imported successfully");
      } else {
        toast.error(result.error || "Failed to import database");
      }
    } catch (error) {
      toast.error("Error importing database");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const exportDatabaseFile = async () => {
    if (!dbExportPath) {
      toast.error("Please select a location to save the database file");
      return;
    }

    // Check if the function exists
    if (typeof window.api.exportDatabaseFile !== "function") {
      toast.error(
        "Database file export is not available. Please restart the application."
      );
      return;
    }

    try {
      setIsExportingDb(true);
      const result = await window.api.exportDatabaseFile(dbExportPath);
      if (result.success) {
        toast.success(
          `Database file exported successfully to ${result.filePath}`
        );
      } else {
        toast.error(result.error || "Failed to export database file");
      }
    } catch (error) {
      toast.error("Error exporting database file");
      console.error(error);
    } finally {
      setIsExportingDb(false);
    }
  };

  const importDatabaseFile = async () => {
    if (!dbImportPath) {
      toast.error("Please select a database file to import");
      return;
    }

    // Check if the function exists
    if (typeof window.api.importDatabaseFile !== "function") {
      toast.error(
        "Database file import is not available. Please restart the application."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to import this database file? This will replace your current database."
      )
    ) {
      return;
    }

    try {
      setIsImportingDb(true);
      const result = await window.api.importDatabaseFile(dbImportPath);
      if (result.success) {
        toast.success("Database file imported successfully");
      } else {
        toast.error(result.error || "Failed to import database file");
      }
    } catch (error) {
      toast.error("Error importing database file");
      console.error(error);
    } finally {
      setIsImportingDb(false);
    }
  };

  const saveBackupSettings = async () => {
    try {
      const result = await window.api.setupAutomaticBackups(
        backupSettings.intervalHours,
        backupSettings.maxBackups,
        customPath || undefined
      );

      if (result.success) {
        toast.success("Backup settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save backup settings");
      }
    } catch (error) {
      toast.error("Error saving backup settings");
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleBrowseBackupPath = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (result && result.filePaths && result.filePaths.length > 0) {
        setBackupPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const handleBrowseCustomPath = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (result && result.filePaths && result.filePaths.length > 0) {
        setCustomPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const handleBrowseExportPath = async () => {
    try {
      const result = await window.api.selectSaveFilePath({
        title: "Save Database Export",
        defaultPath: "clinic_export.json",
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });
      if (result && result.filePath) {
        setExportPath(result.filePath);
      }
    } catch (error) {
      console.error("Error selecting save file path:", error);
    }
  };

  const handleBrowseImportPath = async () => {
    try {
      const result = await window.api.selectFile({
        title: "Select Database Export File",
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });
      if (result && result.filePaths && result.filePaths.length > 0) {
        setImportPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleBrowseDbExportPath = async () => {
    try {
      const result = await window.api.selectSaveFilePath({
        title: "Save Database File",
        defaultPath: "clinic.db",
        filters: [{ name: "Database Files", extensions: ["db"] }],
      });
      if (result && result.filePath) {
        setDbExportPath(result.filePath);
      }
    } catch (error) {
      console.error("Error selecting save file path:", error);
    }
  };

  const handleBrowseDbImportPath = async () => {
    try {
      const result = await window.api.selectFile({
        title: "Select Database File",
        filters: [{ name: "Database Files", extensions: ["db"] }],
      });
      if (result && result.filePaths && result.filePaths.length > 0) {
        setDbImportPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-[#1e1e1e] text-white hover:bg-[#1e1e1eed] hover:text-white"
        >
          <Database size={16} />
          Backup Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Database Backup Manager</DialogTitle>
          <DialogDescription>
            Manage your database backups to prevent data loss
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backups" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Create Backup</CardTitle>
                <CardDescription>
                  Create a backup of your current database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Backup location (optional)"
                      value={backupPath}
                      onChange={(e) => setBackupPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleBrowseBackupPath}>
                      Browse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    If no location is specified, the backup will be saved in the
                    default location.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={createBackup}
                  disabled={isCreatingBackup}
                  className="flex items-center gap-2"
                >
                  {isCreatingBackup ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Create Backup
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="restore">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Available Backups</CardTitle>
                  <CardDescription>Select a backup to restore</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Custom backup location"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    onClick={handleBrowseCustomPath}
                    className="shrink-0"
                  >
                    Browse
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadBackups}
                    className="shrink-0"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                ) : backups.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No backups found
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Filename</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backups.map((backup) => (
                          <TableRow
                            key={backup.path}
                            className={
                              selectedBackup === backup.path
                                ? "bg-gray-100"
                                : ""
                            }
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedBackup === backup.path}
                                onCheckedChange={() =>
                                  setSelectedBackup(backup.path)
                                }
                              />
                            </TableCell>
                            <TableCell>{backup.filename}</TableCell>
                            <TableCell>
                              {format(backup.date, "PPP p")}
                            </TableCell>
                            <TableCell>{formatFileSize(backup.size)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBackup(backup.path)}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={restoreBackup}
                  disabled={!selectedBackup || isRestoringBackup}
                  className="flex items-center gap-2"
                >
                  {isRestoringBackup ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Database size={16} />
                  )}
                  Restore Selected Backup
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Database as JSON</CardTitle>
                  <CardDescription>
                    Export your database to a JSON file (for data analysis or
                    viewing)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Export location (optional)"
                      value={exportPath}
                      onChange={(e) => setExportPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleBrowseExportPath}>
                      Browse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    If no location is specified, the export will be saved in the
                    default backup location.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={exportDatabase}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileDown size={16} />
                    )}
                    Export as JSON
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Export Database File
                    {typeof window.api.exportDatabaseFile !== "function" && (
                      <span className="text-xs text-amber-500 font-normal">
                        (Restart required)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Export your database as a .db file (for direct backup)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Select location to save database file"
                      value={dbExportPath}
                      onChange={(e) => setDbExportPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleBrowseDbExportPath}
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This exports the actual database file (clinic.db) which can
                    be directly imported later.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={exportDatabaseFile}
                    disabled={
                      !dbExportPath ||
                      isExportingDb ||
                      typeof window.api.exportDatabaseFile !== "function"
                    }
                    className="flex items-center gap-2"
                    title={
                      typeof window.api.exportDatabaseFile !== "function"
                        ? "Please restart the application to enable this feature"
                        : ""
                    }
                  >
                    {isExportingDb ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Database size={16} />
                    )}
                    Export Database File
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Import Database from JSON</CardTitle>
                  <CardDescription>
                    Import a database from a JSON file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Select JSON file to import"
                      value={importPath}
                      onChange={(e) => setImportPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleBrowseImportPath}>
                      Browse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Warning: Importing will replace your current database. Make
                    sure to create a backup first.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={importDatabase}
                    disabled={!importPath || isImporting}
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileUp size={16} />
                    )}
                    Import from JSON
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Import Database File
                    {typeof window.api.importDatabaseFile !== "function" && (
                      <span className="text-xs text-amber-500 font-normal">
                        (Restart required)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Import a database from a .db file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Select database file to import"
                      value={dbImportPath}
                      onChange={(e) => setDbImportPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleBrowseDbImportPath}
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Warning: Importing will replace your current database. This
                    is for importing a previously exported database file
                    (clinic.db).
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={importDatabaseFile}
                    disabled={
                      !dbImportPath ||
                      isImportingDb ||
                      typeof window.api.importDatabaseFile !== "function"
                    }
                    className="flex items-center gap-2"
                    title={
                      typeof window.api.importDatabaseFile !== "function"
                        ? "Please restart the application to enable this feature"
                        : ""
                    }
                  >
                    {isImportingDb ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Database size={16} />
                    )}
                    Import Database File
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Backup Settings</CardTitle>
                <CardDescription>
                  Configure automatic database backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-backup-enabled"
                      checked={backupSettings.enabled}
                      onCheckedChange={(checked) =>
                        setBackupSettings({
                          ...backupSettings,
                          enabled: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="auto-backup-enabled">
                      Enable automatic backups
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="backup-interval">
                        Backup Interval (hours)
                      </Label>
                      <Select
                        value={backupSettings.intervalHours.toString()}
                        onValueChange={(value) =>
                          setBackupSettings({
                            ...backupSettings,
                            intervalHours: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger id="backup-interval">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">Every 6 hours</SelectItem>
                          <SelectItem value="12">Every 12 hours</SelectItem>
                          <SelectItem value="24">Every 24 hours</SelectItem>
                          <SelectItem value="48">Every 2 days</SelectItem>
                          <SelectItem value="168">Every week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="max-backups">
                        Maximum Backups to Keep
                      </Label>
                      <Select
                        value={backupSettings.maxBackups.toString()}
                        onValueChange={(value) =>
                          setBackupSettings({
                            ...backupSettings,
                            maxBackups: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger id="max-backups">
                          <SelectValue placeholder="Select max backups" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 backups</SelectItem>
                          <SelectItem value="5">5 backups</SelectItem>
                          <SelectItem value="7">7 backups</SelectItem>
                          <SelectItem value="10">10 backups</SelectItem>
                          <SelectItem value="14">14 backups</SelectItem>
                          <SelectItem value="30">30 backups</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="custom-backup-path">
                      Custom Backup Location (optional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="custom-backup-path"
                        placeholder="Custom backup location"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleBrowseCustomPath}
                      >
                        Browse
                      </Button>
                    </div>
                  </div>

                  {backupSettings.lastBackup && (
                    <p className="text-sm text-gray-500">
                      Last automatic backup:{" "}
                      {format(new Date(backupSettings.lastBackup), "PPP p")}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveBackupSettings}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BackupManager;
