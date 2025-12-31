const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const powerSaveBlocker = electron.powerSaveBlocker
const path = require('path')
const url = require('url')
const { exec } = require('child_process')
let mainWindow
let powerSaveBlockerId = null

function createWindow () {
  const screen = electron.screen;
  const primaryDisplay = screen.getPrimaryDisplay();
  const displayWidth = primaryDisplay.size.width;
  const displayHeight = primaryDisplay.size.height;

  mainWindow = new BrowserWindow({
      show: false,
      resizable: false,
      frame: false,
      width: displayWidth,
      height: displayHeight,
      webPreferences: {
	nodeIntegration: true,
	enableRemoteModule: true,
	contextIsolation: false
    }
  })

  // Disables F11
  mainWindow.setMenu(null);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.once('ready-to-show', () => {
    mainWindow.setFullScreen(true)
    mainWindow.show()
  })

  // !! UNCOMMENT ONLY ON DEBUG !!
   mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Oprește power save blocker când fereastra se închide
    if (powerSaveBlockerId !== null) {
      powerSaveBlocker.stop(powerSaveBlockerId)
      powerSaveBlockerId = null
    }
    mainWindow = null
  })
}

// Handler pentru acțiunile de sistem
ipcMain.on('system-action', (event, action) => {
  switch(action) {
    case 'shutdown':
      exec('shutdown now', (error) => {
        if (error) {
          console.error('Eroare la shutdown:', error);
        }
      });
      break;
    case 'restart':
      exec('shutdown -r now', (error) => {
        if (error) {
          console.error('Eroare la restart:', error);
        }
      });
      break;
    case 'live-environment':
      app.quit();
      break;
  }
})

// Handler pentru acțiunile aplicației
ipcMain.on('app-action', (event, action) => {
  switch(action) {
    case 'show-log':
      const logPath = '/home/liveuser/Desktop/install.log';
      exec(`kate ${logPath}`, (error) => {
        if (error) {
          console.error('Eroare la deschiderea log-ului:', error);
        }
      });
      break;
    case 'show-disks':
      exec('konsole -e \'$SHELL -c "sudo fdisk -l; $SHELL"\'', (error) => {
        if (error) {
          console.error('Eroare la deschiderea fdisk:', error);
        }
      });
      break;
    case 'quit':
      // Oprește power save blocker înainte de quit
      if (powerSaveBlockerId !== null) {
        powerSaveBlocker.stop(powerSaveBlockerId)
        powerSaveBlockerId = null
      }
      app.quit();
      break;
  }
})

app.on('ready', () => {
  // Previne ecranul să se stingă cât timp aplicația rulează
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep')
  console.log('Power save blocker started, ID:', powerSaveBlockerId)
  createWindow()
})

app.on('window-all-closed', function () {
  // Oprește power save blocker când aplicația se închide
  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId)
    powerSaveBlockerId = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', function () {
  // Oprește power save blocker înainte de a închide aplicația
  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId)
    powerSaveBlockerId = null
  }
})
