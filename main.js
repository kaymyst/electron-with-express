const electron = require("electron"),
Tray= electron.Tray,
Menu= electron.Menu,
MenuItem = electron.MenuItem,
//BrowserWindow = electron.BrowserWindow,
  app = electron.app;
const spawn = require("child_process").spawn;
const _ = require("lodash");
const path = require('path')
const dirName = process.pkg && process.pkg.entrypoint ? path.dirname(process.execPath) : __dirname;
const ffmpeg = require(app.getAppPath()+'/lib/findFfmpeg')(dirName);

//app.set('ffmpegVersion', ffmpeg.version)
//app.set('ffmpegPath', ffmpeg.path)

let arrayofdevices = [];
const { exec } = require('child_process')
var donevideo = false;



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
let node /*= spawn(
  "node",
  ["./ffmpeg-streamer"],
  {
    cwd: process.cwd()
  }
);*/

let tray;
let mainWindow;

function spawnFfmpeg(i){
  if (node)
    node.kill("SIGINT");

  node = spawn(
    "node",
    [app.getAppPath()+"/ffmpeg-streamer",i, "production"],
    {
      cwd: process.cwd()
    }
  );

  redirectOutput(node.stdout);
  redirectOutput(node.stderr);
}



function createWindow() {
  // Create the browser window.
  tray = new Tray(app.getAppPath()+'/iconTemplate.png');
  let contextMenu = Menu.buildFromTemplate([

    { type: 'separator' },
    {label: 'Quit',
    click: () => {
      if (node)
        node.kill("SIGINT");
      app.quit();
    }
  }
  ])


  var i=0;



  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  exec( 'ffmpeg -hide_banner -f avfoundation -list_devices true -i \"\"', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      var lines = stderr.match(/^.*([\n\r]+|$)/gm);

      lines.forEach(line => {
        if (line.includes("AVFoundation audio devices:"))
          donevideo = true;
      if (line.includes( "[AVFoundation input device")&&!donevideo)
      {
        if (!line.includes("AVFoundation video devices:"))
        {

          var regExp = /(\[([^\]]|\[\])*\])/;
          var matches = regExp.exec(line);
          var device = line.replace(matches[1],"").trim();
          arrayofdevices.push(device);
          var index = i;

          contextMenu.insert(i,new MenuItem(
            {type:'radio',
              label: device,
            click: () => {
              console.log(device);
              spawnFfmpeg(index);
              contextMenu.items[index].checked = true;
              //console.log (contextMenu.items[index]);
              tray.setContextMenu(contextMenu);

            }
          }
          ));
          i++;
          console.log(`Video device : ${device}`)
          tray.setContextMenu(contextMenu);
          spawnFfmpeg(0);
        }
      }

    });
    }
  })
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
app.dock.hide();
app.on("ready", createWindow);
app.on("browser-window-created", function(e, window) {
//  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    if (node)
      node.kill("SIGINT");
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
