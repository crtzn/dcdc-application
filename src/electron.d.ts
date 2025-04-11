// src/electron.d.ts

interface Patient {
  id: number;
  name: string;
}

interface ElectronAPI {
  getPatients: () => Promise<Patient[]>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
