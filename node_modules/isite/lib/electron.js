console.log('............................');
console.log('electronjs ...............................');
console.log('............................');

const electron = require('electron');
const { app, BrowserWindow } = electron;
try {
    require('@electron/remote/main').initialize();
} catch (error) {
    
}

app.on('ready', function () {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });

  let win = new BrowserWindow({
    show: false,
    title: 'Updates',
    width: 850,
    height: 720,
    alwaysOnTop: false,
    webPreferences: {
      javascript: true,
      enableRemoteModule: true,
      contextIsolation: false,
      nativeWindowOpen: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nodeIntegrationInWorker: true,
      experimentalFeatures: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      plugins: true,
    },
  });

  // win.setMenuBarVisibility(false)
  win.loadURL(__dirname + '/../isite_files/html/electron.html');

  win.on('closed', () => {
    process.exit();
  });
});
