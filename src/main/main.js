const { BrowserWindow, app, dialog, ipcMain } = require('electron');
const walk = require('walkdir');

const fs = require('fs');
const path = require('path');

let win;
const createWindow = () => {
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.maximize();
  win.loadFile('./dist/renderer/index.html');
  win.show();
  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  });
  return {
    data: result.canceled ? null : result.filePaths[0],
  };
});

ipcMain.handle('scan-directory', async (event, pathname) => {
  if (!fs.existsSync(pathname)) {
    return {
      message: '路径不存在',
    };
  }

  const data = { children: [] };
  const map = { [pathname]: data };

  const res = await walk.async(pathname, {
    no_recurse: true,
    return_object: true,
  });
  for (pathname in res) {
    const stat = res[pathname];
    if (stat.isDirectory() || stat.isFile()) {
      const item = {
        pathname,
        filename: path.basename(pathname),
        isFile: stat.isFile(),
        inodeNo: stat.ino,
        children: [],
      };
      map[path.dirname(pathname)].children.push(item);
      if (stat.isDirectory()) {
        map[pathname] = item;
      }
    }
  }

  const sort = (list) => {
    list.sort((a, b) =>
      a.isFile === b.isFile ? a.filename - b.filename : a.isFile - b.isFile
    );
    for (const item of list) {
      item.children = sort(item.children);
    }
    return list;
  };
  data.children = sort(data.children);

  return {
    data: data.children,
  };
});
