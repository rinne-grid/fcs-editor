"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceObjByKey = exports.getFolderNameFromEventKey = exports.isStartPage = exports.calcSourceHash = void 0;
var crypto = require('crypto');
/***
 * 対象文字列のハッシュ値を返します
 * @param targetStr
 */
function calcSourceHash(targetStr) {
    return crypto.createHash('sha256').update(targetStr).digest('hex');
}
exports.calcSourceHash = calcSourceHash;
/***
 * 現在表示中のページがスタートページがどうかを返します
 * @param browserWindow
 */
function isStartPage(browserWindow) {
    return browserWindow.webContents.getURL().indexOf('start_page') !== -1;
}
exports.isStartPage = isStartPage;
/***
 * イベントキーを元に、対応するフォルダ名を取得します
 * @param eventKey
 */
function getFolderNameFromEventKey(eventKey) {
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
exports.getFolderNameFromEventKey = getFolderNameFromEventKey;
/***
 * sourcePrimaryKeyを元に、対象のソースコードオブジェクトを取得します
 *  scriptEvent[formId]["action"][n]
 *  scriptEvent[formId]["init"][n]
 * @param state
 * @param primaryKey
 */
function getSourceObjByKey(state, primaryKey) {
    var sourceObj = {};
    if (state.modifySourceDict.hasOwnProperty(primaryKey)) {
        return state.modifySourceDict[primaryKey];
    }
    // currentSourceKeyから対象のソースコードオブジェクトを取得する
    Object.keys(state.scriptEvent).forEach(function (formId) {
        var eventKeyList = Object.keys(state.scriptEvent[formId]);
        for (var i = 0; i < eventKeyList.length; i++) {
            var eventKey = eventKeyList[i];
            for (var _i = 0, _a = state.scriptEvent[formId][eventKey]; _i < _a.length; _i++) {
                var source = _a[_i];
                if (primaryKey === source.primaryKey) {
                    sourceObj = source;
                    break;
                }
            }
        }
    });
    return sourceObj;
}
exports.getSourceObjByKey = getSourceObjByKey;
//# sourceMappingURL=utility.js.map