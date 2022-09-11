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
var electron_1 = require("electron");
var express = require("express");
var electron = require("electron");
var exporter_1 = require("./src/exporter");
var fs_1 = require("fs");
var IPCMain = electron.ipcMain;
var Port = 2342 || process.env.PORT;
var path = require('path');
var server = express();
server.listen(Port, function () {
    console.log("Listening to " + Port);
});
server.get("/editor", function (req, res) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});
server.get("/renderer.js", function (req, res) {
    res.sendFile(path.join(__dirname, '/views/renderer.js'));
});
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });
    win.menuBarVisible = false;
    win.loadURL("http://localhost:2342/editor");
}
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
IPCMain.on("export_pdf", function (event, args) { return __awaiter(void 0, void 0, void 0, function () {
    var options;
    return __generator(this, function (_a) {
        options = {
            //Placeholder 3
            filters: [
                { name: 'PDF', extensions: ['pdf'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        };
        electron_1.dialog.showSaveDialog(electron_1.BrowserWindow.getFocusedWindow(), options)
            .then(function (value) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!value.canceled) return [3 /*break*/, 2];
                        _a = fs_1.writeFileSync;
                        _b = [value.filePath];
                        return [4 /*yield*/, (0, exporter_1.export_pdf)(args)];
                    case 1:
                        _a.apply(void 0, _b.concat([_c.sent()]));
                        _c.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
IPCMain.on("export_docx", function (event, args) { return __awaiter(void 0, void 0, void 0, function () {
    var options;
    return __generator(this, function (_a) {
        options = {
            //Placeholder 3
            filters: [
                { name: 'Word Doc', extensions: ['docx'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        };
        electron_1.dialog.showSaveDialog(electron_1.BrowserWindow.getFocusedWindow(), options)
            .then(function (value) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!value.canceled) return [3 /*break*/, 2];
                        _a = fs_1.writeFileSync;
                        _b = [value.filePath];
                        return [4 /*yield*/, (0, exporter_1.export_docx)(args)];
                    case 1:
                        _a.apply(void 0, _b.concat([_c.sent()]));
                        _c.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); })
            .catch(function (reason) {
            electron_1.dialog.showErrorBox("Error", reason.toString());
        });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=main.js.map