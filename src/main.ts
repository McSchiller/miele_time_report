import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import PDFParser from 'pdf2json';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
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
function extractDataFromPdf(filePath: string): Promise<{ homeOfficeHours: number; officeHours: number }> {
    return new Promise((resolve, reject) => {

        console.log("📄 PDF-Datei wird analysiert:", filePath);
        let pdfParser = new PDFParser();


        pdfParser.on("pdfParser_dataReady", pdfData => {
            const textBlocks: string[] = pdfData.formImage.Pages.flatMap((page: any) =>
                page.Texts.map((text: any) =>
                    decodeURIComponent(text.R.map((r: any) => r.T).join(' '))
                )
            );

            resolve(parseTableData(textBlocks));
        });

        pdfParser.on("pdfParser_dataError", err => reject(err));
        pdfParser.loadPDF(filePath);
    });
}

// Beispielhafte Extraktion von Homeoffice- und Bürozeiten
function parseTableData(textArray: string[]): { homeOfficeHours: number; officeHours: number } {
    let homeOfficeHours = 0, officeHours = 0;

    textArray.forEach(line => {
        if (line.includes("Homeoffice")) {
            let match = line.match(/(\d+,\d+|\d+) Stunden/);
            if (match) homeOfficeHours += parseFloat(match[1].replace(',', '.'));
        }
        if (line.includes("Office")) {
            let match = line.match(/(\d+,\d+|\d+) Stunden/);
            if (match) officeHours += parseFloat(match[1].replace(',', '.'));
        }
    });

    return { homeOfficeHours, officeHours };
}
