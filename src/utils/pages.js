const path = require('path');
function setSettings({
  mainWindow,
  ipcMain,
  BrowserWindow
}) {
  let settingsWindow;
  function createSettingsWindow() {
    if (settingsWindow) {
      settingsWindow.focus();
      return;
    }
    settingsWindow = new BrowserWindow({
      width: 400,
      height: 300,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "../", 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    settingsWindow.loadFile('public/settings.html');
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }
  ipcMain.on('open-settings', () => {
    createSettingsWindow();
  });
}

module.exports = {
  setSettings
}