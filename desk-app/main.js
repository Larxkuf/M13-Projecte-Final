// Importa electron correctamente
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Variable para la ventana principal
let mainWindow;

// Función para crear la ventana
function createWindow() {
  // Configuración de la ventana
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Solo para desarrollo
    }
  });
  new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necesario para módulos
      enableRemoteModule: true
    }
  })
  // Carga el archivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'html', 'index.html'));

  // Abre las herramientas de desarrollo (solo en desarrollo)
  mainWindow.webContents.openDevTools();

  // Evento cuando se cierra la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Espera a que Electron esté listo
app.whenReady().then(() => {
  createWindow();

  // Para macOS: crear ventana si no hay ninguna al activar la app
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

//