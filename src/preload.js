const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: () => ipcRenderer.send('open-settings'),
  getFiles: (folderPath, datas) => ipcRenderer.invoke('get-files', folderPath, datas),
  readFile: (folderPath, initPath) => ipcRenderer.invoke('read-file', folderPath, initPath),
  updateFile: (filePath, newContent) => ipcRenderer.invoke('update-file', filePath, newContent),
  getSubdirectories: (folderPath) => ipcRenderer.invoke('get-subdirectories', folderPath),
  getCommitFilesByCommitId: (folderPath, commitId, datas) => ipcRenderer.invoke('get-commitfilesbybommitid', folderPath, commitId, datas),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  showErrorDialog: (options) => ipcRenderer.invoke('show-error-dialog', options),
  copyImg: (options) => ipcRenderer.invoke('copy-img', options),
  pullCode: (options) => ipcRenderer.invoke('pull-code', options),
  discardCode: (options) => ipcRenderer.invoke('discard-code', options),
  getBranchs: (options) => ipcRenderer.invoke('get-branchs', options),
  mergeCode: (options) => ipcRenderer.invoke('merge-code', options),
  checkStaus: (options) => ipcRenderer.invoke('check-staus', options),
  pushCode: (options) => ipcRenderer.invoke('push-code', options),
  compileCode: (options) => ipcRenderer.invoke('compile-code', options),
});