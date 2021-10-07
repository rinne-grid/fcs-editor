import { BrowserWindow } from 'electron';
import {
  FormaCustomScriptObject,
  FormaStoreData,
} from '../../interfaces/FormaApplicationObject';
const crypto = require('crypto');

/***
 * 対象文字列のハッシュ値を返します
 * @param targetStr
 */
export function calcSourceHash(targetStr: string): string {
  return crypto.createHash('sha256').update(targetStr).digest('hex');
}

/***
 * 現在表示中のページがスタートページがどうかを返します
 * @param browserWindow
 */
export function isStartPage(browserWindow: BrowserWindow): boolean {
  return browserWindow.webContents.getURL().indexOf('start_page') !== -1;
}

/***
 * イベントキーを元に、対応するフォルダ名を取得します
 * @param eventKey
 */
export function getFolderNameFromEventKey(eventKey: string) {
  switch (eventKey) {
    case 'init':
      return '01_初期イベント';
    case 'action':
      return '02_アイテムイベント';
    case 'table':
      return '03_テーブルイベント';
    case 'button':
      return '04_イベントボタン';
    case 'script':
      return '05_スクリプト';
  }
}

/***
 * sourcePrimaryKeyを元に、対象のソースコードオブジェクトを取得します
 *  scriptEvent[formId]["action"][n]
 *  scriptEvent[formId]["init"][n]
 * @param state
 * @param primaryKey
 */
export function getSourceObjByKey(
  state: FormaStoreData,
  primaryKey: string
): FormaCustomScriptObject {
  let sourceObj: FormaCustomScriptObject = {};
  if (state.modifySourceDict.hasOwnProperty(primaryKey)) {
    return state.modifySourceDict[primaryKey];
  }
  // currentSourceKeyから対象のソースコードオブジェクトを取得する
  Object.keys(state.scriptEvent).forEach((formId) => {
    let eventKeyList = Object.keys(state.scriptEvent[formId]);

    for (let i = 0; i < eventKeyList.length; i++) {
      let eventKey = eventKeyList[i];

      for (let source of state.scriptEvent[formId][eventKey]) {
        if (primaryKey === source.primaryKey) {
          sourceObj = source;
          break;
        }
      }
    }
  });
  return sourceObj;
}
