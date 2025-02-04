document.getElementById('selectFolderBtn')!.addEventListener('click', async () => {
    const folderPath = await (window as any).electronAPI.selectFolder();
    if (folderPath) {
        (document.getElementById('folderPath') as HTMLInputElement).value = folderPath;
    }
});

document.getElementById('readPdfsBtn')!.addEventListener('click', async () => {
    const folderPath = (document.getElementById('folderPath') as HTMLInputElement).value;
    if (!folderPath) return alert("Bitte einen Ordner wählen!");

    const pdfs = await (window as any).electronAPI.readPdfs(folderPath);
    
    const fileList = document.getElementById('fileList')!;
    const resultsTable = document.getElementById('resultsTable')!.querySelector('tbody')!;

    fileList.innerHTML = "";
    resultsTable.innerHTML = "";

    pdfs.forEach((pdf: { filename: string; data: { homeOfficeHours: number; officeHours: number } }) => {
        const listItem = document.createElement('li');
        listItem.textContent = pdf.filename;
        fileList.appendChild(listItem);

        const row = document.createElement('tr');
        row.innerHTML = `<td>${pdf.filename}</td>
                         <td>${pdf.data.homeOfficeHours} Stunden</td>
                         <td>${pdf.data.officeHours} Stunden</td>`;
        resultsTable.appendChild(row);
    });
});
