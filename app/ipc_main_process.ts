import { ipcMain } from 'electron';
import {
  getFormaAppStoreData,
  loadFormaApplicationObject,
  storeFormaFormObjectToFile,
} from './function/forma_application_parser';
import {
  FormaApplicationObject,
  FormaStoreData,
} from './interfaces/FormaApplicationObject';
import * as fs from 'fs';
import {
  getFolderNameFromEventKey,
  getSourceObjByKey,
} from './function/common/utility';

const archiver = require('archiver');
const shell = require('electron').shell;

export function doHandleAppIpcMainEvents() {
  let storeData: FormaStoreData;
  ipcMain.handle('load_and_unzip', async (event, filePath) => {
    const formaAppObj: FormaApplicationObject =
      await loadFormaApplicationObject(filePath);
    storeData = getFormaAppStoreData(formaAppObj);
    return storeData;
  });

  ipcMain.handle('store_and_zip', (event, filePath, appObj, formList) => {
    // ipcMain.handle('store_and_zip', (event, filePath, appObj, formList) => {
    storeFormaFormObjectToFile(appObj, formList);
    const archive = archiver.create('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(filePath);
    output.on('close', () => {});
    archive.pipe(output);
    archive.directory(`${appObj.zipFileExtractPath}/`, false);
    archive.finalize();
    // shell.showItemInFolder(parseFileManagerPathStr(filePath));
  });

  ipcMain.handle(
    'do_export_custom_script',
    (event, savePath, formaStoreData) => {
      // console.log(savePath);
      // console.log(formaStoreData.scriptEvent['8fuegqna0fu0ofu']['init']);
      const addedSourceKeyDict = {};
      Object.keys(formaStoreData.scriptEvent).forEach((formId) => {
        let formObj = formaStoreData.scriptEvent[formId];
        let formFolderPath = `${savePath}/${formId}`;
        if (!fs.existsSync(formFolderPath)) {
          fs.mkdirSync(formFolderPath);
        }

        Object.keys(formObj).forEach((eventKey) => {
          // formObjキー以外が出力対象となる
          if (Array.isArray(formObj[eventKey])) {
            let eventFolderName = getFolderNameFromEventKey(eventKey);
            let eventFolderPath = `${formFolderPath}/${eventFolderName}`;

            if (!fs.existsSync(eventFolderPath)) {
              fs.mkdirSync(eventFolderPath);
            }
            formObj[eventKey].forEach((script) => {
              if (!addedSourceKeyDict.hasOwnProperty(script.primaryKey)) {
                let sourceObj = getSourceObjByKey(
                  formaStoreData,
                  script.primaryKey
                );
                let scriptName = sourceObj.virtualName;
                let scriptPath = `${eventFolderPath}/${scriptName}`;
                if (!fs.existsSync(scriptPath)) {
                  fs.writeFileSync(scriptPath, sourceObj.code);
                  // 同名のファイルがすでに存在する場合、ハッシュ値をファイル名に付与する
                } else {
                  scriptPath = `${eventFolderPath}/${scriptName.replace(
                    '.js',
                    ''
                  )}_${script.primaryKey.substr(0, 10)}.js`;
                  fs.writeFileSync(scriptPath, sourceObj.code);
                }
                addedSourceKeyDict[script.primaryKey] = script.primaryKey;
              }
            });
          }
        });
      });
      // shell.showItemInFolder(parseFileManagerPathStr(savePath));
    }
  );
  return;
}
