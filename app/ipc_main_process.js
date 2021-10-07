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
exports.doHandleAppIpcMainEvents = void 0;
var electron_1 = require("electron");
var forma_application_parser_1 = require("./function/forma_application_parser");
var fs = require("fs");
var utility_1 = require("./function/common/utility");
var archiver = require('archiver');
var shell = require('electron').shell;
function doHandleAppIpcMainEvents() {
    var _this = this;
    var storeData;
    electron_1.ipcMain.handle('load_and_unzip', function (event, filePath) { return __awaiter(_this, void 0, void 0, function () {
        var formaAppObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, forma_application_parser_1.loadFormaApplicationObject(filePath)];
                case 1:
                    formaAppObj = _a.sent();
                    storeData = forma_application_parser_1.getFormaAppStoreData(formaAppObj);
                    return [2 /*return*/, storeData];
            }
        });
    }); });
    electron_1.ipcMain.handle('store_and_zip', function (event, filePath, appObj, formList) {
        // ipcMain.handle('store_and_zip', (event, filePath, appObj, formList) => {
        forma_application_parser_1.storeFormaFormObjectToFile(appObj, formList);
        var archive = archiver.create('zip', { zlib: { level: 9 } });
        var output = fs.createWriteStream(filePath);
        output.on('close', function () { });
        archive.pipe(output);
        archive.directory(appObj.zipFileExtractPath + "/", false);
        archive.finalize();
        // shell.showItemInFolder(parseFileManagerPathStr(filePath));
    });
    electron_1.ipcMain.handle('do_export_custom_script', function (event, savePath, formaStoreData) {
        // console.log(savePath);
        // console.log(formaStoreData.scriptEvent['8fuegqna0fu0ofu']['init']);
        var addedSourceKeyDict = {};
        Object.keys(formaStoreData.scriptEvent).forEach(function (formId) {
            var formObj = formaStoreData.scriptEvent[formId];
            var formFolderPath = savePath + "/" + formId;
            if (!fs.existsSync(formFolderPath)) {
                fs.mkdirSync(formFolderPath);
            }
            Object.keys(formObj).forEach(function (eventKey) {
                // formObjキー以外が出力対象となる
                if (Array.isArray(formObj[eventKey])) {
                    var eventFolderName = utility_1.getFolderNameFromEventKey(eventKey);
                    var eventFolderPath_1 = formFolderPath + "/" + eventFolderName;
                    if (!fs.existsSync(eventFolderPath_1)) {
                        fs.mkdirSync(eventFolderPath_1);
                    }
                    formObj[eventKey].forEach(function (script) {
                        if (!addedSourceKeyDict.hasOwnProperty(script.primaryKey)) {
                            var sourceObj = utility_1.getSourceObjByKey(formaStoreData, script.primaryKey);
                            var scriptName = sourceObj.virtualName;
                            var scriptPath = eventFolderPath_1 + "/" + scriptName;
                            if (!fs.existsSync(scriptPath)) {
                                fs.writeFileSync(scriptPath, sourceObj.code);
                                // 同名のファイルがすでに存在する場合、ハッシュ値をファイル名に付与する
                            }
                            else {
                                scriptPath = eventFolderPath_1 + "/" + scriptName.replace('.js', '') + "_" + script.primaryKey.substr(0, 10) + ".js";
                                fs.writeFileSync(scriptPath, sourceObj.code);
                            }
                            addedSourceKeyDict[script.primaryKey] = script.primaryKey;
                        }
                    });
                }
            });
        });
        // shell.showItemInFolder(parseFileManagerPathStr(savePath));
    });
    return;
}
exports.doHandleAppIpcMainEvents = doHandleAppIpcMainEvents;
//# sourceMappingURL=ipc_main_process.js.map