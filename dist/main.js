"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf2json_1 = __importDefault(require("pdf2json"));
let mainWindow = null;
electron_1.app.whenReady().then(() => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile('src/index.html');
});
// 📂 Ordner-Dialog öffnen
electron_1.ipcMain.handle('select-folder', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📂 select-folder Event wurde ausgelöst!");
    const result = yield electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    console.log("📁 Gewählter Ordner:", result.filePaths[0] || "Keiner");
    return result.filePaths[0] || null;
}));
// PDFs im Ordner analysieren
electron_1.ipcMain.handle('read-pdfs', (_, folderPath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📂 read-pdfs Event wurde ausgelöst!");
    const files = fs.readdirSync(folderPath);
    console.table(files);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    console.log("📄 PDF-Dateien:", files);
    const pdfData = [];
    for (const file of pdfFiles) {
        const filePath = path.join(folderPath, file);
        const extractedData = yield extractDataFromPdf(filePath);
        pdfData.push({ filename: file, data: extractedData });
    }
    return pdfData;
}));
// Funktion zur Datenextraktion mit pdf2json
function extractDataFromPdf(filePath) {
    return new Promise((resolve, reject) => {
        console.log("📄 PDF-Datei wird analysiert:", filePath);
        let pdfParser = new pdf2json_1.default();
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const textBlocks = pdfData.formImage.Pages.flatMap((page) => page.Texts.map((text) => decodeURIComponent(text.R.map((r) => r.T).join(' '))));
            resolve(parseTableData(textBlocks));
        });
        pdfParser.on("pdfParser_dataError", err => reject(err));
        pdfParser.loadPDF(filePath);
    });
}
// Beispielhafte Extraktion von Homeoffice- und Bürozeiten
function parseTableData(textArray) {
    let homeOfficeHours = 0, officeHours = 0;
    textArray.forEach(line => {
        if (line.includes("Homeoffice")) {
            let match = line.match(/(\d+,\d+|\d+) Stunden/);
            if (match)
                homeOfficeHours += parseFloat(match[1].replace(',', '.'));
        }
        if (line.includes("Office")) {
            let match = line.match(/(\d+,\d+|\d+) Stunden/);
            if (match)
                officeHours += parseFloat(match[1].replace(',', '.'));
        }
    });
    return { homeOfficeHours, officeHours };
}
