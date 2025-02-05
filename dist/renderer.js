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
console.log("🚀 Renderer direkt in index.html gestartet!");
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM vollständig geladen!");
    const selectFolderBtn = document.getElementById("selectFolderBtn");
    const readPdfsBtn = document.getElementById('readPdfsBtn');
    if (!selectFolderBtn) {
        console.error("❌ FEHLER: `selectFolderBtn` wurde NICHT gefunden!");
        return;
    }
    if (!readPdfsBtn) {
        console.error("❌ FEHLER: `readPdfsBtn` wurde NICHT gefunden!");
        return;
    }
    selectFolderBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("📂 Button wurde geklickt!");
        try {
            const folderPath = yield window.electronAPI.selectFolder();
            console.log("📁 Gewählter Ordner:", folderPath);
            if (folderPath) {
                document.getElementById('folderPath').value = folderPath;
            }
        }
        catch (error) {
            console.error("❌ Fehler beim Öffnen des Dialogs:", error);
        }
    }));
    readPdfsBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const folderPath = document.getElementById('folderPath').value;
        if (!folderPath)
            return alert("Bitte einen Ordner wählen!");
        const pdfs = yield window.electronAPI.readPdfs(folderPath);
        console.log("📄 PDFs:", pdfs);
        const fileList = document.getElementById('fileList');
        const resultsTable = document.getElementById('resultsTable');
        fileList.innerHTML = "";
        resultsTable.innerHTML = "";
        pdfs.forEach((pdf) => {
            const listItem = document.createElement('li');
            listItem.textContent = pdf.filename;
            fileList.appendChild(listItem);
            const monthSum = pdf.data.homeOfficeHours + pdf.data.officeHours;
            const homeOfficeHoursAverage = (pdf.data.homeOfficeHours / monthSum * 100).toFixed(2);
            const officeHoursAverage = (pdf.data.officeHours / monthSum * 100).toFixed(2);
            const row = document.createElement('tr');
            row.innerHTML = `<td>${pdf.filename}</td>
                            <td>${pdf.data.homeOfficeHours} Stunden  ( ${homeOfficeHoursAverage} % )</td>
                            <td>${pdf.data.officeHours} Stunden ( ${officeHoursAverage} % )</td>`;
            resultsTable.appendChild(row);
        });
    }));
});
// console.log("🚀 Renderer gestartet!");
// document.addEventListener("DOMContentLoaded", () => {
//     console.log("✅ DOM vollständig geladen!");
//     const selectFolderBtn = document.getElementById("selectFolderBtn");
//     if (!selectFolderBtn) {
//         console.error("❌ FEHLER: `selectFolderBtn` wurde NICHT gefunden!");
//         return;
//     }
//     console.log("✅ Button gefunden!");
//     selectFolderBtn.addEventListener("click", async () => {
//         console.log("📂 Button wurde geklickt!");
//         const folderPath = await (window as any).electronAPI.selectFolder();
//         console.log("📁 Gewählter Ordner:", folderPath);
//         if (folderPath) {
//             (document.getElementById("folderPath") as HTMLInputElement).value = folderPath;
//         }
//     });
//     // document.getElementById('readPdfsBtn')!.addEventListener('click', async () => {
//     //     const folderPath = (document.getElementById('folderPath') as HTMLInputElement).value;
//     //     if (!folderPath) return alert("Bitte einen Ordner wählen!");
//     //     const pdfs = await (window as any).electronAPI.readPdfs(folderPath);
//     //     const fileList = document.getElementById('fileList')!;
//     //     const resultsTable = document.getElementById('resultsTable')!.querySelector('tbody')!;
//     //     fileList.innerHTML = "";
//     //     resultsTable.innerHTML = "";
//     //     pdfs.forEach((pdf: { filename: string; data: { homeOfficeHours: number; officeHours: number } }) => {
//     //         const listItem = document.createElement('li');
//     //         listItem.textContent = pdf.filename;
//     //         fileList.appendChild(listItem);
//     //         const row = document.createElement('tr');
//     //         row.innerHTML = `<td>${pdf.filename}</td>
//     //                          <td>${pdf.data.homeOfficeHours} Stunden</td>
//     //                          <td>${pdf.data.officeHours} Stunden</td>`;
//     //         resultsTable.appendChild(row);
//     //     });
//     // });
// });
