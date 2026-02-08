// Forțează folosirea X11 indiferent dacă sistemul rulează Wayland sau nu
process.env.OZONE_PLATFORM = 'x11'

const electron = require('electron')
const app = electron.app

// Evită crash-ul GPU (vaInitialize failed / virtio_gpu) în VM/live: randare software
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-sandbox')
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const powerSaveBlocker = electron.powerSaveBlocker
const path = require('path')
const url = require('url')
const { exec } = require('child_process')
let mainWindow
let powerSaveBlockerId = null

// O singură instanță: al doilea npm start dă focus primei ferestre
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('[system_install] Altă instanță rulează deja; închid. Dă focus pe fereastra existentă.')
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function showWindow () {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.setFullScreen(true)
  mainWindow.show()
  mainWindow.focus()
}

function createWindow () {
  console.log('[system_install] createWindow()')
  const screen = electron.screen
  const primaryDisplay = screen.getPrimaryDisplay()
  const displayWidth = primaryDisplay.size.width
  const displayHeight = primaryDisplay.size.height

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

  mainWindow.setMenu(null)

  const loadUrl = url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  })
  console.log('[system_install] Loading:', loadUrl)

  let showTimeout = null
  let shown = false
  const ensureShow = () => {
    if (shown) return
    shown = true
    if (showTimeout) {
      clearTimeout(showTimeout)
      showTimeout = null
    }
    console.log('[system_install] Showing window')
    showWindow()
  }

  mainWindow.once('ready-to-show', () => {
    ensureShow()
  })

  // Dacă ready-to-show nu se declanșează (încărcare lentă/eroare), afișează fereastra după 8s
  showTimeout = setTimeout(() => {
    console.log('[system_install] Fallback: showing window after timeout')
    ensureShow()
  }, 8000)

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[system_install] did-fail-load:', errorCode, errorDescription, validatedURL)
    ensureShow()
  })

  mainWindow.loadURL(loadUrl).catch((err) => {
    console.error('[system_install] loadURL error:', err)
    ensureShow()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    console.log('[system_install] Page loaded')
  })

  // !! UNCOMMENT ONLY ON DEBUG !!
  //mainWindow.webContents.openDevTools()

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
  console.log('[system_install] App ready')
  exec('killall plasmashell 2>/dev/null', (err) => { if (err) {} })
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep')
  console.log('[system_install] Power save blocker started, ID:', powerSaveBlockerId)
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
