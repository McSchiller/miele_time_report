import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import PDFParser from 'pdf2json';

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

    mainWindow.loadFile('src/index.html');
});

// Ordnerauswahl
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory']
    });
    return result.filePaths[0] || null;
});

// PDFs im Ordner analysieren
ipcMain.handle('read-pdfs', async (_, folderPath: string) => {
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.pdf'));
    const pdfData: { filename: string; data: { homeOfficeHours: number; officeHours: number } }[] = [];

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const extractedData = await extractDataFromPdf(filePath);
        pdfData.push({ filename: file, data: extractedData });
    }

    return pdfData;
});

// Funktion zur Datenextraktion mit pdf2json
function extractDataFromPdf(filePath: string): Promise<{ homeOfficeHours: number; officeHours: number }> {
    return new Promise((resolve, reject) => {
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
