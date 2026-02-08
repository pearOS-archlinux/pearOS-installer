// Forțează folosirea X11 indiferent dacă sistemul rulează Wayland sau nu
process.env.OZONE_PLATFORM = 'x11'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
let mainWindow

// Evită crash-ul GPU (vaInitialize failed / virtio_gpu) în VM/live: randare software
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-sandbox')

// O singură instanță: al doilea npm start dă focus primei ferestre
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
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
  if (process.env.POST_INSTALL_TEST === '1') {
    mainWindow.webContents.openDevTools()
  }
}

function createWindow () {
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
    pathname: path.join(__dirname, '/app/hello.html'),
    protocol: 'file:',
    slashes: true
  })

  let showTimeout = null
  let shown = false
  const ensureShow = () => {
    if (shown) return
    shown = true
    if (showTimeout) {
      clearTimeout(showTimeout)
      showTimeout = null
    }
    showWindow()
  }

  mainWindow.once('ready-to-show', () => {
    ensureShow()
  })

  // Dacă ready-to-show nu se declanșează, afișează fereastra după 8s
  showTimeout = setTimeout(() => {
    ensureShow()
  }, 8000)

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    ensureShow()
  })

  mainWindow.loadURL(loadUrl).catch((err) => {
    ensureShow()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})


const {ipcMain} = require('electron')
ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})
