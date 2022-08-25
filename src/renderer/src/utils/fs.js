import { Message } from '@arco-design/web-vue';

const chooseDirectory = async () => {
  const res = await window.ipcRenderer.invoke('choose-directory');
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }

  return res.data;
};

const walkDirectory = async (nodeData) => {
  const res = await window.ipcRenderer.invoke(
    'walk-directory',
    nodeData.pathname
  );
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }

  return res.data;
};

const makeDirectory = async (pathname) => {
  const res = await window.ipcRenderer.invoke('make-directory', pathname);
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }
};

const removeDirectory = async (pathname) => {
  const res = await window.ipcRenderer.invoke('remove-directory', pathname);
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }
};

const unlinkFile = async (pathname) => {
  const res = await window.ipcRenderer.invoke('unlink-file', pathname);
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }
};

const renameFile = async (oldPathname, newPathname) => {
  const res = await window.ipcRenderer.invoke(
    'rename-file',
    oldPathname,
    newPathname
  );
  if (res.status === 0) {
    Message.error(res.message);
    throw res.message;
  }
};

export default {
  chooseDirectory,
  walkDirectory,
  makeDirectory,
  removeDirectory,
  unlinkFile,
  renameFile,
};
