import { IpcMainConst } from '../consts';
import {
  FormaActionSettingObject,
  FormaApplicationObject,
  FormaCustomScriptObject,
  FormaFormObject,
  FormaStoreData,
} from '../interfaces/FormaApplicationObject';

import { calcSourceHash } from './common/utility';
import { dialog } from 'electron';
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const xml2js = require('xml2js');

function formaFilter(formaData: any, key: string, value: string) {
  return formaData[key][0] === value;
}

/***
 * 対象のアプリケーション情報を取得します
 * @param applications {any}
 */
function getApplicationObjectList(applications: any) {
  let targetApplicationList = applications[0].application.filter(
    (application) => {
      return formaFilter(application, 'locale-id', 'ja');
    }
  );
  if (targetApplicationList.length === 0) {
    targetApplicationList = applications[0].application.filter(
      (application) => {
        return formaFilter(application, 'locale-id', 'en');
      }
    );
  }
  return targetApplicationList;
}

/***
 * アプリケーション情報を元にFormaApplicationObjectに設定します
 * @param targetApplicationList
 */
function getFormaAppObject(targetApplicationList: any) {
  const formaAppObj: FormaApplicationObject = {};
  formaAppObj.applicationId = targetApplicationList[0]['application-id'][0];
  formaAppObj.localeId = targetApplicationList[0]['locale-id'][0];
  formaAppObj.applicationName = targetApplicationList[0]['application-name'][0];
  formaAppObj.notes = targetApplicationList[0]['notes'][0];
  formaAppObj.targetLocale = targetApplicationList[0]['target-locale'][0];
  formaAppObj.applicationType = targetApplicationList[0]['application-type'][0];
  formaAppObj.companyAdminFlag =
    targetApplicationList[0]['company-admin-flag'][0];
  formaAppObj.versionNo = targetApplicationList[0]['version-no'][0];
  formaAppObj.listViewType = targetApplicationList[0]['list-view-type'][0];
  formaAppObj.formObjectList = [];
  return formaAppObj;
}

/***
 * application.xmlを読み込み、アプリケーション情報・フォーム情報を取得します
 * @param filePath{string}
 * @return {Promise<FormaApplicationObject>}
 */
export async function loadFormaApplicationObject(
  filePath: string
): Promise<FormaApplicationObject> {
  // const zipFileExtractPath = `${filePath.replace('.zip', '')}`;
  let formaAppObj: FormaApplicationObject = {};
  if (!fs.existsSync(IpcMainConst.UNZIP_DIST_ROOT_PATH)) {
    fs.mkdirSync(IpcMainConst.UNZIP_DIST_ROOT_PATH);
  }
  // zipファイルコピー先
  const distFileName = path.basename(filePath);
  const distFilePath = `${IpcMainConst.UNZIP_DIST_ROOT_PATH}/${distFileName}`;
  fs.copyFileSync(filePath, distFilePath);

  // zipファイル展開先
  const unzipFolderName = path.basename(filePath, '.zip');
  const unzipFilePath = `${IpcMainConst.UNZIP_DIST_ROOT_PATH}/${unzipFolderName}`;
  try {
    await fs
      .createReadStream(distFilePath)
      .pipe(unzipper.Extract({ path: `${unzipFilePath}` }))
      .on('finish', () => {})
      .promise()
      .then(() => {
        const parser = new xml2js.Parser();

        // application.xmlの読み込み
        const data = fs.readFileSync(
          `${unzipFilePath}/${IpcMainConst.APPLICATION_FILE_NAME}`
        );

        // application.xmlをJSONに変換
        parser.parseString(data, (err, result) => {
          let applications = result.data.applications;
          // applicationIDを特定する
          let targetApplicationList = getApplicationObjectList(applications);

          // Formaのアプリケーション情報を設定
          formaAppObj = getFormaAppObject(targetApplicationList);
          formaAppObj.zipFileExtractPath = unzipFilePath;

          const forms = result.data.forms;
          let targetFormList = forms[0].form.filter((form) => {
            return formaFilter(form, 'locale-id', 'ja');
          });
          // 日本語で取得できなかった場合、英語で試す
          if (targetFormList.length === 0) {
            targetFormList = forms[0].form.filter((form) => {
              return formaFilter(form, 'locale-id', 'en');
            });
          }

          const parentDir = path.dirname(filePath);

          targetFormList.forEach((form) => {
            const formObj: FormaFormObject = {};
            formObj.formId = form['form-id'][0];
            formObj.localeId = form['locale-id'][0];
            formObj.formName = form['form-name'][0];
            formObj.versionNo = form['version-no'][0];
            formObj.templateFlag = form['template_flag'][0];
            formObj.globalTplFlag = form['global_tpl_flag'][0];
            formObj.jsonFilePath = `${parentDir}/${formaAppObj.applicationId}/${formObj.formId}/${formObj.formId}.json`;

            formaAppObj.formObjectList.push(formObj);
          });
        });
      });
  } catch (e) {
    dialog.showErrorBox(
      'エラー',
      'Forma定義のzipファイルの読み込みに失敗しました。Formaアプリの定義ではないようです。'
    );
  }
  return formaAppObj;
}

/***
 * Formaアプリケーションに紐づくフォーム情報を取得します
 * @param formaAppObject{FormaApplicationObject}
 */
export function loadFormaFormObject(formaAppObject: FormaApplicationObject) {
  const formaFormJsonList = [];
  formaAppObject.formObjectList.forEach((formObject) => {
    const formJsonFilePath = `${formaAppObject.zipFileExtractPath}/${formaAppObject.applicationId}/${formObject.formId}/${formObject.formId}.json`;
    const formaFormData = fs.readFileSync(formJsonFilePath);

    const formaFormJsonObj = {
      formId: formObject.formId,
      formData: JSON.parse(formaFormData),
      applicationId: formaAppObject.applicationId,
    };
    formaFormJsonList.push(formaFormJsonObj);
  });
  return formaFormJsonList;
}

/***
 * Formaアプリケーションに紐づくフォーム情報を取得します
 * @param formaAppObject{FormaApplicationObject}
 * @param formaFormJsonList
 */
export function storeFormaFormObjectToFile(
  formaAppObject: FormaApplicationObject,
  formaFormJsonList
) {
  formaAppObject.formObjectList.forEach((formObject) => {
    const formJsonFilePath = `${formaAppObject.zipFileExtractPath}/${formaAppObject.applicationId}/${formObject.formId}/${formObject.formId}.json`;
    const formaFormJsonObj = formaFormJsonList.filter((formObj) => {
      return formObj.formId === formObject.formId;
    });
    fs.writeFileSync(
      formJsonFilePath,
      JSON.stringify(formaFormJsonObj[0].formData)
    );
  });
}

export function parseNoteIncludesSourceCodeName(note: string) {
  const regExp = new RegExp(/{{\s*(?<file_name>.+)\s*}}/, 'g');
  const result = regExp.exec(note);
  let resultName = null;
  if (result && result.groups) {
    resultName = result.groups.file_name.trim();
  }
  return resultName;
}

export function factoryCustomScriptObjectFromActionEvent(
  formId: string,
  actionSetting: FormaActionSettingObject,
  jsonStoreKey: string,
  sourceHashValue: string,
  index: number,
  itemPrefix: string
): FormaCustomScriptObject {
  const customScriptObj: FormaCustomScriptObject = {
    code: actionSetting.customScript,
    note: actionSetting.note,
    itemId: '',
    jsonStoreKey: jsonStoreKey,
    primaryKey: sourceHashValue,
    conditionExpression: actionSetting.conditionExpression,
    virtualName:
      parseNoteIncludesSourceCodeName(actionSetting.note) ||
      `${itemPrefix}${('000' + (index + 1)).slice(-3)}.js`,
    formId: formId,
    // scriptType: 'item',
    scriptType: 'event',
  };
  return customScriptObj;
}

/***
 * イベント設定リストキーを元に、イベントアイテム・テーブルイベントのカスタムスクリプト情報を取得します
 */
export function loadFormaCustomScriptBySettingListType(
  formId,
  formaFormJsonObj,
  eventSettingListKey,
  eventActionSettingListKey,
  itemPrefix
) {
  const customScriptList = [];
  if (
    formaFormJsonObj.hasOwnProperty('event') &&
    formaFormJsonObj['event'].hasOwnProperty(eventSettingListKey) &&
    formaFormJsonObj['event'].hasOwnProperty(eventActionSettingListKey)
  ) {
    let sourceIndex = 0;
    formaFormJsonObj['event'][eventSettingListKey].forEach((eventSetting) => {
      const itemId = eventSetting.item_id;
      const note = eventSetting.note;

      const actionSettingList =
        formaFormJsonObj['event'][eventActionSettingListKey];
      Object.keys(actionSettingList[itemId]).forEach((actionSettingKey) => {
        // アイテムイベントの場合、actionSettingListがArray
        // テーブルイベントの場合、オブジェクト型
        if (Array.isArray(actionSettingList[itemId][actionSettingKey])) {
          actionSettingList[itemId][actionSettingKey].forEach(
            (actionEventObj, index) => {
              if (actionEventObj.actionType === 'customScript') {
                const jsonStoreKey = `${formId}|event|${eventActionSettingListKey}|${itemId}|${actionSettingKey}|index:${index}`;
                const hashValue = calcSourceHash(jsonStoreKey);
                let isNewSource =
                  customScriptList.filter((customScript) => {
                    return customScript.primaryKey === hashValue;
                  }).length === 0;
                if (isNewSource) {
                  const customScriptObj =
                    factoryCustomScriptObjectFromActionEvent(
                      formId,
                      actionEventObj,
                      jsonStoreKey,
                      hashValue,
                      sourceIndex,
                      itemPrefix
                    );

                  sourceIndex += 1;
                  customScriptList.push(customScriptObj);
                }
              }
            }
          );
        } else {
          Object.keys(actionSettingList[itemId]).forEach((actionSettingKey) => {
            let actionSettingObj = actionSettingList[itemId][actionSettingKey];
            Object.keys(actionSettingObj).forEach((tableIndex) => {
              let tableEventObj = actionSettingObj[tableIndex];
              Object.keys(tableEventObj).forEach((tableEventKey) => {
                tableEventObj[tableEventKey].forEach((tableEvent, index) => {
                  if (tableEvent.actionType === 'customScript') {
                    const jsonStoreKey = `${formId}|event|${eventActionSettingListKey}|${itemId}|${actionSettingKey}|${tableIndex}|${tableEventKey}|index:${index}`;
                    const hashValue = calcSourceHash(jsonStoreKey);
                    let isNewSource =
                      customScriptList.filter((customScript) => {
                        return customScript.primaryKey === hashValue;
                      }).length === 0;
                    if (isNewSource) {
                      const customScriptObj =
                        factoryCustomScriptObjectFromActionEvent(
                          formId,
                          tableEvent,
                          jsonStoreKey,
                          hashValue,
                          sourceIndex,
                          itemPrefix
                        );

                      sourceIndex += 1;
                      customScriptList.push(customScriptObj);
                    }
                  }
                });
              });
            });
          });
        }
      });
    });
  }
  return customScriptList;
}

/***
 * テーブルイベントのカスタムスクリプトを取得します
 */
export function loadFormaCustomScriptTableEvent(formId, formaFormJsonObj) {
  return loadFormaCustomScriptBySettingListType(
    formId,
    formaFormJsonObj,
    'table_event_setting_list',
    'table_action_setting_list',
    'T'
  );
}

/***
 * 特定のアイテムに紐づくイベントのカスタムスクリプトを取得します
 */
export function loadFormaCustomScriptActionSetting(formId, formaFormJsonObj) {
  return loadFormaCustomScriptBySettingListType(
    formId,
    formaFormJsonObj,
    'event_setting_list',
    'action_setting_list',
    'E'
  );
}

export function loadFormaCustomScriptByItemType(
  formId,
  formaFormJsonObj,
  itemType,
  itemPrefix
) {
  const customScriptList = [];
  if (formaFormJsonObj.hasOwnProperty('item_list')) {
    const itemList = formaFormJsonObj['item_list'];
    // itemTypeを持つオブジェクトのみに絞り込み、対象のカスタムスクリプトを取得する
    let sourceIndex = 0;
    for (let i = 0; i < itemList.length; i++) {
      if (itemList[i].item_type === itemType) {
        const jsonStoreKey = `${formId}|item_list|${i}`;
        const sourceHashValue = calcSourceHash(jsonStoreKey);
        const targetObj = itemList[i];
        let itemLabel = '';
        if (targetObj.item_properties.labels.length > 0) {
          itemLabel = targetObj.item_properties.labels[0]['ja'];
        }
        const customScriptObj: FormaCustomScriptObject = {
          code: targetObj.item_properties.script,
          note: itemLabel,
          itemId: targetObj.item_id,
          jsonStoreKey: jsonStoreKey,
          primaryKey: sourceHashValue,
          conditionExpression: targetObj.item_view_names['ja'],
          virtualName:
            parseNoteIncludesSourceCodeName(itemLabel) ||
            `${itemPrefix}${('000' + (sourceIndex + 1)).slice(-3)}.js`,
          formId: formId,
          // scriptType: 'event',
          scriptType: 'item',
        };
        sourceIndex += 1;
        customScriptList.push(customScriptObj);
      }
    }
  }
  return customScriptList;
}

/***
 * 特定のフォームに紐づく初期表示イベントのカスタムスクリプトを取得します
 */
export function loadFormaCustomScriptInitEvent(formId, formaFormJsonObj) {
  const customScriptList = [];
  if (
    formaFormJsonObj.hasOwnProperty('event') &&
    formaFormJsonObj['event'].hasOwnProperty('form_action_setting_list') &&
    formaFormJsonObj['event']['form_action_setting_list'].hasOwnProperty(formId)
  ) {
    const formActionSettingList =
      formaFormJsonObj['event']['form_action_setting_list'][formId]['load'];
    let sourceIndex = 0;
    formActionSettingList.forEach((obj, index) => {
      const jsonStoreKey = `${formId}|event|form_action_setting_list|${formId}|load|index:${index}`;
      const sourceHashValue = calcSourceHash(jsonStoreKey);
      if (obj.actionType === 'customScript') {
        const customScriptObj = factoryCustomScriptObjectFromActionEvent(
          formId,
          obj,
          jsonStoreKey,
          sourceHashValue,
          sourceIndex,
          'I'
        );
        sourceIndex += 1;
        customScriptList.push(customScriptObj);
      }
    });
  }

  return customScriptList;
}

export function getFormaAppStoreData(formaAppObj: FormaApplicationObject) {
  // 複数フォームのJSON情報 {formId: "", formData: ""}
  const formaFormJsonList = loadFormaFormObject(formaAppObj);

  const scriptEvent = {};

  formaFormJsonList.forEach((formObj) => {
    // 初期イベント
    const scriptEventInit: FormaCustomScriptObject[] =
      loadFormaCustomScriptInitEvent(formObj.formId, formObj.formData);
    scriptEvent[formObj.formId] = {};
    scriptEvent[formObj.formId]['init'] = [];
    scriptEvent[formObj.formId]['init'] = scriptEventInit;

    // アイテムイベント
    const scriptActionEvent: FormaCustomScriptObject[] =
      loadFormaCustomScriptActionSetting(formObj.formId, formObj.formData);
    scriptEvent[formObj.formId]['action'] = [];
    scriptEvent[formObj.formId]['action'] = scriptActionEvent;

    // テーブルイベント
    const scriptTableEvent: FormaCustomScriptObject[] =
      loadFormaCustomScriptTableEvent(formObj.formId, formObj.formData);
    scriptEvent[formObj.formId]['table'] = [];
    scriptEvent[formObj.formId]['table'] = scriptTableEvent;

    // イベントボタン
    const scriptEventButtonList: FormaCustomScriptObject[] =
      loadFormaCustomScriptByItemType(
        formObj.formId,
        formObj.formData,
        'product_80_eventButton',
        'B'
      );
    scriptEvent[formObj.formId]['button'] = [];
    scriptEvent[formObj.formId]['button'] = scriptEventButtonList;

    // スクリプトアイテム
    const scriptList: FormaCustomScriptObject[] =
      loadFormaCustomScriptByItemType(
        formObj.formId,
        formObj.formData,
        'product_72_script',
        'S'
      );
    scriptEvent[formObj.formId]['script'] = [];
    scriptEvent[formObj.formId]['script'] = scriptList;

    scriptEvent[formObj.formId]['formObj'] = formObj;
  });

  return {
    formaAppObj: formaAppObj,
    formaFormJsonList: formaFormJsonList,
    scriptEvent: scriptEvent,
  } as FormaStoreData;
}
