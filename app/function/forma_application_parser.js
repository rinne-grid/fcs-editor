"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormaAppStoreData = exports.loadFormaCustomScriptInitEvent = exports.loadFormaCustomScriptByItemType = exports.loadFormaCustomScriptActionSetting = exports.loadFormaCustomScriptTableEvent = exports.loadFormaCustomScriptBySettingListType = exports.factoryCustomScriptObjectFromActionEvent = exports.parseNoteIncludesSourceCodeName = exports.storeFormaFormObjectToFile = exports.loadFormaFormObject = exports.loadFormaApplicationObject = void 0;
var consts_1 = require("../consts");
var utility_1 = require("./common/utility");
var electron_1 = require("electron");
var fs = require('fs');
var path = require('path');
var unzipper = require('unzipper');
var xml2js = require('xml2js');
function formaFilter(formaData, key, value) {
    return formaData[key][0] === value;
}
/***
 * 対象のアプリケーション情報を取得します
 * @param applications {any}
 */
function getApplicationObjectList(applications) {
    var targetApplicationList = applications[0].application.filter(function (application) {
        return formaFilter(application, 'locale-id', 'ja');
    });
    if (targetApplicationList.length === 0) {
        targetApplicationList = applications[0].application.filter(function (application) {
            return formaFilter(application, 'locale-id', 'en');
        });
    }
    return targetApplicationList;
}
/***
 * アプリケーション情報を元にFormaApplicationObjectに設定します
 * @param targetApplicationList
 */
function getFormaAppObject(targetApplicationList) {
    var formaAppObj = {};
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
function loadFormaApplicationObject(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var formaAppObj, distFileName, distFilePath, unzipFolderName, unzipFilePath, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formaAppObj = {};
                    if (!fs.existsSync(consts_1.IpcMainConst.UNZIP_DIST_ROOT_PATH)) {
                        fs.mkdirSync(consts_1.IpcMainConst.UNZIP_DIST_ROOT_PATH);
                    }
                    distFileName = path.basename(filePath);
                    distFilePath = consts_1.IpcMainConst.UNZIP_DIST_ROOT_PATH + "/" + distFileName;
                    fs.copyFileSync(filePath, distFilePath);
                    unzipFolderName = path.basename(filePath, '.zip');
                    unzipFilePath = consts_1.IpcMainConst.UNZIP_DIST_ROOT_PATH + "/" + unzipFolderName;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs
                            .createReadStream(distFilePath)
                            .pipe(unzipper.Extract({ path: "" + unzipFilePath }))
                            .on('finish', function () { })
                            .promise()
                            .then(function () {
                            var parser = new xml2js.Parser();
                            // application.xmlの読み込み
                            var data = fs.readFileSync(unzipFilePath + "/" + consts_1.IpcMainConst.APPLICATION_FILE_NAME);
                            // application.xmlをJSONに変換
                            parser.parseString(data, function (err, result) {
                                var applications = result.data.applications;
                                // applicationIDを特定する
                                var targetApplicationList = getApplicationObjectList(applications);
                                // Formaのアプリケーション情報を設定
                                formaAppObj = getFormaAppObject(targetApplicationList);
                                formaAppObj.zipFileExtractPath = unzipFilePath;
                                var forms = result.data.forms;
                                var targetFormList = forms[0].form.filter(function (form) {
                                    return formaFilter(form, 'locale-id', 'ja');
                                });
                                // 日本語で取得できなかった場合、英語で試す
                                if (targetFormList.length === 0) {
                                    targetFormList = forms[0].form.filter(function (form) {
                                        return formaFilter(form, 'locale-id', 'en');
                                    });
                                }
                                var parentDir = path.dirname(filePath);
                                targetFormList.forEach(function (form) {
                                    var formObj = {};
                                    formObj.formId = form['form-id'][0];
                                    formObj.localeId = form['locale-id'][0];
                                    formObj.formName = form['form-name'][0];
                                    formObj.versionNo = form['version-no'][0];
                                    formObj.templateFlag = form['template_flag'][0];
                                    formObj.globalTplFlag = form['global_tpl_flag'][0];
                                    formObj.jsonFilePath = parentDir + "/" + formaAppObj.applicationId + "/" + formObj.formId + "/" + formObj.formId + ".json";
                                    formaAppObj.formObjectList.push(formObj);
                                });
                            });
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    electron_1.dialog.showErrorBox('エラー', 'Forma定義のzipファイルの読み込みに失敗しました。Formaアプリの定義ではないようです。');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, formaAppObj];
            }
        });
    });
}
exports.loadFormaApplicationObject = loadFormaApplicationObject;
/***
 * Formaアプリケーションに紐づくフォーム情報を取得します
 * @param formaAppObject{FormaApplicationObject}
 */
function loadFormaFormObject(formaAppObject) {
    var formaFormJsonList = [];
    formaAppObject.formObjectList.forEach(function (formObject) {
        var formJsonFilePath = formaAppObject.zipFileExtractPath + "/" + formaAppObject.applicationId + "/" + formObject.formId + "/" + formObject.formId + ".json";
        var formaFormData = fs.readFileSync(formJsonFilePath);
        var formaFormJsonObj = {
            formId: formObject.formId,
            formData: JSON.parse(formaFormData),
            applicationId: formaAppObject.applicationId,
        };
        formaFormJsonList.push(formaFormJsonObj);
    });
    return formaFormJsonList;
}
exports.loadFormaFormObject = loadFormaFormObject;
/***
 * Formaアプリケーションに紐づくフォーム情報を取得します
 * @param formaAppObject{FormaApplicationObject}
 * @param formaFormJsonList
 */
function storeFormaFormObjectToFile(formaAppObject, formaFormJsonList) {
    formaAppObject.formObjectList.forEach(function (formObject) {
        var formJsonFilePath = formaAppObject.zipFileExtractPath + "/" + formaAppObject.applicationId + "/" + formObject.formId + "/" + formObject.formId + ".json";
        var formaFormJsonObj = formaFormJsonList.filter(function (formObj) {
            return formObj.formId === formObject.formId;
        });
        fs.writeFileSync(formJsonFilePath, JSON.stringify(formaFormJsonObj[0].formData));
    });
}
exports.storeFormaFormObjectToFile = storeFormaFormObjectToFile;
function parseNoteIncludesSourceCodeName(note) {
    var regExp = new RegExp(/{{\s*(?<file_name>.+)\s*}}/, 'g');
    var result = regExp.exec(note);
    var resultName = null;
    if (result && result.groups) {
        resultName = result.groups.file_name.trim();
    }
    return resultName;
}
exports.parseNoteIncludesSourceCodeName = parseNoteIncludesSourceCodeName;
function factoryCustomScriptObjectFromActionEvent(formId, actionSetting, jsonStoreKey, sourceHashValue, index, itemPrefix) {
    var customScriptObj = {
        code: actionSetting.customScript,
        note: actionSetting.note,
        itemId: '',
        jsonStoreKey: jsonStoreKey,
        primaryKey: sourceHashValue,
        conditionExpression: actionSetting.conditionExpression,
        virtualName: parseNoteIncludesSourceCodeName(actionSetting.note) ||
            "" + itemPrefix + ('000' + (index + 1)).slice(-3) + ".js",
        formId: formId,
        // scriptType: 'item',
        scriptType: 'event',
    };
    return customScriptObj;
}
exports.factoryCustomScriptObjectFromActionEvent = factoryCustomScriptObjectFromActionEvent;
/***
 * イベント設定リストキーを元に、イベントアイテム・テーブルイベントのカスタムスクリプト情報を取得します
 */
function loadFormaCustomScriptBySettingListType(formId, formaFormJsonObj, eventSettingListKey, eventActionSettingListKey, itemPrefix) {
    var customScriptList = [];
    if (formaFormJsonObj.hasOwnProperty('event') &&
        formaFormJsonObj['event'].hasOwnProperty(eventSettingListKey) &&
        formaFormJsonObj['event'].hasOwnProperty(eventActionSettingListKey)) {
        var sourceIndex_1 = 0;
        formaFormJsonObj['event'][eventSettingListKey].forEach(function (eventSetting) {
            var itemId = eventSetting.item_id;
            var note = eventSetting.note;
            var actionSettingList = formaFormJsonObj['event'][eventActionSettingListKey];
            Object.keys(actionSettingList[itemId]).forEach(function (actionSettingKey) {
                // アイテムイベントの場合、actionSettingListがArray
                // テーブルイベントの場合、オブジェクト型
                if (Array.isArray(actionSettingList[itemId][actionSettingKey])) {
                    actionSettingList[itemId][actionSettingKey].forEach(function (actionEventObj, index) {
                        if (actionEventObj.actionType === 'customScript') {
                            var jsonStoreKey = formId + "|event|" + eventActionSettingListKey + "|" + itemId + "|" + actionSettingKey + "|index:" + index;
                            var hashValue_1 = utility_1.calcSourceHash(jsonStoreKey);
                            var isNewSource = customScriptList.filter(function (customScript) {
                                return customScript.primaryKey === hashValue_1;
                            }).length === 0;
                            if (isNewSource) {
                                var customScriptObj = factoryCustomScriptObjectFromActionEvent(formId, actionEventObj, jsonStoreKey, hashValue_1, sourceIndex_1, itemPrefix);
                                sourceIndex_1 += 1;
                                customScriptList.push(customScriptObj);
                            }
                        }
                    });
                }
                else {
                    Object.keys(actionSettingList[itemId]).forEach(function (actionSettingKey) {
                        var actionSettingObj = actionSettingList[itemId][actionSettingKey];
                        Object.keys(actionSettingObj).forEach(function (tableIndex) {
                            var tableEventObj = actionSettingObj[tableIndex];
                            Object.keys(tableEventObj).forEach(function (tableEventKey) {
                                tableEventObj[tableEventKey].forEach(function (tableEvent, index) {
                                    if (tableEvent.actionType === 'customScript') {
                                        var jsonStoreKey = formId + "|event|" + eventActionSettingListKey + "|" + itemId + "|" + actionSettingKey + "|" + tableIndex + "|" + tableEventKey + "|index:" + index;
                                        var hashValue_2 = utility_1.calcSourceHash(jsonStoreKey);
                                        var isNewSource = customScriptList.filter(function (customScript) {
                                            return customScript.primaryKey === hashValue_2;
                                        }).length === 0;
                                        if (isNewSource) {
                                            var customScriptObj = factoryCustomScriptObjectFromActionEvent(formId, tableEvent, jsonStoreKey, hashValue_2, sourceIndex_1, itemPrefix);
                                            sourceIndex_1 += 1;
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
exports.loadFormaCustomScriptBySettingListType = loadFormaCustomScriptBySettingListType;
/***
 * テーブルイベントのカスタムスクリプトを取得します
 */
function loadFormaCustomScriptTableEvent(formId, formaFormJsonObj) {
    return loadFormaCustomScriptBySettingListType(formId, formaFormJsonObj, 'table_event_setting_list', 'table_action_setting_list', 'T');
}
exports.loadFormaCustomScriptTableEvent = loadFormaCustomScriptTableEvent;
/***
 * 特定のアイテムに紐づくイベントのカスタムスクリプトを取得します
 */
function loadFormaCustomScriptActionSetting(formId, formaFormJsonObj) {
    return loadFormaCustomScriptBySettingListType(formId, formaFormJsonObj, 'event_setting_list', 'action_setting_list', 'E');
}
exports.loadFormaCustomScriptActionSetting = loadFormaCustomScriptActionSetting;
function loadFormaCustomScriptByItemType(formId, formaFormJsonObj, itemType, itemPrefix) {
    var customScriptList = [];
    if (formaFormJsonObj.hasOwnProperty('item_list')) {
        var itemList = formaFormJsonObj['item_list'];
        // itemTypeを持つオブジェクトのみに絞り込み、対象のカスタムスクリプトを取得する
        var sourceIndex = 0;
        for (var i = 0; i < itemList.length; i++) {
            if (itemList[i].item_type === itemType) {
                var jsonStoreKey = formId + "|item_list|" + i;
                var sourceHashValue = utility_1.calcSourceHash(jsonStoreKey);
                var targetObj = itemList[i];
                var itemLabel = '';
                if (targetObj.item_properties.labels.length > 0) {
                    itemLabel = targetObj.item_properties.labels[0]['ja'];
                }
                var customScriptObj = {
                    code: targetObj.item_properties.script,
                    note: itemLabel,
                    itemId: targetObj.item_id,
                    jsonStoreKey: jsonStoreKey,
                    primaryKey: sourceHashValue,
                    conditionExpression: targetObj.item_view_names['ja'],
                    virtualName: parseNoteIncludesSourceCodeName(itemLabel) ||
                        "" + itemPrefix + ('000' + (sourceIndex + 1)).slice(-3) + ".js",
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
exports.loadFormaCustomScriptByItemType = loadFormaCustomScriptByItemType;
/***
 * 特定のフォームに紐づく初期表示イベントのカスタムスクリプトを取得します
 */
function loadFormaCustomScriptInitEvent(formId, formaFormJsonObj) {
    var customScriptList = [];
    if (formaFormJsonObj.hasOwnProperty('event') &&
        formaFormJsonObj['event'].hasOwnProperty('form_action_setting_list') &&
        formaFormJsonObj['event']['form_action_setting_list'].hasOwnProperty(formId)) {
        var formActionSettingList = formaFormJsonObj['event']['form_action_setting_list'][formId]['load'];
        var sourceIndex_2 = 0;
        formActionSettingList.forEach(function (obj, index) {
            var jsonStoreKey = formId + "|event|form_action_setting_list|" + formId + "|load|index:" + index;
            var sourceHashValue = utility_1.calcSourceHash(jsonStoreKey);
            if (obj.actionType === 'customScript') {
                var customScriptObj = factoryCustomScriptObjectFromActionEvent(formId, obj, jsonStoreKey, sourceHashValue, sourceIndex_2, 'I');
                sourceIndex_2 += 1;
                customScriptList.push(customScriptObj);
            }
        });
    }
    return customScriptList;
}
exports.loadFormaCustomScriptInitEvent = loadFormaCustomScriptInitEvent;
function getFormaAppStoreData(formaAppObj) {
    // 複数フォームのJSON情報 {formId: "", formData: ""}
    var formaFormJsonList = loadFormaFormObject(formaAppObj);
    var scriptEvent = {};
    formaFormJsonList.forEach(function (formObj) {
        // 初期イベント
        var scriptEventInit = loadFormaCustomScriptInitEvent(formObj.formId, formObj.formData);
        scriptEvent[formObj.formId] = {};
        scriptEvent[formObj.formId]['init'] = [];
        scriptEvent[formObj.formId]['init'] = scriptEventInit;
        // アイテムイベント
        var scriptActionEvent = loadFormaCustomScriptActionSetting(formObj.formId, formObj.formData);
        scriptEvent[formObj.formId]['action'] = [];
        scriptEvent[formObj.formId]['action'] = scriptActionEvent;
        // テーブルイベント
        var scriptTableEvent = loadFormaCustomScriptTableEvent(formObj.formId, formObj.formData);
        scriptEvent[formObj.formId]['table'] = [];
        scriptEvent[formObj.formId]['table'] = scriptTableEvent;
        // イベントボタン
        var scriptEventButtonList = loadFormaCustomScriptByItemType(formObj.formId, formObj.formData, 'product_80_eventButton', 'B');
        scriptEvent[formObj.formId]['button'] = [];
        scriptEvent[formObj.formId]['button'] = scriptEventButtonList;
        // スクリプトアイテム
        var scriptList = loadFormaCustomScriptByItemType(formObj.formId, formObj.formData, 'product_72_script', 'S');
        scriptEvent[formObj.formId]['script'] = [];
        scriptEvent[formObj.formId]['script'] = scriptList;
        scriptEvent[formObj.formId]['formObj'] = formObj;
    });
    return {
        formaAppObj: formaAppObj,
        formaFormJsonList: formaFormJsonList,
        scriptEvent: scriptEvent,
    };
}
exports.getFormaAppStoreData = getFormaAppStoreData;
//# sourceMappingURL=forma_application_parser.js.map