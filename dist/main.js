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
const pdf_parse_1 = __importDefault(require("pdf-parse"));
let mainWindow = null;
electron_1.app.whenReady().then(() => {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    const indexPath = path.join(__dirname, 'index.html');
    console.log("🖥 Lade:", indexPath);
    mainWindow.loadFile(indexPath).catch(err => console.error("❌ Fehler beim Laden von index.html:", err));
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
    return __awaiter(this, void 0, void 0, function* () {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = yield (0, pdf_parse_1.default)(dataBuffer);
        // console.log("📄 Extrahierter PDF-Text:\n", pdfData.text);
        return parseTableData(pdfData.text);
    });
}
const DESCRIPTIONS = {
    HOME_OFFICE: "Home Office / Mobiles Arbeiten",
    FLEX_TIME: "Gleitzeitausgleich",
    SICK_LEAVE: "eAU",
    VACATION: "Urlaub",
    HOLIDAY: "Feiertag",
    OFFICE: "Büro"
};
// Beispielhafte Extraktion von Homeoffice- und Bürozeiten
function parseTableData(text) {
    let homeOfficeHours = 0, officeHours = 0, sickLeaveHours = 0, vacationHours = 0, flexTimeHours = 0, holidayHours = 0, otherHours = 0;
    const lines = text.split("\n");
    lines.forEach(line => {
        var _a;
        // beginnt mit beliebig viele ziffern, dann 2 buchstaben
        if (line.match(/^\d+[A-Z]{2}/)) {
            let date = ((_a = line.match(/^\d+[A-Z]{2}/)) === null || _a === void 0 ? void 0 : _a[0]) || "";
            const day = date.slice(-2);
            date = date.slice(0, -2);
            // alles nach day bis erste ziffer
            let description = line.split(day)[1];
            // alles nach description
            description = description.slice(0, description.search(/\d/)).trim();
            const firstPart = "" + date + day + description;
            const times = line.split(firstPart)[1];
            if (description === "") {
                description = DESCRIPTIONS.OFFICE;
            }
            console.log(`Datum: ${date}, Tag: ${day},  Beschreibung: ${description}`);
            console.log("Rest: ", times);
            let from, to, soll, prod, glz, hours = 0;
            if (DESCRIPTIONS.OFFICE === description || DESCRIPTIONS.HOME_OFFICE === description || DESCRIPTIONS.FLEX_TIME === description) {
                // '08:0216:177,007,500,50'
                from = times.substring(0, 5);
                to = times.substring(5, 10);
                soll = times.substring(10, 14);
                prod = times.substring(14, 18);
                glz = times.substring(18, times.length);
                // prod to deciamal
                hours = parseFloat((parseInt(prod.substring(0, 2)) + parseInt(prod.substring(3, 5)) / 60).toFixed(2));
                console.log(`Von: ${from}, Bis: ${to}, Soll: ${soll}, Prod: ${prod}, GLZ: ${glz}, Stunden: ${hours}`);
            }
            else if (DESCRIPTIONS.SICK_LEAVE === description || DESCRIPTIONS.VACATION === description || DESCRIPTIONS.HOLIDAY === description) {
                // '7,000,00'
                hours = 0;
            }
            else {
                console.log("Unbekannte Beschreibung: ", description);
            }
            if (description.includes(DESCRIPTIONS.HOME_OFFICE)) {
                homeOfficeHours += hours;
            }
            else if (description.includes(DESCRIPTIONS.FLEX_TIME)) {
                flexTimeHours += hours;
            }
            else if (description.includes(DESCRIPTIONS.SICK_LEAVE)) {
                sickLeaveHours += hours;
            }
            else if (description.includes(DESCRIPTIONS.VACATION)) {
                vacationHours += hours;
            }
            else if (description.includes(DESCRIPTIONS.HOLIDAY)) {
                holidayHours += hours;
            }
            else if (description.includes(DESCRIPTIONS.OFFICE)) {
                officeHours += hours;
            }
            else {
                otherHours += hours;
            }
        }
    });
    return { homeOfficeHours, officeHours, sickLeaveHours, vacationHours, flexTimeHours, holidayHours, otherHours };
}
