const electron = require("electron"),
Tray= electron.Tray,
Menu= electron.Menu,
BrowserWindow = electron.BrowserWindow,
  app = electron.app;
const spawn = require("child_process").spawn;
const _ = require("lodash");

const node = spawn(
  "node",
  ["./ffmpeg-streamer"],
  {
    cwd: process.cwd()
  }
);
function redirectOutput(x) {
  let lineBuffer = "";

  x.on("data", function(data) {
    lineBuffer += data.toString();
    let lines = lineBuffer.split("\n");

    _.forEach(lines, l => {
      if (l !== "") {
        console.log(l);
      }
    });

    lineBuffer = lines[lines.length - 1];
  });
}


      redirectOutput(node.stdout);
      redirectOutput(node.stderr);
      
let tray;
let mainWindow;

function createWindow() {
  // Create the browser window.
  tray = new Tray('iconTemplate.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio', checked: true  },
    { label: 'Item2', type: 'radio' },
    { type: 'separator' },
    {label: 'Quit',
    click: () => {
      app.quit();
    }
  }
  ])
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
/*
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.webContents.openDevTools();
  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-server");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });*/
}

app.on("ready", createWindow);
app.on("browser-window-created", function(e, window) {
//  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
