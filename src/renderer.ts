console.log("🚀 Renderer direkt in index.html gestartet!");

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM vollständig geladen!");

    const selectFolderBtn = document.getElementById("selectFolderBtn");
    const readPdfsBtn = document.getElementById('readPdfsBtn')

    if (!selectFolderBtn) {
        console.error("❌ FEHLER: `selectFolderBtn` wurde NICHT gefunden!");
        return;
    }

    if (!readPdfsBtn) {
        console.error("❌ FEHLER: `readPdfsBtn` wurde NICHT gefunden!");
        return;
    }

    selectFolderBtn.addEventListener("click", async () => {
        console.log("📂 Button wurde geklickt!");

        try {
            const folderPath = await (window as any).electronAPI.selectFolder();
            console.log("📁 Gewählter Ordner:", folderPath);

            if (folderPath) {
                (document.getElementById('folderPath') as HTMLInputElement).value = folderPath;
            }
        } catch (error) {
            console.error("❌ Fehler beim Öffnen des Dialogs:", error);
        }
    });

    readPdfsBtn.addEventListener('click', async () => {
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


