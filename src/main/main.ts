/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
require('dotenv').config();
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { exec } from 'child_process';
const fs = require('fs');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

ipcMain.on('generate-audio', async (event, { content, voice }) => {
  const path = require('path');
  const tmpDir = require('os').tmpdir();

  let piperPath = path.join(process.resourcesPath, 'piper', 'piper');
  let model = path.join(process.resourcesPath, 'piper', `${voice}`);
  let output = path.join(tmpDir, 'output.wav');

  if (isDebug) {
    piperPath = path.resolve(__dirname, '../../piper/piper');
    model = path.resolve(__dirname, `../../piper/${voice}`);
  }

  // sanitize the message content
  // remove asterisks from the message content
  const messageContent = content.replace(/\*/g, '');
  // messageContent = messageContent.replace(/'/g, "\\'").replace(/"/g, '\\"');

  const command = `echo "${messageContent}" | ${piperPath} --model ${model} --output_file ${output}`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('Error generating audio:', err);
      event.reply('generate-audio', 'Error generating audio');
      event.reply('generate-audio', { base64: null });
      return;
    }
    // read the audio file
    fs.readFile(output, (err: any, data: any) => {
      if (err) {
        console.error('Error reading audio file:', err);
        event.reply('generate-audio', { base64: null });
        return;
      }
      // convert the audio data to a base64 string
      const base64Audio = Buffer.from(data).toString('base64');
      event.reply('generate-audio', { base64: base64Audio });
    });
  });
});

ipcMain.on('select-image', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
  });

  if (!result.canceled) {
    const imagePath = result.filePaths[0];

    // Read the image file
    fs.readFile(imagePath, (err: any, data: any) => {
      if (err) {
        console.error('Error reading image file:', err);
        return;
      }

      // Convert the image data to a base64 string
      const base64Image = Buffer.from(data).toString('base64');

      event.reply('image-selected', { base64: base64Image, path: imagePath });
    });
  }
});

// ipcMain.handle('select-image', async (event) => {
//   const result = await dialog.showOpenDialog({
//     properties: ['openFile'],
//     filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
//   })

//   if (!result.canceled) {
//     return result.filePaths[0]
//   }
// })

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions: any[] = [];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // make the browser window appear in the bottom right corner of the screen
  const { width: screenWidth, height: screenHeight } =
    require('electron').screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 500;
  const windowHeight = 700;

  mainWindow = new BrowserWindow({
    show: false,
    width: windowWidth,
    height: windowHeight,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
