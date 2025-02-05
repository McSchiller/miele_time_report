import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from "pdf-parse"

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
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
ipcMain.handle('select-folder', async () => {
    console.log("📂 select-folder Event wurde ausgelöst!");

    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory']
    });

    console.log("📁 Gewählter Ordner:", result.filePaths[0] || "Keiner");
    return result.filePaths[0] || null;
});

// PDFs im Ordner analysieren
ipcMain.handle('read-pdfs', async (_, folderPath: string) => {
    console.log("📂 read-pdfs Event wurde ausgelöst!");
    const files = fs.readdirSync(folderPath);
    console.table(files);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    console.log("📄 PDF-Dateien:", files);
    const pdfData: { filename: string; data: { homeOfficeHours: number; officeHours: number } }[] = [];

    for (const file of pdfFiles) {
        const filePath = path.join(folderPath, file);
        const extractedData = await extractDataFromPdf(filePath);
        pdfData.push({ filename: file, data: extractedData });   
    }

    return pdfData;
});

// Funktion zur Datenextraktion mit pdf2json
async function extractDataFromPdf(filePath: string){
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // console.log("📄 Extrahierter PDF-Text:\n", pdfData.text);

    return parseTableData(pdfData.text);
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
function parseTableData(text: string): { homeOfficeHours: number; officeHours: number; sickLeaveHours: number; vacationHours: number; flexTimeHours: number; holidayHours: number; otherHours: number } {
    let homeOfficeHours = 0, officeHours = 0, sickLeaveHours = 0, vacationHours = 0, flexTimeHours = 0, holidayHours = 0, otherHours = 0;

    const lines = text.split("\n");

    lines.forEach(line => {
        // beginnt mit beliebig viele ziffern, dann 2 buchstaben
        if (line.match(/^\d+[A-Z]{2}/)) {
            let date = line.match(/^\d+[A-Z]{2}/)?.[0] || "";
            const day = date.slice(-2);
            date = date.slice(0, -2);

            // alles nach day bis erste ziffer
            let description = line.split(day)[1];
            // alles nach description
            
            description = description.slice(0, description.search(/\d/)).trim();
            const firstPart = ""+date+day+description

            const times = line.split(firstPart)[1]

            if(description === "") {
                description = DESCRIPTIONS.OFFICE;
            }
            
            
            console.log(`Datum: ${date}, Tag: ${day},  Beschreibung: ${description}`);
            console.log ("Rest: ",times)

            let from, to, soll, prod, glz, hours = 0;

            if( DESCRIPTIONS.OFFICE === description || DESCRIPTIONS.HOME_OFFICE === description || DESCRIPTIONS.FLEX_TIME === description) {
                // '08:0216:177,007,500,50'
                from = times.substring(0,5);
                to = times.substring(5,10);
                soll = times.substring(10,14);
                prod = times.substring(14,18);
                glz = times.substring(18,times.length);

                // prod to deciamal
                hours = parseFloat((parseInt(prod.substring(0,2)) + parseInt(prod.substring(3,5))/60).toFixed(2));

                console.log(`Von: ${from}, Bis: ${to}, Soll: ${soll}, Prod: ${prod}, GLZ: ${glz}, Stunden: ${hours}`);
            } else if (DESCRIPTIONS.SICK_LEAVE === description || DESCRIPTIONS.VACATION === description || DESCRIPTIONS.HOLIDAY === description) {
                // '7,000,00'
                hours = 0;
            } else {
                console.log("Unbekannte Beschreibung: ", description);
            }


            if (description.includes(DESCRIPTIONS.HOME_OFFICE)) {
                homeOfficeHours += hours;
            } else if (description.includes(DESCRIPTIONS.FLEX_TIME)) {
                flexTimeHours += hours;
            } else if (description.includes(DESCRIPTIONS.SICK_LEAVE)) {
                sickLeaveHours += hours;
            } else if (description.includes(DESCRIPTIONS.VACATION)) {
                vacationHours += hours;
            } else if (description.includes(DESCRIPTIONS.HOLIDAY)) {
                holidayHours += hours;
            } else if (description.includes(DESCRIPTIONS.OFFICE)) {
                officeHours += hours;
            } else {
                otherHours += hours;
            }
        }
    });

    return { homeOfficeHours, officeHours, sickLeaveHours, vacationHours, flexTimeHours, holidayHours, otherHours };
}