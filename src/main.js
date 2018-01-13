const path = require('path');
const url = require('url');
const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

//Crea ventana principal
app.on('ready', createWindow);

//Config ventana principal
function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850
  });
  mainWindow.maximize();
  const startUrl = process.env.DEV_URL ||
	url.format({
	  pathname: path.join(__dirname, '/../build/index.html'),
	  protocol: 'file:',
	  slashes: true
	});
	mainWindow.loadURL(startUrl);

  //TODO: Camiar esta condicion por una variable de entorno mas simbolica
  if(process.env.DEV_URL){
    console.log('Development mode');
    store.set('apiUrl', 'http://localhost:5000/');
  }

  mainWindow.on('closed', () => mainWindow = null);

  const mainMenu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(mainMenu);
}

//Config ventana de configuracion
function createconfigWindow() {
  configWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Config',
    minimizable: false,
    maximizable: false
  });
  const startUrl = url.format({
      pathname: path.join(__dirname, '/../build/config.html'),
      protocol: 'file:',
      slashes: true
    });
  configWindow.loadURL(startUrl);
  if(process.env.NODE_ENV === 'production'){  //Quita el menu de la ventana en caso de estar en PROD
    configWindow.setMenu(null);
  }
  configWindow.on('closed', () => {  //cuando se cierra la ventana
    configWindow = null; //Apuntamos la referencia a null y javascript limpia la memoria de la ventana anteriro.
  });
}

//Cierra programa
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

//-----------------Eventos de comunicacion------------------//

//Guarda token
ipcMain.on('newToken', (event, token) => {
  store.set('token', token);
});

//Lee el token de memoria
ipcMain.on('getToken', (event) => {
    event.sender.send('getToken', store.get('token'));
});

//lee la url de la api de la memoria
ipcMain.on('getApiUrl', (event) => {
    event.sender.send('getApiUrl', store.get('apiUrl'));
});

//Cambia la url de la API
ipcMain.on('changeApiUrl', (event, url) => {
    store.set('apiUrl', url);
    mainWindow.webContents.send('newApiUrl', store.get('apiUrl'));
});

//--------------Menu--------------//

//Template del menu
//TODO: Quitar debug de production
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Config',
        click() { createconfigWindow(); }
      },
      {
        label: 'LogOut',
        click() { logOut(); }
      },
      {
        label: 'DEVELOPER',
        submenu: [
          {
            label: 'Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item, focusedWindow) {
              focusedWindow.toggleDevTools();
            }
          },
          {
            role: 'reload'
          }
        ]
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){ app.quit(); }
      }
    ]
  }
];

//Compatibilidad menu para MAC
if (process.platform === 'darwin'){
  menuTemplate.unshift({});
}

//Evento de menu de LogOut
function logOut(){
  store.delete('token');
  //Enviar mensaje a front para cambiar estado
  mainWindow.webContents.send('logOut');
}
