import { app, BrowserWindow, Menu, screen, dialog } from 'electron';

import * as path from 'path';
import * as url from 'url';

import { doHandleAppIpcMainEvents } from './ipc_main_process';
import { isStartPage } from './function/common/utility';

const isMac = process.platform === 'darwin';

// Initialize remote module
require('@electron/remote/main').initialize();

let win: BrowserWindow = null;
let licenseWin: BrowserWindow | null;
let dialogWin: BrowserWindow | null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,

    width: size.width,
    height: size.height,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run 2e2 test with Spectron
      enableRemoteModule: true, // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {
    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/electron`),
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

// TODO: 検索ダイアログのWindow化を行う
// function createDialogWindow(): BrowserWindow {
//   dialogWin = createDialogWindow();
//   dialogWin.close();
//   dialogWin.setSize(800, 400);
//   return dialogWin;
// }

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);
  });

  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: 'zipファイルを開く',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (isStartPage(win)) {
              win.webContents.send('select_zip_file');
            } else {
              win.webContents.send('select_zip_file_container');
            }
          },
        },
        {
          label: 'zipファイルにエクスポート',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const savePath = dialog.showSaveDialogSync(win, {
              title: 'zipファイルにエクスポート',
              buttonLabel: '保存',
              filters: [{ name: 'Zip File', extensions: ['zip'] }],
              properties: ['createDirectory'],
            });
            if (savePath) {
              win.webContents.send('export_zip_file', savePath);
            } else {
              return;
            }
          },
        },
        isMac
          ? { role: 'close', label: '終了' }
          : { role: 'quit', label: '終了' },
      ],
    },
    {
      label: '編集',
      submenu: [
        {
          label: '検索 - 実験的機能',
          click: () => {
            if (!isStartPage(win)) {
              win.webContents.send('search_code');
            }
          },
          accelerator: 'CmdOrCtrl+Shift+F',
        },
        {
          label: '置換 - 実験的機能',
          click: () => {
            if (!isStartPage(win)) {
              win.webContents.send('search_and_replace_code');
            }
          },
          accelerator: 'CmdOrCtrl+Shift+H',
        },
      ],
    },
    {
      label: 'ツール',
      submenu: [
        {
          label: 'カスタムスクリプトをファイルとしてエクスポート',
          click: () => {
            const savePath = dialog.showOpenDialogSync(win, {
              title: 'カスタムスクリプトをファイルとしてエクスポート',
              buttonLabel: 'フォルダーの選択',
              properties: ['createDirectory', 'openDirectory'],
            });
            if (savePath) {
              win.webContents.send(
                'get_store_data_for_export_custom_script',
                savePath
              );
            } else {
              return;
            }
          },
        },
      ],
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'このアプリについて',
          click: () => {
            licenseWin = new BrowserWindow({
              modal: true,
              frame: false,
              show: false,
              webPreferences: {
                nodeIntegration: true,
              },
            });
            if (serve) {
              licenseWin.loadURL('localhost:4200/license.html');
            } else {
              licenseWin.loadURL(
                url.format({
                  pathname: path.join(__dirname, '../dist/license.html'),
                  protocol: 'file:',
                  slashes: true,
                })
              );
            }
            if (licenseWin instanceof BrowserWindow) {
              licenseWin.show();
            }
          },
        },
        // { role: 'toggledevtools' },
      ],
    },
  ];
  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

doHandleAppIpcMainEvents();
