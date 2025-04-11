const electron = require("electron");
const { ipcRenderer } = electron;

electron.contextBridge.exposeInMainWorld("api", {
  getPatients: () => ipcRenderer.invoke("get-patients"),
});
