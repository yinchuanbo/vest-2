const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { setSettings } = require("./utils/pages")
const { getFiles, getSubdirectories, getCommitFilesByCommitId } = require("./utils/get-commit")
const { readFile, updateFile, copyImg } = require("./utils/get-file-content")
const discardCode = require("./utils/discard-code")
const getBranchs = require("./utils/get-branchs")
const mergeCode = require("./utils/merge-code")
const checkStaus = require("./utils/check-status")
const pushCode = require("./utils/push-code")
const compileCode = require("./utils/compile-code")
const pullCode = require("./utils/pull-code")

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      sandbox: true,
      webSecurity: false,
    }
  });
  mainWindow.loadFile('public/index.html');
}

setSettings({
  mainWindow,
  ipcMain,
  BrowserWindow
})

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-files', async (event, folderPath, datas = {}) => {
  try {
    const files = await getFiles(folderPath, datas);
    return files;
  } catch (error) {
    return error;
  }
});

ipcMain.handle('read-file', async (event, folderPath, initPath) => {
  try {
    const content = await readFile(folderPath, initPath);
    return content;
  } catch (error) {
    return error;
  }
});

ipcMain.handle('update-file', async (event, filePath, newContent) => {
  try {
    await updateFile(filePath, newContent);
    return "success"
  } catch (error) {
    return error;
  }
});

ipcMain.handle('copy-img', (event, options = {}) => {
  try {
    copyImg(options);
    return "success"
  } catch (error) {
    return error;
  }
});

ipcMain.handle('discard-code', async (event, options = {}) => {
  try {
    const res = await discardCode(options);
    return res || "success"
  } catch (error) {
    return error;
  }
});

ipcMain.handle('get-branchs', async (event, options = {}) => {
  try {
    const res = await getBranchs(options);
    return {
      code: 200,
      res
    }
  } catch (error) {
    return error;
  }
});

ipcMain.handle('merge-code', async (event, options = {}) => {
  try {
    const res = await mergeCode(options);
    return res;
  } catch (error) {
    return error;
  }
});

ipcMain.handle('check-staus', async (event, options = {}) => {
  try {
    const res = await checkStaus(options);
    return {
      code: 200,
      res
    }
  } catch (error) {
    return error;
  }
});

ipcMain.handle('push-code', async (event, options = {}) => {
  try {
    const res = await pushCode(options);
    return res
  } catch (error) {
    return error;
  }
});

ipcMain.handle('compile-code', async (event, options = {}) => {
  try {
    const res = await compileCode(options);
    return res
  } catch (error) {
    return error;
  }
});

ipcMain.handle('pull-code', async (event, options = {}) => {
  try {
    await pullCode(options);
    return "success";
  } catch (error) {
    return error;
  }
});

ipcMain.handle('get-subdirectories', (event, folderPath) => {
  try {
    const folders = getSubdirectories(folderPath);
    return folders;
  } catch (error) {
    return error;
  }
});

ipcMain.handle('get-commitfilesbybommitid', async (event, folderPath, commitId, datas = {}) => {
  try {
    const files = await getCommitFilesByCommitId(folderPath, commitId, datas);
    return files;
  } catch (error) {
    return error;
  }
});

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('show-error-dialog', async (event, { type, title, message }) => {
  return dialog.showMessageBox({
    type: type || 'error',
    buttons: ['OK'],
    title: title || 'Default Title',
    message: message || 'Default Message'
  });
});

// console.log("---", process.env.NODE_ENV)
// if (process.env.NODE_ENV !== 'production') {
//   require('electron-reload')(__dirname, {
//     electron: require('electron'),
//     electronPath: require.resolve('electron')
//   });
// }