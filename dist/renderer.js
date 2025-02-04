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
document.getElementById('selectFolderBtn').addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const folderPath = yield window.electronAPI.selectFolder();
    if (folderPath) {
        document.getElementById('folderPath').value = folderPath;
    }
}));
document.getElementById('readPdfsBtn').addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const folderPath = document.getElementById('folderPath').value;
    if (!folderPath)
        return alert("Bitte einen Ordner wählen!");
    const pdfs = yield window.electronAPI.readPdfs(folderPath);
    const fileList = document.getElementById('fileList');
    const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
    fileList.innerHTML = "";
    resultsTable.innerHTML = "";
    pdfs.forEach((pdf) => {
        const listItem = document.createElement('li');
        listItem.textContent = pdf.filename;
        fileList.appendChild(listItem);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${pdf.filename}</td>
                         <td>${pdf.data.homeOfficeHours} Stunden</td>
                         <td>${pdf.data.officeHours} Stunden</td>`;
        resultsTable.appendChild(row);
    });
}));
