import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    readPdfs: (folderPath: string) => ipcRenderer.invoke('read-pdfs', folderPath)
});
