const { app, BrowserWindow } = require('electron');

function createWindow () {
  	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	win.loadFile('./home.html');

	// Open the DevTools.
	win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

app.on('ready', createWindow);

// MacOS
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// MacOS
app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});

// MacOS
app.on('window-all-closed', function(){
	if (process.platform != 'darwin') {
		app.quit();
	}
});
