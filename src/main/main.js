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

  win.removeMenu();
  win.maximize();
  win.loadFile('./dist/renderer/index.html');
  win.show();
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

ipcMain.handle('choose-directory', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  });
  return {
    status: 1,
    data: result.canceled ? null : result.filePaths[0],
  };
});

ipcMain.handle('walk-directory', async (event, pathname) => {
  if (!fs.existsSync(pathname)) {
    return {
      status: 0,
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
      a.isFile === b.isFile
        ? a.filename.localeCompare(b.filename)
        : a.isFile - b.isFile
    );
    for (const item of list) {
      item.children = sort(item.children);
    }
    return list;
  };
  data.children = sort(data.children);

  return {
    status: 1,
    data: data.children,
  };
});

ipcMain.handle('make-directory', async (event, pathname) => {
  try {
    await fs.promises.mkdir(pathname);

    return {
      status: 1,
    };
  } catch (e) {
    return {
      status: 0,
      message: '创建失败',
    };
  }
});

ipcMain.handle('remove-directory', async (event, pathname) => {
  try {
    await fs.promises.rmdir(pathname, { recursive: true });

    return {
      status: 1,
    };
  } catch (e) {
    return {
      status: 0,
      message: '删除失败',
    };
  }
});

ipcMain.handle('unlink-file', async (event, pathname) => {
  try {
    await fs.promises.unlink(pathname);

    return {
      status: 1,
    };
  } catch (e) {
    return {
      status: 0,
      message: '删除失败',
    };
  }
});

ipcMain.handle('rename-file', async (event, oldPathname, newPathname) => {
  try {
    await fs.promises.rename(oldPathname, newPathname);

    return {
      status: 1,
    };
  } catch (e) {
    return {
      status: 0,
      message: '修改失败',
    };
  }
});

ipcMain.handle('link-file', async (event, oldPathname, newPathname) => {
  try {
    await fs.promises.link(oldPathname, newPathname);

    return {
      status: 1,
    };
  } catch (e) {
    return {
      status: 0,
      message: '创建失败',
    };
  }
});
