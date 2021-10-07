/***
 * Formaオブジェクトのデータ保管先キーを配列で戻します
 * @param jsonStoreKey
 */
export function parseJsonStoreKey(jsonStoreKey: string) {
  const jsonStoreKeyList = jsonStoreKey.split('|').map((key) => {
    return key.replace('index:', '');
  });
  jsonStoreKeyList.shift();
  return jsonStoreKeyList;
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
 * OSのファイルマネージャを利用するため、パス文字列を変換します
 * @param filePath
 */
export function parseFileManagerPathStr(filePath: string) {
  let resultPath;
  const regExp = new RegExp(/\\/, 'g');
  if (process.platform === 'win32') {
    resultPath = filePath.toString().replace(regExp, '/');
  } else {
    resultPath = filePath;
  }
  return resultPath;
}
